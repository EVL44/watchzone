'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import Link from 'next/link';
import PosterGridSkeleton from './PosterGridSkeleton'; // 1. Import skeleton

export default function PopularMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('/api/movies');
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setMovies(data);
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
    // 2. Use PosterGridSkeleton
    return (
      <div className='xl:mx-40'>
        <h2 className="text-3xl font-bold text-foreground mb-6">Popular Movies</h2>
        <PosterGridSkeleton count={10} />
      </div>
    );
  }

  return (
    <div className='xl:mx-40'>
      <h2 className="text-3xl font-bold text-foreground mb-6">Popular Movies</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <Link href={`/movie/${movie.id}`} key={movie.id}>
            <div className="bg-secondary rounded-lg overflow-hidden transform transition-transform duration-300 ease-in-out cursor-pointer group">
              <Image 
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  width={500}
                  height={750}
                  className="w-full h-auto"
                  unoptimized={true} 
              />
              <div className="p-4">
                <h3 className="text-foreground font-bold text-lg truncate group-hover:text-primary transition-colors">{movie.title}</h3>
                <div className="flex items-center justify-between text-gray-500 text-sm mt-2">
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}