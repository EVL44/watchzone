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
    },
    next: { revalidate: 86400 } // Cache for 24 hours
  };

  try {
    // Fetch 5 pages (100 top-rated movies)
    const pagesToFetch = Array.from({ length: 5 }, (_, i) => i + 1);

    const fetchPromises = pagesToFetch.map(page =>
      fetch(`https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=${page}`, options)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch page ${page}: ${res.statusText}`);
          return res.json();
        })
    );

    const results = await Promise.allSettled(fetchPromises);
    const pagesData = results.filter(r => r.status === 'fulfilled').map(r => r.value);

    const allMovies = [];
    const movieIds = new Set();

    pagesData.forEach(pageData => {
      if (pageData.results) {
        pageData.results.forEach(movie => {
          if (!movieIds.has(movie.id)) {
            movieIds.add(movie.id);
            allMovies.push(movie);
          }
        });
      }
    });

    return NextResponse.json(allMovies);

  } catch (error) {
    console.error("Error fetching top-rated movies:", error.message);
    return NextResponse.json({ message: "Error fetching data from TMDB.", details: error.message }, { status: 500 });
  }
}