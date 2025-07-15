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

  if (!token) {
    console.error('TMDB_API_TOKEN is not set in the environment variables.');
    return NextResponse.json({ message: "Server configuration error: Missing API token." }, { status: 500 });
  }

  try {
    // Create an array of page numbers to fetch
    const pagesToFetch = Array.from({ length: 15 }, (_, i) => i + 1);

    // Create an array of fetch promises
    const fetchPromises = pagesToFetch.map(page =>
      fetch(`https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=${page}`, options)
        .then(res => {
          if (!res.ok) {
            // If any request fails, we'll know which one and why
            throw new Error(`Failed to fetch page ${page}: ${res.statusText}`);
          }
          return res.json();
        })
    );

    // Wait for all promises to resolve
    const pagesData = await Promise.all(fetchPromises);

    const allMovies = [];
    const movieIds = new Set();

    // Process the results from all pages
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
    // Send a more specific error message to the client
    return NextResponse.json({ message: "Error fetching data from TMDB.", details: error.message }, { status: 500 });
  }
}