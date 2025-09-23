import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import prisma

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
    // --- Updated Recommendations Logic ---
    if (recommendations) {
      const [movieResponse, seriesResponse, usersResponse] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`, options),
        fetch(`https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`, options),
        prisma.user.findMany({
          where: {
            username: {
              contains: query,
              mode: 'insensitive',
            },
          },
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
          take: 5,
        }),
      ]);

      const movieData = await movieResponse.json();
      const seriesData = await seriesResponse.json();
  
      const movies = movieData.results.slice(0, 5).map(item => ({ 
        id: item.id,
        name: item.title,
        poster_path: item.poster_path,
        media_type: 'movie' 
      }));
      const series = seriesData.results.slice(0, 5).map(item => ({
        id: item.id,
        name: item.name,
        poster_path: item.poster_path,
        media_type: 'tv' 
      }));
      const users = usersResponse.map(item => ({
        id: item.id,
        name: item.username,
        avatarUrl: item.avatarUrl,
        media_type: 'user'
      }));

      const allRecommendations = [...users, ...movies, ...series];
      
      return NextResponse.json(allRecommendations);
    }

    // --- Main Search Logic (Movies, Series, and Users) ---
    const [movieResponse, seriesResponse, usersResponse] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`, options),
      fetch(`https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`, options),
      prisma.user.findMany({
        where: {
          username: {
            contains: query,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
        take: 20,
      }),
    ]);

    const movieData = await movieResponse.json();
    const seriesData = await seriesResponse.json();

    const movies = movieData.results.map(item => ({ ...item, media_type: 'movie' }));
    const series = seriesData.results.map(item => ({ ...item, media_type: 'tv' }));
    const users = usersResponse.map(item => ({...item, media_type: 'user'}));

    // Combine and sort results (you might want a more sophisticated sorting logic)
    const results = [...users, ...movies, ...series];
    results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    return NextResponse.json(results);

  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ message: "Error fetching search results" }, { status: 500 });
  }
}