'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/search?query=${query}`);
        const data = await response.json();
        setMovies(data);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [query]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-white text-2xl">Searching...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-white text-center mb-12">
        Search Results for "{query}"
      </h1>
      {movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => {
            // --- FIX STARTS HERE ---
            // 1. Check if release_date exists and is valid before creating a Date object.
            const releaseYear = movie.release_date && !isNaN(new Date(movie.release_date))
              ? new Date(movie.release_date).getFullYear()
              : 'N/A';

            // 2. Provide a fallback for the poster path if it's null.
            const posterPath = movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : '/placeholder-image.png'; // Make sure you have a placeholder image in your public folder
            // --- FIX ENDS HERE ---

            // Only render the movie card if it has a poster
            if (!movie.poster_path) {
              return null;
            }

            return (
              <Link href={`/movie/${movie.id}`} key={movie.id}>
                <div className="bg-stone-800 rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer">
                  <Image
                    src={posterPath}
                    alt={movie.title}
                    width={500}
                    height={750}
                    className="w-full h-auto"
                  />
                  <div className="p-4">
                    <h3 className="text-white font-bold text-lg truncate">{movie.title}</h3>
                    <div className="flex items-center justify-between text-gray-400 text-sm mt-2">
                      <span>{releaseYear}</span>
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-400" />
                        <span>{movie.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-400">No results found for "{query}".</p>
      )}
    </div>
  );
}