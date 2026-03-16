import Image from 'next/image';
import cloudinaryLoader from '@/lib/cloudinaryLoader';
import { FaStar } from 'react-icons/fa';
import Link from 'next/link';

async function getPopularMovies() {
  const token = process.env.TMDB_API_TOKEN;
  if (!token) return [];
    
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`
    },
    // Cache for 1 hour to improve performance
    next: { revalidate: 3600 }
  };

  try {
    const response = await fetch('https://api.themoviedb.org/3/movie/popular', options);
    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Failed to fetch popular movies:", error);
    return [];
  }
}

export default async function PopularMovies() {
  const movies = await getPopularMovies();

  if (!movies || movies.length === 0) {
    return null; // Silent fail if no data
  }

  return (
    <div className='xl:mx-40'>
      <h2 className="text-3xl font-bold text-foreground mb-6">Popular Movies</h2>
      <div className="grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
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
