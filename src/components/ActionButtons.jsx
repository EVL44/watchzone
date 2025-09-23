'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaBookmark, FaHeart, FaList } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import AddToListModal from '@/components/AddToListModal';

export default function ActionButtons({ item, itemType }) {
  const { user, updateUserContext } = useAuth();
  const router = useRouter();

  // Initial state from props
  const [isFavorite, setIsFavorite] = useState(item.isFavorite);
  const [isWatchlisted, setIsWatchlisted] = useState(item.isWatchlisted);
  
  const [showAddToList, setShowAddToList] = useState(false);

  const handleListAction = useCallback(async (listType) => {
    if (!user) return router.push('/login');

    const currentStatus = listType === 'favorites' ? isFavorite : isWatchlisted;
    const action = currentStatus ? 'remove' : 'add';

    // Optimistic UI update
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
      // Revert UI on failure
      if (listType === 'favorites') setIsFavorite(currentStatus);
      else setIsWatchlisted(currentStatus);
    }
  }, [user, router, updateUserContext, item.id, itemType, isFavorite, isWatchlisted]);

  if (!user) {
    return null; // Don't show buttons if user is not logged in
  }

  return (
    <>
      {showAddToList && <AddToListModal item={item} itemType={itemType} onClose={() => setShowAddToList(false)} />}
      <div className="flex flex-col items-center justify-start gap-3 pl-4">
        <button onClick={() => handleListAction('watchlist')} className={`p-2 rounded-full transition-colors ${isWatchlisted ? 'bg-primary text-white' : 'bg-secondary text-foreground/70 hover:text-primary'}`} title="Add to Watchlist"><FaBookmark /></button>
        <button onClick={() => handleListAction('favorites')} className={`p-2 rounded-full transition-colors ${isFavorite ? 'bg-primary text-white' : 'bg-secondary text-foreground/70 hover:text-primary'}`} title="Add to Favorites"><FaHeart /></button>
        <button onClick={() => setShowAddToList(true)} className="p-2 rounded-full bg-secondary text-foreground/70 hover:text-primary transition-colors" title="Add to List"><FaList /></button>
      </div>
    </>
  );
}