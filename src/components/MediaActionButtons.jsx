'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaBookmark, FaHeart, FaList, FaPlay } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import AddToListModal from '@/components/AddToListModal';
import TrailerModal from '@/components/TrailerModal';

export default function MediaActionButtons({ item, itemType, initialFavorite, initialWatchlisted, trailer }) {
  const { user, updateUserContext } = useAuth();
  const router = useRouter();

  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isWatchlisted, setIsWatchlisted] = useState(initialWatchlisted);
  const [showAddToList, setShowAddToList] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  // Update status if user logs in/out while on the page
  useEffect(() => {
    setIsFavorite(initialFavorite);
    setIsWatchlisted(initialWatchlisted);
  }, [initialFavorite, initialWatchlisted]);

  const handleListAction = useCallback(async (listType) => {
    if (!user) return router.push('/login');

    const currentStatus = listType === 'favorites' ? isFavorite : isWatchlisted;
    const action = currentStatus ? 'remove' : 'add';

    if (listType === 'favorites') setIsFavorite(!currentStatus);
    else setIsWatchlisted(!currentStatus);

    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, itemType, listType, action }),
      });
      if (!res.ok) throw new Error('Failed to update list');
      const updatedUser = await res.json();
      updateUserContext(updatedUser);
    } catch (error) {
      console.error(error);
      if (listType === 'favorites') setIsFavorite(currentStatus);
      else setIsWatchlisted(currentStatus);
    }
  }, [user, router, updateUserContext, item.id, itemType, isFavorite, isWatchlisted]);

  return (
    <>
      {showTrailer && <TrailerModal trailerKey={trailer?.key} onClose={() => setShowTrailer(false)} />}
      {showAddToList && <AddToListModal item={item} itemType={itemType} onClose={() => setShowAddToList(false)} />}
      
      <div className="flex items-center gap-4 mt-6">
        {user && (
          <>
            <button onClick={() => handleListAction('watchlist')} className={`bg-stone-700 font-bold p-3 rounded-full transition-colors ${isWatchlisted ? 'text-primary' : 'text-white hover:text-primary'}`} title="Add to Watchlist"><FaBookmark /></button>
            <button onClick={() => handleListAction('favorites')} className={`bg-stone-700 font-bold p-3 rounded-full transition-colors ${isFavorite ? 'text-primary' : 'text-white hover:text-primary'}`} title="Add to Favorites"><FaHeart /></button>
            <button onClick={() => setShowAddToList(true)} className="bg-stone-700 text-white hover:text-primary font-bold p-3 rounded-full transition-colors" title="Add to List"><FaList /></button>
          </>
        )}
        {trailer && <button onClick={() => setShowTrailer(true)} className="flex items-center gap-2 bg-primary hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg transition-colors"><FaPlay /><span>Watch Trailer</span></button>}
      </div>
    </>
  );
}