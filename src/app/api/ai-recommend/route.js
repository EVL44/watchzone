import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { geminiModel } from '@/lib/gemini';
import { searchTMDB, getTMDBDetails } from '@/lib/tmdb';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tmdbId, type, title, overview } = await req.json();
    if (!tmdbId || !type || !title) {
      return NextResponse.json({ error: 'Missing required media data' }, { status: 400 });
    }

    // 1. If overview is missing, fetch it from TMDB to give Gemini better context
    let mediaOverview = overview;
    if (!mediaOverview) {
      const details = await getTMDBDetails(tmdbId, type);
      mediaOverview = details?.overview || "No description available.";
    }

    // 2. Ask Gemini for 5 recommendations with reasons
    const prompt = `
      You are an expert film and TV critic. A user just finished watching a ${type} titled "${title}".
      The description of this ${type} is: "${mediaOverview}"
      
      Recommend exactly 5 highly similar movies or TV shows they should watch next. 
      For each recommendation, provide the exact title, the media type ("movie" or "tv"), and a single compelling sentence explaining why it's a good follow-up.
      
      Respond ONLY with a raw JSON array of objects. Do not include markdown blocks.
      Example format:
      [
        { "title": "Interstellar", "type": "movie", "reason": "It shares the same mind-bending science fiction themes." }
      ]
    `;

    const result = await geminiModel.generateContent(prompt);
    let aiRecs = [];
    try {
      let rawText = result.response.text().trim();
      
      const startIdx = rawText.indexOf('[');
      const endIdx = rawText.lastIndexOf(']');
      
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        rawText = rawText.slice(startIdx, endIdx + 1);
      }
      
      aiRecs = JSON.parse(rawText);
    } catch (e) {
      console.error("Failed to parse Gemini recommendations:", e.message);
      return NextResponse.json({ error: 'Failed to generate AI recommendations' }, { status: 500 });
    }

    if (!Array.isArray(aiRecs) || aiRecs.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    // 3. Fetch posters and real TMDB IDs for Gemini's suggestions
    const recommendationPromises = aiRecs.map(async (rec) => {
      const tmdbResults = await searchTMDB(rec.title, rec.type === 'movie' ? 'movie' : 'tv');
      
      // Ensure we don't recommend the exact same movie they just watched
      const validMatch = tmdbResults.find(item => item.id !== parseInt(tmdbId));
      
      if (validMatch) {
        return {
          id: validMatch.id,
          media_type: validMatch.media_type || rec.type,
          title: validMatch.title || validMatch.name,
          poster_path: validMatch.poster_path,
          reason: rec.reason
        };
      }
      return null;
    });

    const enrichedRecs = await Promise.all(recommendationPromises);
    const validRecs = enrichedRecs.filter(r => r !== null);

    return NextResponse.json({ recommendations: validRecs.slice(0, 5) });

  } catch (error) {
    console.error('AI Recommend Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
