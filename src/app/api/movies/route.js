// app/api/movies/route.js

import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.TMDB_API_TOKEN;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const response = await fetch('https://api.themoviedb.org/3/movie/popular', options);
    const data = await response.json();
    
    // FIX: Return the data.results array directly
    return NextResponse.json(data.results); 

  } catch (error) {
    return NextResponse.json({ message: "Error fetching data" }, { status: 500 });
  }
}