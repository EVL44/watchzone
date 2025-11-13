// src/app/api/movies/recommendations/[id]/route.js

import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id } = params;
  const token = process.env.TMDB_API_TOKEN;
  
  if (!token) {
    return NextResponse.json({ message: "TMDB API token not found." }, { status: 500 });
  }

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  };

  try {
    // Use the "movie" endpoint instead of "tv"
    const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/recommendations?language=en-US`, options);
    
    if (!response.ok) {
        return NextResponse.json({ message: `Error fetching recommendations for movie ID: ${id}` }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data.results || []); // Return results or empty array
  
  } catch (error) {
    return NextResponse.json({ message: "An internal server error occurred." }, { status: 500 });
  }
}