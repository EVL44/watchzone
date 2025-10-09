// app/api/movies/route.js

import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.TMDB_API_TOKEN;
  
  if (!token) {
    return NextResponse.json({ message: "Server configuration error: Missing API token." }, { status: 500 });
  }
    
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const response = await fetch('https://api.themoviedb.org/3/movie/popular', options);
    
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("TMDB API Error:", response.status, errorBody);
        return NextResponse.json({ message: "Failed to fetch data from TMDB." }, { status: response.status });
    }
      
    const data = await response.json();
    
    // FIX: Return the data.results array directly
    return NextResponse.json(data.results); 

  } catch (error) {
    return NextResponse.json({ message: "Error fetching data" }, { status: 500 });
  }
}