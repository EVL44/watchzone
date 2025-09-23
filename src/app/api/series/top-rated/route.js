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
    // Create an array of page numbers to fetch (15 pages * 20 results/page = 300)
    const pagesToFetch = Array.from({ length: 15 }, (_, i) => i + 1);

    const fetchPromises = pagesToFetch.map(page =>
      fetch(`https://api.themoviedb.org/3/tv/top_rated?language=en-US&page=${page}`, options)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch page ${page}: ${res.statusText}`);
          return res.json();
        })
    );

    const pagesData = await Promise.all(fetchPromises);
    const allSeries = [];
    const seriesIds = new Set();

    pagesData.forEach(pageData => {
      if (pageData.results) {
        pageData.results.forEach(series => {
          if (!seriesIds.has(series.id)) {
            seriesIds.add(series.id);
            allSeries.push(series);
          }
        });
      }
    });

    return NextResponse.json(allSeries);
  } catch (error) {
    console.error("Error fetching top-rated series:", error.message);
    return NextResponse.json({ message: "Error fetching data from TMDB.", details: error.message }, { status: 500 });
  }
}