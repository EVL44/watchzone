// src/components/Trending.jsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaStar } from 'react-icons/fa';

export default function Trending() {
  const [trending, setTrending] = useState([]);
  const [timeWindow, setTimeWindow] = useState('day');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/trending?time_window=${timeWindow}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setTrending(data);
        }
      } catch (error) {
        console.error("Failed to fetch trending content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [timeWindow]);

  const handleTimeWindowChange = (newTimeWindow) => {
    setTimeWindow(newTimeWindow);
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <h2 className="text-3xl font-bold text-foreground mr-6">Trending</h2>
        <div className="flex border border-primary rounded-full">
          <button
            onClick={() => handleTimeWindowChange('day')}
            className={`px-4 py-1 rounded-full ${timeWindow === 'day' ? 'bg-primary text-white' : 'text-primary'}`}
          >
            Today
          </button>
          <button
            onClick={() => handleTimeWindowChange('week')}
            className={`px-4 py-1 rounded-full ${timeWindow === 'week' ? 'bg-primary text-white' : 'text-primary'}`}
          >
            This Week
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="bg-secondary rounded-lg animate-pulse">
              <div className="w-full h-64 sm:h-80 md:h-96 bg-stone-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {trending.map((item) => {
            const isMovie = item.media_type === 'movie';
            const title = isMovie ? item.title : item.name;
            const releaseDate = isMovie ? item.release_date : item.first_air_date;
            
            return (
              <Link href={`/${isMovie ? 'movie' : 'serie'}/${item.id}`} key={item.id}>
                <div className="bg-secondary rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer group">
                  <Image 
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={title}
                      width={500}
                      height={750}
                      className="w-full h-auto"
                      unoptimized={true} 
                  />
                  <div className="p-4">
                    <h3 className="text-foreground font-bold text-lg truncate group-hover:text-primary transition-colors">{title}</h3>
                    <div className="flex items-center justify-between text-gray-500 text-sm mt-2">
                      <span>{releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'}</span>
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-400" />
                        <span>{item.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  );
}
