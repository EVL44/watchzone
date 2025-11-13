'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';

export default function Recommendations({ tmdbId, mediaType }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/${mediaType}/recommendations/${tmdbId}`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.slice(0, 12)); // Get top 12
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [tmdbId, mediaType]);

  if (loading) return <div>Loading recommendations...</div>;
  if (items.length === 0) return null; // Don't show section if no recommendations

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-foreground mb-4">You Might Also Like</h2>
      <div className="flex overflow-x-auto gap-5 pb-4 custom-scrollbar">
        {items.map((item) => {
          const title = item.title || item.name;
          const href = `/${mediaType === 'movies' ? 'movie' : 'serie'}/${item.id}`;
          
          return (
            <Link href={href} key={item.id}>
              <div className="bg-secondary rounded-lg overflow-hidden w-40 flex-shrink-0 transform hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer group">
                <Image 
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={title}
                  width={160}
                  height={240}
                  className="w-full h-auto"
                  unoptimized={true} 
                />
                <div className="p-3">
                  <h3 className="text-foreground font-bold text-sm truncate group-hover:text-primary transition-colors">{title}</h3>
                  <div className="flex items-center justify-between text-gray-500 text-xs mt-1">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      <span>{item.vote_average.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="absolute top-12 right-0 bottom-0 w-16 bg-gradient-to-l from-background pointer-events-none"></div>
    </div>
  );
}