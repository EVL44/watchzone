// src/app/api/trending/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const timeWindow = searchParams.get('time_window') || 'day'; // 'day' or 'week'
  const token = process.env.TMDB_API_TOKEN;

  if (!token) {
    return NextResponse.json({ message: 'TMDB API token not found.' }, { status: 500 });
  }

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const response = await fetch(`https://api.themoviedb.org/3/trending/all/${timeWindow}?language=en-US`, options);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("TMDB API Error:", response.status, errorBody);
      return NextResponse.json({ message: "Failed to fetch data from TMDB." }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data.results);

  } catch (error) {
    console.error("Error fetching trending content:", error);
    return NextResponse.json({ message: "An internal server error occurred." }, { status: 500 });
  }
}
