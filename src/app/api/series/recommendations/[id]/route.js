import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id } = params;
  const token = process.env.TMDB_API_TOKEN;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const response = await fetch(`https://api.themoviedb.org/3/tv/${id}/recommendations?language=en-US`, options);
    const data = await response.json();
    return NextResponse.json(data.results || []);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching series recommendations" }, { status: 500 });
  }
}