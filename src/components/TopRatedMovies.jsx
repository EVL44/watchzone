'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FaStar, FaBookmark, FaHeart, FaList } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AddToListModal from '@/components/AddToListModal';
import SkeletonLoader from '@/components/SkeletonLoader';

export default function TopRatedMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, updateUserContext } = useAuth();
  const router = useRouter();

  const [showAddToList, setShowAddToList] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchAllMovies = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/movies/top-rated');
        if (!response.ok) throw new Error('Failed to fetch top rated movies');
        const data = await response.json();
        
        const moviesWithStatus = data.map(movie => ({
          ...movie,
          isFavorite: user?.favoriteMovies?.some(m => m.tmdbId === movie.id) || false,
          isWatchlisted: user?.watchlistMovies?.some(m => m.tmdbId === movie.id) || false,
        }));
        setMovies(moviesWithStatus);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllMovies();
  }, []); // Removed 'user' from the dependency array

  const handleListAction = useCallback(async (movie, listType) => {
    if (!user) return router.push('/login');

    const itemType = 'movie';
    const currentStatus = listType === 'favorites' ? movie.isFavorite : movie.isWatchlisted;
    const action = currentStatus ? 'remove' : 'add';

    setMovies(prevMovies => prevMovies.map(m => 
      m.id === movie.id ? { ...m, [listType === 'favorites' ? 'isFavorite' : 'isWatchlisted']: !currentStatus } : m
    ));

    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: movie.id, itemType, listType, action }),
      });
      const updatedUser = await res.json();
      if (!res.ok) throw new Error('Failed to update list');
      updateUserContext(updatedUser);
    } catch (error) {
      console.error(error);
      setMovies(prevMovies => prevMovies.map(m => 
        m.id === movie.id ? { ...m, [listType === 'favorites' ? 'isFavorite' : 'isWatchlisted']: currentStatus } : m
      ));
    }
  }, [user, router, updateUserContext]);

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <>
      {showAddToList && <AddToListModal item={selectedItem} itemType="movie" onClose={() => setShowAddToList(false)} />}
      <div className="max-w-4xl mx-auto">
        <ul className="space-y-4">
          {movies.map((movie, index) => (
            <li key={`${movie.id}-${index}`} className="bg-surface rounded-lg overflow-hidden p-4 flex items-start group">
              <div className="w-12 text-center text-2xl font-bold text-foreground/50 pt-2 flex-shrink-0">{index + 1}</div>
              <Link href={`/movie/${movie.id}`} className="w-24 h-36 relative flex-shrink-0">
                <Image 
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </Link>
              <div className="flex-1 ml-4">
                <Link href={`/movie/${movie.id}`}><h3 className="text-foreground font-bold text-xl hover:text-primary transition-colors">{movie.title}</h3></Link>
                <p className="text-foreground/70 text-sm mt-1">{new Date(movie.release_date).getFullYear()}</p>
                <div className="flex items-center gap-2 text-lg mt-2">
                  <FaStar className="text-yellow-400" />
                  <span className="text-foreground font-bold">{movie.vote_average.toFixed(1)}</span>
                </div>
                <p className="text-foreground/70 text-sm mt-2 line-clamp-2">{movie.overview}</p>
              </div>
              <div className="flex flex-col items-center justify-start gap-3 pl-4">
                  <button onClick={() => handleListAction(movie, 'watchlist')} className={`p-2 rounded-full transition-colors ${movie.isWatchlisted ? 'bg-primary text-white' : 'bg-secondary text-foreground/70 hover:text-primary'}`} title="Add to Watchlist"><FaBookmark /></button>
                  <button onClick={() => handleListAction(movie, 'favorites')} className={`p-2 rounded-full transition-colors ${movie.isFavorite ? 'bg-primary text-white' : 'bg-secondary text-foreground/70 hover:text-primary'}`} title="Add to Favorites"><FaHeart /></button>
                  <button onClick={() => { setSelectedItem(movie); setShowAddToList(true); }} className="p-2 rounded-full bg-secondary text-foreground/70 hover:text-primary transition-colors" title="Add to List"><FaList /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}