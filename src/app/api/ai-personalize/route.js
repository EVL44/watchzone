import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { geminiModel } from '@/lib/gemini';
import { getTMDBDetails, searchTMDB } from '@/lib/tmdb';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch user's recent history locally
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        favoriteMovies: { take: 5 },
        favoriteSeries: { take: 5 },
        watchedMovies: { take: 10 },
        watchedSeries: { take: 10 }
      }
    });

    if (!user) {
      console.log('AI Personalize: User not found in DB');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const watchedIds = [...user.watchedMovies.map(m => m.tmdbId), ...user.watchedSeries.map(s => s.tmdbId)];
    const likedIds = [...user.favoriteMovies.map(m => m.tmdbId), ...user.favoriteSeries.map(s => s.tmdbId)];
    
    // We need some history to personalize
    if (watchedIds.length === 0 && likedIds.length === 0) {
      return NextResponse.json({ categories: [], message: 'No watch history to personalize.' });
    }

    // Mix and deduplicate recent IDs
    const historyIds = Array.from(new Set([...likedIds, ...watchedIds])).slice(0, 15);

    // 2. Fetch TMDB details (genres/overviews) to feed Gemini
    const metadataPromises = historyIds.map(async (id) => {
      // Since we mixed movies and series, we blindly try movie first, fallback to tv
      let details = await getTMDBDetails(id, 'movie');
      if (!details) details = await getTMDBDetails(id, 'tv');
      
      if (details) {
        return {
          title: details.title || details.name,
          genres: details.genres?.map(g => g.name).join(', '),
        };
      }
      return null;
    });

    const enrichedHistory = (await Promise.all(metadataPromises)).filter(h => h !== null);
    
    if (enrichedHistory.length === 0) {
       console.log('AI Personalize: No enriched history found');
       return NextResponse.json({ categories: [] });
    }

    const historyText = enrichedHistory.map(h => `"${h.title}" (Genres: ${h.genres})`).join('\n');
    console.log('AI Personalize: Built history text for Gemini', historyText);

    // 3. Ask Gemini to create 2 personalized categories
    const prompt = `
      You are an expert streaming platform curator. 
      A user has recently watched and liked the following content:
      ${historyText}
      
      Based heavily on the themes and genres of these titles, create exactly 2 unique, highly specific recommendation categories. 
      Examples of good specific categories: "Because you liked Interstellar", "Gritty 90s Crime Dramas", "Feel-good Ensemble Comedies".
      
      For each category, provide exactly 4 highly relevant movie or TV show recommendations (titles only).
      
      Respond ONLY with a raw JSON array of objects. Do not include markdown blocks.
      Example format:
      [
        {
          "categoryName": "Space Epics",
          "titles": ["Gravity", "Ad Astra", "Apollo 13", "The Martian"]
        }
      ]
    `;

    // Using the heavily optimized Flash model to prevent 429 Quota Rate Limits
    console.log('AI Personalize: Calling Gemini model');
    const result = await geminiModel.generateContent(prompt);
    let aiCategories = [];
    try {
      let rawText = result.response.text().trim();
      console.log('AI Personalize: Raw Gemini output:', rawText);
      
      // Extract everything between the first [ and the last ]
      const startIdx = rawText.indexOf('[');
      const endIdx = rawText.lastIndexOf(']');
      
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        rawText = rawText.slice(startIdx, endIdx + 1);
      }
      
      aiCategories = JSON.parse(rawText);
      console.log('AI Personalize: Parsed categories:', JSON.stringify(aiCategories, null, 2));
    } catch (e) {
      console.error("Failed to parse Gemini Categories:", e.message);
      return NextResponse.json({ error: 'Failed to generate personalized rows' }, { status: 500 });
    }

    // 4. Resolve the recommended titles into real TMDB objects for rendering
    console.log('AI Personalize: Mapping titles to TMDB');
    const resolvedCategories = await Promise.all((aiCategories || []).map(async (cat) => {
      if (!cat.titles || !Array.isArray(cat.titles)) {
        console.log('AI Personalize: Skipping category without titles array', cat);
        return { categoryName: cat.categoryName || 'Unknown', items: [] };
      }
      const titlePromises = cat.titles.map(async (title) => {
         const tmdbResults = await searchTMDB(title, 'multi');
         const validMatch = tmdbResults.find(item => item.media_type === 'movie' || item.media_type === 'tv');
         if (validMatch) {
            return {
              id: validMatch.id,
              media_type: validMatch.media_type,
              title: validMatch.title || validMatch.name,
              poster_path: validMatch.poster_path,
              vote_average: validMatch.vote_average
            };
         }
         return null;
      });
      
      const resolvedTitles = await Promise.all(titlePromises);
      return {
        categoryName: cat.categoryName,
        items: resolvedTitles.filter(t => t !== null)
      };
    }));

    // Filter out categories that failed to map any titles
    const finalCategories = resolvedCategories.filter(cat => cat.items.length > 0);

    return NextResponse.json({ categories: finalCategories });

  } catch (error) {
    console.error('AI Personalize Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
