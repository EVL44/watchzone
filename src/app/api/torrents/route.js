import { NextResponse } from 'next/server';

// Force dynamic to ensure this route isn't statically cached at build time
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imdbId = searchParams.get('imdbId');

  if (!imdbId) {
    return NextResponse.json({ message: 'IMDB ID is required' }, { status: 400 });
  }

  try {
    // Log for server-side debugging
    console.log(`Fetching torrents for IMDB ID: ${imdbId}`);

    // Fetch from YTS API
    // YTS often blocks requests without a proper User-Agent header
    const response = await fetch(`https://yts.mx/api/v2/list_movies.json?query_term=${imdbId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      },
      // Ensure we don't cache errors or empty results too aggressively
      cache: 'no-store' 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`YTS API failed with status: ${response.status}`, errorText);
      throw new Error(`YTS API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Log success
    if(data.status === 'ok' && data.data.movie_count > 0) {
        console.log(`Found movie: ${data.data.movies[0].title}`);
    } else {
        console.log('No movies found in YTS for this ID');
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Torrent Fetch Error:', error);
    // Return a 200 OK with an empty data structure to prevent the frontend from crashing
    // This allows the UI to simply say "No links found" instead of throwing an error
    return NextResponse.json({ 
        status: 'error', 
        status_message: error.message,
        data: { movie_count: 0, movies: [] } 
    });
  }
}