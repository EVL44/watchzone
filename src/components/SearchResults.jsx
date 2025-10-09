'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaTv, FaFilm, FaUserCircle } from 'react-icons/fa';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/search?query=${query}`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <p className="text-foreground text-2xl">Searching...</p>
        </div>
    );
  }

  const renderItem = (item) => {
    switch(item.media_type) {
      case 'movie':
      case 'tv':
        const isMovie = item.media_type === 'movie';
        const title = isMovie ? item.title : item.name;
        const releaseDate = isMovie ? item.release_date : item.first_air_date;
        const releaseYear = releaseDate && !isNaN(new Date(releaseDate)) ? new Date(releaseDate).getFullYear() : 'N/A';
        const posterPath = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null;
        
        if (!posterPath) return null;

        return (
          <Link href={`/${isMovie ? 'movie' : 'serie'}/${item.id}`} key={`${item.id}-${item.media_type}`}>
            <div className="bg-secondary rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer group">
              <div className="relative aspect-[2/3]">
                <Image src={posterPath} alt={title} layout="fill" objectFit="cover" unoptimized={true}/>
              </div>
              <div className="p-3">
                <h3 className="text-foreground font-bold text-md truncate group-hover:text-primary">{title}</h3>
                <div className="flex items-center justify-between text-gray-400 text-sm mt-2">
                  <span>{releaseYear}</span>
                  <div className="flex items-center gap-1">
                    {isMovie ? <FaFilm /> : <FaTv />}
                    <FaStar className="text-yellow-400 ml-2" />
                    <span>{item.vote_average.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      
      case 'user':
        return (
          <Link href={`/user/${item.username}`} key={item.id}>
             <div className="bg-secondary rounded-lg p-4 flex flex-col items-center justify-center text-center transform hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer group aspect-[2/3]">
                <div className="w-24 h-24 rounded-full bg-primary flex-shrink-0 overflow-hidden relative mb-4">
                  {item.avatarUrl ? (
                    <Image src={item.avatarUrl} alt={item.username} layout="fill" objectFit="cover" unoptimized={true} />
                  ) : (
                    <FaUserCircle className="w-full h-full text-white" />
                  )}
                </div>
                <h3 className="text-foreground font-bold text-lg truncate group-hover:text-primary">{item.username}</h3>
             </div>
          </Link>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <h1 className="text-3xl font-extrabold text-foreground text-center mb-12">
        Search Results for "<span className='text-primary font-bold'>{query}</span>"
      </h1>
      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {results.map(renderItem)}
        </div>
      ) : (
        <p className="text-center text-gray-500">No results found for "{query}".</p>
      )}
    </>
  );
}
