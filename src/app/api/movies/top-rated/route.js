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
    let allMovies = [];
    const movieIds = new Set();
    // Fetch 15 pages to get approximately 300 movies
    for (let page = 1; page <= 15; page++) {
      const response = await fetch(`https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=${page}`, options);
      const data = await response.json();
      if (data.results) {
        data.results.forEach(movie => {
          if (!movieIds.has(movie.id)) {
            movieIds.add(movie.id);
            allMovies.push(movie);
          }
        });
      }
    }
    
    return NextResponse.json(allMovies);

  } catch (error) {
    return NextResponse.json({ message: "Error fetching data" }, { status: 500 });
  }
}