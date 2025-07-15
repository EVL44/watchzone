'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import Link from 'next/link';

export default function TopRatedMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('/api/movies/top-rated');
        if (!response.ok) {
          throw new Error('Failed to fetch top rated movies');
        }
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setMovies(data);
        }

      } catch (error) {
        console.error("Failed to fetch top rated movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-white text-2xl">Loading movies...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ul className="space-y-4">
        {movies.map((movie, index) => (
          <li key={movie.id}>
            <Link href={`/movie/${movie.id}`}>
              <div className="bg-background rounded-lg overflow-hidden p-4 flex items-start transform hover:bg-stone-700 transition-colors duration-300 ease-in-out cursor-pointer">
                <div className="w-12 text-center text-2xl font-bold text-gray-400 pt-2">{index + 1}</div>
                <div className="w-24 h-36 relative flex-shrink-0">
                  <Image 
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
                <div className="flex-1 ml-4">
                  <h3 className="text-white font-bold text-xl">{movie.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{new Date(movie.release_date).getFullYear()}</p>
                  <p className="text-gray-300 text-sm mt-2 line-clamp-3">{movie.overview}</p>
                </div>
                <div className="flex items-center gap-2 text-xl pl-4">
                  <FaStar className="text-yellow-400" />
                  <span className="text-white font-bold">{movie.vote_average.toFixed(1)}</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}