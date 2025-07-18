'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import Link from 'next/link';

export default function TopRatedSeries() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await fetch('/api/series/top-rated');
        if (!response.ok) {
          throw new Error('Failed to fetch top rated series');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setSeries(data);
        }
      } catch (error) {
        console.error("Failed to fetch top rated series:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeries();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {Array.from({ length: 15 }).map((_, index) => (
          <div key={index} className="bg-stone-800 rounded-lg p-4 flex items-start animate-pulse">
            <div className="w-12 h-12 bg-stone-700 rounded-md"></div>
            <div className="w-24 h-36 bg-stone-700 rounded-md ml-4"></div>
            <div className="flex-1 ml-4 space-y-3">
              <div className="h-6 bg-stone-700 rounded w-3/4"></div>
              <div className="h-4 bg-stone-700 rounded w-1/4"></div>
              <div className="h-4 bg-stone-700 rounded w-full"></div>
              <div className="h-4 bg-stone-700 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ul className="space-y-4">
        {series.map((item, index) => (
          <li key={item.id}>
            {/* FIX: The link now correctly points to the '/serie/' path */}
            <Link href={`/serie/${item.id}`}>
              <div className="bg-background rounded-lg overflow-hidden p-4 flex items-start transform hover:bg-secondary transition-colors duration-300 ease-in-out cursor-pointer group">
                <div className="w-12 text-center text-2xl font-bold text-gray-400 pt-2 flex-shrink-0">{index + 1}</div>
                <div className="w-24 h-36 relative flex-shrink-0 ml-4">
                  <Image 
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={item.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
                <div className="flex-1 ml-4">
                  <h3 className="text-foreground font-bold text-xl group-hover:text-primary transition-colors">{item.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A'}</p>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-3">{item.overview}</p>
                </div>
                <div className="flex items-center gap-2 text-xl pl-4">
                  <FaStar className="text-yellow-400" />
                  <span className="text-foreground font-bold">{item.vote_average.toFixed(1)}</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}