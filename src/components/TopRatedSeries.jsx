'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FaStar, FaBookmark, FaHeart, FaList } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AddToListModal from '@/components/AddToListModal';
import SkeletonLoader from '@/components/SkeletonLoader';

export default function TopRatedSeries() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, updateUserContext } = useAuth();
  const router = useRouter();

  const [showAddToList, setShowAddToList] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchAllSeries = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/series/top-rated');
        if (!response.ok) throw new Error('Failed to fetch top rated series');
        const data = await response.json();

        const seriesWithStatus = data.map(s => ({
          ...s,
          isFavorite: user?.favoriteSeries?.some(m => m.tmdbId === s.id) || false,
          isWatchlisted: user?.watchlistSeries?.some(m => m.tmdbId === s.id) || false,
        }));
        setSeries(seriesWithStatus);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllSeries();
  }, []); // Removed 'user' from the dependency array

  const handleListAction = useCallback(async (serie, listType) => {
    if (!user) return router.push('/login');

    const itemType = 'series';
    const currentStatus = listType === 'favorites' ? serie.isFavorite : serie.isWatchlisted;
    const action = currentStatus ? 'remove' : 'add';

    setSeries(prevSeries => prevSeries.map(s => 
      s.id === serie.id ? { ...s, [listType === 'favorites' ? 'isFavorite' : 'isWatchlisted']: !currentStatus } : s
    ));

    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: serie.id, itemType, listType, action }),
      });
      const updatedUser = await res.json();
      if (!res.ok) throw new Error('Failed to update list');
      updateUserContext(updatedUser);
    } catch (error) {
      console.error(error);
      setSeries(prevSeries => prevSeries.map(s => 
        s.id === serie.id ? { ...s, [listType === 'favorites' ? 'isFavorite' : 'isWatchlisted']: currentStatus } : s
      ));
    }
  }, [user, router, updateUserContext]);

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <>
      {showAddToList && <AddToListModal item={selectedItem} itemType="series" onClose={() => setShowAddToList(false)} />}
      <div className="max-w-4xl mx-auto">
        <ul className="space-y-4">
          {series.map((item, index) => (
            <li key={`${item.id}-${index}`} className="bg-surface rounded-lg overflow-hidden p-4 flex items-start group">
              <div className="w-12 text-center text-2xl font-bold text-foreground/50 pt-2 flex-shrink-0">{index + 1}</div>
              <Link href={`/serie/${item.id}`} className="w-24 h-36 relative flex-shrink-0">
                <Image 
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </Link>
              <div className="flex-1 ml-4">
                <Link href={`/serie/${item.id}`}><h3 className="text-foreground font-bold text-xl hover:text-primary transition-colors">{item.name}</h3></Link>
                <p className="text-foreground/70 text-sm mt-1">{item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A'}</p>
                <div className="flex items-center gap-2 text-lg mt-2">
                  <FaStar className="text-yellow-400" />
                  <span className="text-foreground font-bold">{item.vote_average.toFixed(1)}</span>
                </div>
                <p className="text-foreground/70 text-sm mt-2 line-clamp-2">{item.overview}</p>
              </div>
              <div className="flex flex-col items-center justify-start gap-3 pl-4">
                  <button onClick={() => handleListAction(item, 'watchlist')} className={`p-2 rounded-full transition-colors ${item.isWatchlisted ? 'bg-primary text-white' : 'bg-secondary text-foreground/70 hover:text-primary'}`} title="Add to Watchlist"><FaBookmark /></button>
                  <button onClick={() => handleListAction(item, 'favorites')} className={`p-2 rounded-full transition-colors ${item.isFavorite ? 'bg-primary text-white' : 'bg-secondary text-foreground/70 hover:text-primary'}`} title="Add to Favorites"><FaHeart /></button>
                  <button onClick={() => { setSelectedItem(item); setShowAddToList(true); }} className="p-2 rounded-full bg-secondary text-foreground/70 hover:text-primary transition-colors" title="Add to List"><FaList /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}