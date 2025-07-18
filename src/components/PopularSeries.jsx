'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import Link from 'next/link';

export default function PopularSeries() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await fetch('/api/series'); // This API call is correct
        const data = await response.json();
        if (Array.isArray(data)) {
          setSeries(data);
        }
      } catch (error) {
        console.error("Failed to fetch series:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeries();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="bg-secondary rounded-lg animate-pulse">
            <div className="w-full h-64 sm:h-80 md:h-96 bg-stone-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {series.map((item) => (
        // FIX: The link now correctly points to the '/serie/' path
        <Link href={`/serie/${item.id}`} key={item.id}>
          <div className="bg-secondary rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer group">
            <Image 
              src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
              alt={item.name}
              width={500}
              height={750}
              className="w-full h-auto"
            />
            <div className="p-4">
              <h3 className="text-foreground font-bold text-lg truncate group-hover:text-primary transition-colors">{item.name}</h3>
              <div className="flex items-center justify-between text-gray-500 text-sm mt-2">
                <span>{item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A'}</span>
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-400" />
                  <span>{item.vote_average.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}