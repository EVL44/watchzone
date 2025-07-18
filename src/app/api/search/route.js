// src/app/api/search/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const recommendations = searchParams.get('recommendations');
  const token = process.env.TMDB_API_TOKEN;

  if (!query) {
    return NextResponse.json({ message: 'Query parameter is required' }, { status: 400 });
  }

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  };

  try {
    // Logic for fetching search recommendations for the search bar dropdown
    if (recommendations) {
      const [keywordsResponse, collectionsResponse] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/search/keyword?query=${encodeURIComponent(query)}&page=1`, options),
        fetch(`https://api.themoviedb.org/3/search/collection?query=${encodeURIComponent(query)}&page=1`, options)
      ]);
      const keywordsData = await keywordsResponse.json();
      const collectionsData = await collectionsResponse.json();
      
      return NextResponse.json({ 
        keywords: keywordsData.results.slice(0, 5), 
        collections: collectionsData.results.slice(0, 5) 
      });
    }

    // --- FIX: Re-added the main search logic ---
    // Fetch both movies and series for the main search results page
    const [movieResponse, seriesResponse] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`, options),
      fetch(`https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`, options)
    ]);

    const movieData = await movieResponse.json();
    const seriesData = await seriesResponse.json();

    // Add a media_type to distinguish between movies and series
    const movies = movieData.results.map(item => ({ ...item, media_type: 'movie' }));
    const series = seriesData.results.map(item => ({ ...item, media_type: 'tv' }));

    const results = [...movies, ...series];

    // Sort results by popularity
    results.sort((a, b) => b.popularity - a.popularity);

    return NextResponse.json(results);
    // --- End of FIX ---

  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ message: "Error fetching search results" }, { status: 500 });
  }
}
