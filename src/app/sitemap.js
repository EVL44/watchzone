// src/app/sitemap.js

// IMPORTANT: Change this to your app's production domain
const siteUrl = 'https://watchzone.dev';

/**
 * This file generates a sitemap.xml for your site.
 * A sitemap helps search engines like Google discover all your pages,
 * especially dynamic ones like movie and series details.
 */
export default async function sitemap() {
  const token = process.env.TMDB_API_TOKEN;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    // Use 'force-cache' or 'revalidate' to avoid fetching on every request
    next: { revalidate: 3600 }, // Revalidate once per hour
  };

  // 1. Fetch popular movies
  const moviesRes = await fetch('https://api.themoviedb.org/3/movie/popular', options);
  const moviesData = await moviesRes.json();
  const movieUrls = moviesData.results.map(movie => ({
    url: `${siteUrl}/movie/${movie.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 2. Fetch popular series
  const seriesRes = await fetch('https://api.themoviedb.org/3/tv/popular', options);
  const seriesData = await seriesRes.json();
  const seriesUrls = seriesData.results.map(series => ({
    url: `${siteUrl}/serie/${series.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. Define your static routes
  const staticRoutes = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/top-rated/movies`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/top-rated/series`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 4. Combine all URLs
  return [
    ...staticRoutes,
    ...movieUrls,
    ...seriesUrls,
  ];
}