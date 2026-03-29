import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/session';
import { geminiModel } from '@/lib/gemini';
import { searchTMDB } from '@/lib/tmdb';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid query' }, { status: 400 });
    }

    // 1. Ask Gemini to extract keywords and 5 reference movie/series titles
    const prompt = `
      You are a movie and TV show recommendation expert.
      A user is searching for: "${query}"
      
      Extract the intent to provide exactly 5 well-known movie or TV series titles that match their request.
      
      Respond ONLY with a raw JSON array of strings containing just the titles. 
      Do not include markdown blocks, explanations, or any other text.
      Example response: ["Inception", "The Matrix", "Interstellar", "Shutter Island", "Tenet"]
    `;

    console.log("AI Search: Querying Gemini for ->", query);
    const result = await geminiModel.generateContent(prompt);
    let titles = [];
    try {
      let rawText = result.response.text().trim();
      
      const startIdx = rawText.indexOf('[');
      const endIdx = rawText.lastIndexOf(']');
      
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        rawText = rawText.slice(startIdx, endIdx + 1);
      }
      
      titles = JSON.parse(rawText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", e.message);
      return NextResponse.json({ error: 'Failed to process AI recommendation' }, { status: 500 });
    }

    if (!Array.isArray(titles) || titles.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // 2. Fetch from TMDB & DB concurrently for all suggested titles
    const searchPromises = titles.map(async (title) => {
      // Find in local DB first to prioritize existing watched/favorites
      let localMatch = null;
      try {
        const [movieMatch, seriesMatch] = await Promise.all([
          prisma.movie.findFirst({ where: { title: { contains: title, mode: 'insensitive' } } }),
          prisma.series.findFirst({ where: { name: { contains: title, mode: 'insensitive' } } })
        ]);
        
        if (movieMatch) {
          return {
            id: movieMatch.tmdbId,
            media_type: 'movie',
            title: movieMatch.title,
            poster_path: movieMatch.posterPath,
            release_date: movieMatch.releaseDate,
            fromLocalDb: true
          };
        } else if (seriesMatch) {
          return {
            id: seriesMatch.tmdbId,
            media_type: 'tv',
            name: seriesMatch.name,
            poster_path: seriesMatch.posterPath,
            first_air_date: seriesMatch.firstAirDate,
            fromLocalDb: true
          };
        }
      } catch (err) {
        console.error("Prisma search error:", err);
      }

      // Fallback: search TMDB directly
      const tmdbResults = await searchTMDB(title, 'multi');
      const validMedia = tmdbResults.find(item => item.media_type === 'movie' || item.media_type === 'tv');
      return validMedia || null;
    });

    const rawResults = await Promise.all(searchPromises);
    
    // 3. Clean up and deduplicate results
    const validResults = rawResults.filter(r => r !== null);
    
    const uniqueResults = [];
    const seenIds = new Set();
    
    for (const item of validResults) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        uniqueResults.push(item);
      }
    }

    return NextResponse.json({ results: uniqueResults.slice(0, 5) });

  } catch (error) {
    console.error('AI Search Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
