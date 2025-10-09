import { NextResponse } from 'next/server';

export async function GET() {
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
    // Fetch popular TV shows from TMDB
    const response = await fetch('https://api.themoviedb.org/3/tv/popular?language=en-US&page=1', options);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("TMDB API Error:", response.status, errorBody);
      return NextResponse.json({ message: "Failed to fetch data from TMDB." }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data.results);

  } catch (error) {
    console.error("Error fetching popular series:", error);
    return NextResponse.json({ message: "An internal server error occurred." }, { status: 500 });
  }
}