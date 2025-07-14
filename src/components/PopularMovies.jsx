// app/components/PopularMovies.js

'use client';

import { useState, useEffect } from 'react';

export default function PopularMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('/api/movies');
        const data = await response.json();
        
        // FIX: Access the .results property from the data
        if (data.results) {
          setMovies(data.results);
        }

      } catch (error) {
        console.error("Failed to fetch movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return <p>Loading movies...</p>;
  }

  // Render movies only if it's a valid array
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.isArray(movies) && movies.map((movie) => (
        <div key={movie.id} className="bg-gray-800 rounded-lg overflow-hidden">
          {/* Your movie card content */}
          <h3 className="p-4 text-white font-bold">{movie.title}</h3>
        </div>
      ))}
    </div>
  );
}