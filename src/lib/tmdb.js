const TMDB_TOKEN = process.env.TMDB_API_TOKEN;

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_TOKEN}`
  }
};

/**
 * Fetch detailed info (including genres & overview) for a specific TMDB ID
 */
export async function getTMDBDetails(id, type = 'movie') {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/${type}/${id}?language=en-US`, options);
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error(`TMDB Details Error (${type}/${id}):`, err);
    return null;
  }
}

/**
 * Search TMDB for a specific title and return top match
 */
export async function searchTMDB(query, type = 'multi') {
  try {
    const url = `https://api.themoviedb.org/3/search/${type}?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
    const response = await fetch(url, options);
    if (!response.ok) return null;
    const data = await response.json();
    return data.results || [];
  } catch (err) {
    console.error(`TMDB Search Error (${query}):`, err);
    return [];
  }
}
