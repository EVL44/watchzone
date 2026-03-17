'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import cloudinaryLoader from '@/lib/cloudinaryLoader';
import { FaSearch, FaFilm, FaTv, FaMagic, FaSpinner } from 'react-icons/fa';

export default function SmartSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!res.ok) {
        throw new Error('Failed to perform AI search');
      }

      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
      setError('AI Search is currently unavailable. Please try standard search.');
    } finally {
      setIsSearching(false);
    }
  };

  const navigateToResult = (item) => {
    if (item.media_type === 'movie') {
      router.push(`/movie/${item.id}`);
    } else if (item.media_type === 'tv') {
      router.push(`/serie/${item.id}`);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-8 p-4 bg-surface rounded-xl shadow-lg border border-primary/20">
      <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2 text-primary">
        <FaMagic className="text-purple-400" /> AI Smart Search
      </h2>
      <p className="text-foreground/70 mb-6 text-sm md:text-base">
        Describe what you want to watch in natural language. Try: "a gritty 90s detective movie" or "something like Stranger Things but scarier".
      </p>

      <form onSubmit={handleSearch} className="relative w-full mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask the AI for a recommendation..."
          className="w-full bg-background text-foreground placeholder-foreground/50 border border-secondary rounded-full py-3 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isSearching}
        />
        <button 
          type="submit" 
          disabled={isSearching || !query.trim()}
          className="absolute inset-y-0 right-0 flex items-center justify-center px-4 bg-primary text-white rounded-r-full hover:bg-opacity-80 transition-opacity disabled:opacity-50"
        >
          {isSearching ? <FaSpinner className="animate-spin" /> : <FaSearch />}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

      {isSearching && (
        <div className="flex flex-col items-center justify-center py-8 text-primary">
          <FaSpinner className="animate-spin text-4xl mb-4" />
          <p className="animate-pulse">Gemini is analyzing your request...</p>
        </div>
      )}

      {!isSearching && results.length > 0 && (
        <div className="space-y-3 mt-4">
          <h3 className="font-semibold text-foreground/90 border-b border-secondary pb-2 mb-4">Gemini Recommendations:</h3>
          {results.map((item, index) => (
            <div 
              key={`${item.id}-${index}`}
              onClick={() => navigateToResult(item)}
              className="flex items-center gap-4 p-3 bg-background hover:bg-secondary rounded-lg cursor-pointer transition-colors border border-transparent hover:border-primary/30"
            >
              <div className="w-12 h-16 flex-shrink-0 bg-secondary rounded overflow-hidden relative">
                {item.poster_path ? (
                  <Image 
                    src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} 
                    alt={item.title || item.name} 
                    layout="fill" 
                    objectFit="cover" 
                    loader={cloudinaryLoader}
                  />
                ) : (
                   <div className="w-full h-full flex items-center justify-center">
                     {item.media_type === 'movie' ? <FaFilm className="text-foreground/30" /> : <FaTv className="text-foreground/30" />}
                   </div>
                )}
              </div>
              <div className="flex-grow">
                <h4 className="font-bold text-foreground">{item.title || item.name}</h4>
                <div className="flex items-center gap-2 text-sm text-foreground/60 mt-1">
                  <span className="capitalize">{item.media_type === 'tv' ? 'Series' : 'Movie'}</span>
                  <span>•</span>
                  <span>{(item.release_date || item.first_air_date || 'N/A').substring(0,4)}</span>
                  {item.fromLocalDb && (
                    <>
                      <span>•</span>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">In Database</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isSearching && results.length === 0 && query && !error && (
        <p className="text-center text-foreground/60 py-4">No specific matches found. Try adjusting your description.</p>
      )}
    </div>
  );
}
