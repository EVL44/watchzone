'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import cloudinaryLoader from '@/lib/cloudinaryLoader';
import { FaMagic, FaSpinner, FaStar, FaFilm, FaTv } from 'react-icons/fa';

export default function PersonalizedSection({ user }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPersonalization = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/ai-personalize');
        if (!res.ok) throw new Error('Failed to fetch AI personalization');
        const data = await res.json();
        
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalization();
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="xl:mx-40 mx-auto px-4 my-10 space-y-8 animate-pulse">
        <div className="h-8 bg-surface rounded w-64 mb-6 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent flex items-center">
             <span className="text-primary/50 text-xs font-bold px-2 whitespace-nowrap"><FaMagic className="inline mr-1"/> Generating AI Categories...</span>
           </div>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-36 h-56 bg-surface rounded-md shrink-0"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || categories.length === 0) return null;

  return (
    <div className="xl:mx-40 mx-auto px-4 my-12 space-y-12">
      {categories.map((category, index) => (
        <div key={index} className="relative">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
             <FaMagic className="text-primary text-xl" />
             <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
               {category.categoryName}
             </span>
          </h2>
          
          <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-4 custom-scrollbar">
            {category.items.map((item) => (
              <Link 
                href={item.media_type === 'tv' ? `/serie/${item.id}` : `/movie/${item.id}`} 
                key={item.id}
                className="group relative w-36 sm:w-44 lg:w-48 xl:w-56 shrink-0 aspect-[2/3] rounded-lg overflow-hidden bg-secondary transition-transform duration-300 hover:scale-105 shadow-lg border border-transparent hover:border-primary/50"
              >
                {item.poster_path ? (
                  <Image 
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
                    alt={item.title} 
                    layout="fill" 
                    objectFit="cover" 
                    loader={cloudinaryLoader}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                    {item.media_type === 'movie' ? <FaFilm className="text-4xl text-foreground/30 mb-2" /> : <FaTv className="text-4xl text-foreground/30 mb-2" />}
                    <span className="text-xs text-foreground/70">{item.title}</span>
                  </div>
                )}
                
                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold text-sm line-clamp-2">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <FaStar className="text-yellow-400 text-xs" />
                    <span className="text-white text-xs font-bold">{item.vote_average ? item.vote_average.toFixed(1) : 'NR'}</span>
                    <span className="text-white/50 text-[10px] uppercase ml-auto">{item.media_type}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
