'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import cloudinaryLoader from '@/lib/cloudinaryLoader';
import { FaMagic, FaSpinner, FaFilm, FaTv } from 'react-icons/fa';

export default function AIRecommendations({ tmdbId, type, title, overview }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAIRecs = async () => {
      try {
        const res = await fetch('/api/ai-recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tmdbId, type, title, overview })
        });
        
        if (!res.ok) throw new Error('Failed to fetch AI recommendations');
        
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      } catch (err) {
        console.error(err);
        setError("AI couldn't generate recommendations at this time.");
      } finally {
        setLoading(false);
      }
    };

    if (tmdbId && title) {
      fetchAIRecs();
    }
  }, [tmdbId, type, title, overview]);

  if (loading) {
    return (
      <div className="my-8 bg-surface/50 rounded-xl p-6 border border-primary/10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-primary">
          <FaMagic className="text-purple-400" /> AI Recommendations
        </h2>
        <div className="flex flex-col items-center justify-center py-12 text-primary/70">
           <FaSpinner className="animate-spin text-4xl mb-4" />
           <p className="animate-pulse">Gemini is analyzing {title}...</p>
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null; // Fail gracefully by hiding the section, standard recommendations will still show
  }

  return (
    <div className="my-10 bg-gradient-to-tr from-surface to-background rounded-xl p-6 shadow-xl border border-primary/20 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-primary relative z-10">
        <FaMagic className="text-purple-400" /> Because you watched {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
        {recommendations.map((rec) => (
          <Link 
            href={rec.media_type === 'tv' ? `/serie/${rec.id}` : `/movie/${rec.id}`} 
            key={rec.id}
            className="group flex gap-4 bg-background/80 hover:bg-secondary/80 p-3 rounded-lg border border-transparent hover:border-primary/30 transition-all duration-300"
          >
            <div className="w-20 sm:w-24 aspect-[2/3] relative flex-shrink-0 rounded overflow-hidden shadow-md">
                {rec.poster_path ? (
                  <Image 
                    src={`https://image.tmdb.org/t/p/w154${rec.poster_path}`} 
                    alt={rec.title} 
                    layout="fill" 
                    objectFit="cover" 
                    className="group-hover:scale-110 transition-transform duration-500"
                    loader={cloudinaryLoader}
                  />
                ) : (
                   <div className="w-full h-full bg-secondary flex items-center justify-center">
                     {rec.media_type === 'movie' ? <FaFilm className="text-foreground/30" /> : <FaTv className="text-foreground/30" />}
                   </div>
                )}
            </div>
            
            <div className="flex flex-col justify-center">
               <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">{rec.title}</h3>
               <div className="text-xs uppercase tracking-wider text-foreground/50 mb-2">{rec.media_type === 'tv' ? 'Series' : 'Movie'}</div>
               <p className="text-sm text-foreground/70 italic line-clamp-3 leading-relaxed border-l-2 border-primary/30 pl-3 py-1">
                 "{rec.reason}"
               </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
