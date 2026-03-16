'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaBookmark, FaHeart, FaList, FaPlay, FaDownload, FaEye } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import AddToListModal from '@/components/AddToListModal';
import TrailerModal from '@/components/TrailerModal';
import DownloadModal from '@/components/DownloadModal';
import StarRating from '@/components/StarRating';

export default function MediaActionButtons({ item, itemType, initialFavorite, initialWatchlisted, initialWatched, trailer, ratingData }) {
  const { user, updateUserContext } = useAuth();
  const router = useRouter();

  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isWatchlisted, setIsWatchlisted] = useState(initialWatchlisted);
  const [isWatched, setIsWatched] = useState(initialWatched);
  const [showAddToList, setShowAddToList] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    setIsFavorite(initialFavorite);
    setIsWatchlisted(initialWatchlisted);
    setIsWatched(initialWatched);
  }, [initialFavorite, initialWatchlisted, initialWatched]);

  const handleListAction = useCallback(async (listType) => {
    if (!user) return router.push('/login');

    const statusMap = { favorites: isFavorite, watchlist: isWatchlisted, watched: isWatched };
    const currentStatus = statusMap[listType];
    const action = currentStatus ? 'remove' : 'add';

    if (listType === 'favorites') setIsFavorite(!currentStatus);
    else if (listType === 'watchlist') setIsWatchlisted(!currentStatus);
    else if (listType === 'watched') setIsWatched(!currentStatus);

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
      else if (listType === 'watchlist') setIsWatchlisted(currentStatus);
      else if (listType === 'watched') setIsWatched(currentStatus);
    }
  }, [user, router, updateUserContext, item.id, itemType, isFavorite, isWatchlisted, isWatched]);

  // Extract Release Year safely
  const releaseYear = item.release_date ? new Date(item.release_date).getFullYear() : null;
  const apiMediaType = itemType === 'movie' ? 'movie' : 'series';

  return (
    <>
      {showTrailer && <TrailerModal trailerKey={trailer?.key} onClose={() => setShowTrailer(false)} />}
      {showAddToList && <AddToListModal item={item} itemType={itemType} onClose={() => setShowAddToList(false)} />}
      
      {showDownload && (
        <DownloadModal 
            imdbId={item.imdb_id} 
            title={item.title || item.name} 
            year={releaseYear}
            onClose={() => setShowDownload(false)} 
        />
      )}
      
      <div className="w-full md:w-auto">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
          {user && (
            <>
              <button onClick={() => handleListAction('watchlist')} className={`bg-stone-700 font-bold p-3 rounded-full transition-colors ${isWatchlisted ? 'text-primary' : 'text-white hover:text-primary'}`} title="Add to Watchlist"><FaBookmark /></button>
              <button onClick={() => handleListAction('favorites')} className={`bg-stone-700 font-bold p-3 rounded-full transition-colors ${isFavorite ? 'text-primary' : 'text-white hover:text-primary'}`} title="Add to Favorites"><FaHeart /></button>
              <button onClick={() => handleListAction('watched')} className={`bg-stone-700 font-bold p-3 rounded-full transition-colors ${isWatched ? 'text-green-400' : 'text-white hover:text-green-400'}`} title="Mark as Watched"><FaEye /></button>
              <button onClick={() => setShowAddToList(true)} className="bg-stone-700 text-white hover:text-primary font-bold p-3 rounded-full transition-colors" title="Add to List"><FaList /></button>
            </>
          )}
          
          {trailer && (
              <button onClick={() => setShowTrailer(true)} className="flex items-center justify-center gap-2 bg-primary hover:bg-opacity-80 text-white font-bold py-3 px-6 md:py-2 md:px-4 rounded-lg transition-colors w-full sm:w-auto">
                  <FaPlay /><span>Trailer</span>
              </button>
          )}

          {itemType === 'movie' && (
              <button onClick={() => setShowDownload(true)} className="flex items-center justify-center gap-2 bg-secondary hover:bg-stone-600 text-white font-bold py-3 px-6 md:py-2 md:px-4 rounded-lg transition-colors w-full sm:w-auto">
                  <FaDownload /><span>Download</span>
              </button>
          )}
        </div>

        {/* Star Rating */}
        <StarRating
          tmdbId={item.id}
          mediaType={apiMediaType}
          initialUserRating={ratingData?.userRating}
          initialAverage={ratingData?.averageScore || 0}
          initialTotal={ratingData?.totalRatings || 0}
        />
      </div>
    </>
  );
}