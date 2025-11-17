'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import MediaGrid from '@/components/MediaGrid';
import PosterGridSkeleton from "../../components/PosterGridSkeleton";

export default function WatchlistPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [combinedWatchlist, setCombinedWatchlist] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    
    if (user) {
      // Combine movies and series from the user object in context
      const movies = user.watchlistMovies || [];
      const series = user.watchlistSeries || [];
      setCombinedWatchlist([...movies, ...series]);
    }
  }, [user, loading, router]);

  // Show skeleton while auth is loading
  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-foreground mb-8">
          My Watchlist
        </h1>
        <PosterGridSkeleton count={12} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-foreground mb-8">
        My Watchlist
      </h1>
      <MediaGrid items={combinedWatchlist} title="" />
      {combinedWatchlist.length === 0 && (
        <p className="text-foreground/70">
          You haven&apos;t added anything to your watchlist yet.
        </p>
      )}
    </div>
  );
}