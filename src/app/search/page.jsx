'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';
import SearchResults from '@/components/SearchResults';
import SmartSearch from '@/components/SmartSearch';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('query') || '';
  const [searchInput, setSearchInput] = useState(initialQuery);

  useEffect(() => {
    setSearchInput(searchParams.get('query') || '');
  }, [searchParams]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchInput.trim() !== '') {
      router.push(`/search?query=${searchInput.trim()}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 1. AI Smart Search Component */}
      <SmartSearch />
      
      {/* Mobile search bar */}
      <div className="md:hidden relative mb-6">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-foreground/50">
          <FaSearch size={16} />
        </span>
        <input
          type="text"
          placeholder="Search movies, series, users..."
          className="w-full bg-secondary text-foreground placeholder-foreground/50 rounded-full py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearch}
          autoFocus
        />
      </div>

      {initialQuery ? (
        <SearchResults />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaSearch className="text-foreground/20 mb-4" size={48} />
          <h2 className="text-xl font-bold text-foreground/60 mb-2">Search WatchZone</h2>
          <p className="text-foreground/40 text-sm max-w-sm">Find your favorite movies, TV series, and other users.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center text-foreground text-2xl py-20">Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}