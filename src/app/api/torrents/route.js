import { NextResponse } from 'next/server';

// Force dynamic to ensure this route isn't statically cached at build time
export const dynamic = 'force-dynamic';

// List of YTS mirrors to try in order
const YTS_MIRRORS = [
  'https://yts.mx',
  'https://yts.nz',
  'https://yts.lt',
  'https://yts.do',
  'https://yts.ag'
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imdbId = searchParams.get('imdbId');
  const title = searchParams.get('title');
  const year = searchParams.get('year');

  if (!imdbId && !title) {
    return NextResponse.json({ message: 'IMDB ID or Title is required' }, { status: 400 });
  }

  // Helper: Try fetching from mirrors until one works
  const fetchFromYTS = async (query) => {
    let lastError = null;

    for (const domain of YTS_MIRRORS) {
      try {
        // Construct URL carefully
        const url = `${domain}/api/v2/list_movies.json?query_term=${encodeURIComponent(query)}`;
        console.log(`Attempting fetch from: ${domain} with query: ${query}`);

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json'
          },
          // Set a timeout to fail fast if a mirror is stuck
          signal: AbortSignal.timeout(4000), 
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`Status ${response.status}`);
        }

        const data = await response.json();
        
        // If successful and valid JSON structure, return immediately
        if (data && data.status === 'ok') {
            return data;
        }
        
      } catch (error) {
        console.warn(`Failed to fetch from ${domain}: ${error.message}`);
        lastError = error;
        // Continue to the next mirror...
      }
    }
    
    // If all mirrors failed
    throw lastError || new Error("All YTS mirrors failed");
  };

  try {
    // 1. Try searching by IMDB ID first (Most accurate)
    let searchTerm = imdbId || title;
    let data = await fetchFromYTS(searchTerm);

    // 2. Fallback: If ID search returned 0 results, try searching by Title
    // This happens if YTS hasn't linked the IMDB ID to their torrent entry yet
    if (data.data.movie_count === 0 && title && imdbId) {
        console.log(`No results for ID ${imdbId}, falling back to title: "${title}"`);
        data = await fetchFromYTS(title);

        // 3. Strict Filter: Match the Year to avoid wrong movies (e.g. Remakes)
        if (data.data.movies && year) {
            const targetYear = parseInt(year);
            const filteredMovies = data.data.movies.filter(m => 
                m.year === targetYear || m.year === targetYear - 1 || m.year === targetYear + 1
            );
            
            // Only replace data if we found a matching year
            if (filteredMovies.length > 0) {
                data.data.movies = filteredMovies;
                data.data.movie_count = filteredMovies.length;
            }
        }
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Torrent API Error:', error);
    // Return safe empty structure so frontend doesn't crash
    return NextResponse.json({ 
        status: 'error', 
        status_message: error.message || 'Fetch failed',
        data: { movie_count: 0, movies: [] } 
    });
  }
}