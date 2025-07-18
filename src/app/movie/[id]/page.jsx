'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaStar, FaClock, FaCalendarAlt, FaPlay, FaBookmark, FaHeart, FaList } from 'react-icons/fa';
import TrailerModal from '@/components/TrailerModal';
import CastCard from '@/components/CastCard';
import { useAuth } from '@/context/AuthContext';

export default function MoviePage() {
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  
  const params = useParams();
  const { id } = params;
  const { user, updateUserContext, fetchUser } = useAuth(); // fetchUser to refresh
  const router = useRouter();

  // State for the action buttons
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // This effect checks if the current movie is in the user's lists
  useEffect(() => {
    async function checkStatus() {
        if (user && id) {
            // Since we don't know the internal ID, we need to fetch user lists with full details
            // For simplicity, we assume `fetchUser` provides up-to-date lists.
            // A more optimized approach would be a dedicated status-check endpoint.
            const userWithLists = await fetch('/api/auth/me').then(res => res.ok ? res.json() : null);
            if (!userWithLists) return;

            const favoriteTmdbIds = userWithLists.favoriteMovies?.map(m => m.tmdbId.toString()) || [];
            const watchlistTmdbIds = userWithLists.watchlistMovies?.map(m => m.tmdbId.toString()) || [];
            
            setIsFavorite(favoriteTmdbIds.includes(id));
            setIsWatchlisted(watchlistTmdbIds.includes(id));
        }
    }
    checkStatus();
  }, [user, id]);

  // This effect fetches movie details
  useEffect(() => {
    if (!id) return;
    const fetchAllDetails = async () => {
      try {
        setLoading(true);
        const [detailsRes, creditsRes, videosRes] = await Promise.all([
          fetch(`/api/movies/details/${id}`),
          fetch(`/api/movies/credits/${id}`),
          fetch(`/api/movies/videos/${id}`)
        ]);
        if (!detailsRes.ok) throw new Error("Movie details fetch failed");

        setMovie(await detailsRes.json());
        setCredits(await creditsRes.json());
        const videosData = await videosRes.json();
        setTrailer(videosData.results?.find(v => v.type === 'Trailer') || videosData.results?.[0]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllDetails();
  }, [id]);

  const handleListAction = useCallback(async (listType) => {
    if (!user) return router.push('/login');
    if (!movie) return;

    setIsUpdating(true);
    const currentStatus = listType === 'favorites' ? isFavorite : isWatchlisted;
    const action = currentStatus ? 'remove' : 'add';
    
    // Optimistic UI update
    if (listType === 'favorites') setIsFavorite(!isFavorite);
    else setIsWatchlisted(!isWatchlisted);

    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: id, itemType: 'movie', listType, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      updateUserContext(data); // Update context with the latest user data from API
    } catch (error) {
      alert(`Error: ${error.message}`);
      // Revert UI on error
      if (listType === 'favorites') setIsFavorite(isFavorite);
      else setIsWatchlisted(isWatchlisted);
    } finally {
      setIsUpdating(false);
    }
  }, [user, movie, id, isFavorite, isWatchlisted, router, updateUserContext]);

  if (loading) return <div className="text-center py-20 text-foreground">Loading...</div>;
  if (!movie) return <div className="text-center py-20 text-foreground">Movie not found.</div>;

  const director = credits?.crew.find((p) => p.job === 'Director');
  const cast = credits?.cast.slice(0, 20);
  const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : '';
  const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';

  return (
    <>
      {showTrailer && <TrailerModal trailerKey={trailer?.key} onClose={() => setShowTrailer(false)} />}
      <div className="min-h-screen">
        {backdropUrl && (
          <div className="absolute top-0 left-0 w-full h-[60vh] -z-10">
            <Image src={backdropUrl} alt={`${movie.title} backdrop`} layout="fill" objectFit="cover" className="opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          </div>
        )}
        <div className="container mt-30 mx-auto px-4 py-16 md:py-24">
          <div className="md:flex md:gap-8">
            <div className="md:w-1/3 flex-shrink-0">
              {posterUrl && (
                <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                  <Image src={posterUrl} alt={movie.title} layout="fill" objectFit="cover" />
                </div>
              )}
            </div>
            <div className="md:w-2/3 mt-8 md:mt-0">
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">{movie.title}</h1>
              {movie.tagline && <p className="text-gray-500 text-lg italic mt-2">"{movie.tagline}"</p>}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-500 mt-4">
                <div className="flex items-center gap-2"><FaStar className="text-yellow-400" /><span className="font-bold text-foreground text-lg">{movie.vote_average.toFixed(1)}</span></div>
                {movie.runtime > 0 && <div className="flex items-center gap-2"><FaClock /><span>{`${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`}</span></div>}
                <div className="flex items-center gap-2"><FaCalendarAlt /><span>{new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
              </div>
              <div className="flex items-center gap-4 mt-6">
                <button onClick={() => handleListAction('watchlist')} disabled={isUpdating} className={`bg-stone-700 font-bold p-3 rounded-full transition-colors ${isWatchlisted ? 'text-primary' : 'text-white hover:text-primary'}`} title="Add to Watchlist"><FaBookmark /></button>
                <button onClick={() => handleListAction('favorites')} disabled={isUpdating} className={`bg-stone-700 font-bold p-3 rounded-full transition-colors ${isFavorite ? 'text-primary' : 'text-white hover:text-primary'}`} title="Add to Favorites"><FaHeart /></button>
                <button className="bg-stone-700 text-white hover:text-primary font-bold p-3 rounded-full transition-colors" title="Add to List"><FaList /></button>
                {trailer && <button onClick={() => setShowTrailer(true)} className="flex items-center gap-2 bg-primary hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg transition-colors"><FaPlay /><span>Watch Trailer</span></button>}
              </div>
              {movie.genres?.length > 0 && <div className="mt-6"><h2 className="text-2xl font-bold text-foreground mb-2">Genres</h2><div className="flex flex-wrap gap-2">{movie.genres.map(g => <span key={g.id} className="bg-stone-700 text-gray-300 px-3 py-1 rounded-full text-sm">{g.name}</span>)}</div></div>}
              <div className="mt-6"><h2 className="text-2xl font-bold text-foreground mb-2">Overview</h2><p className="text-gray-500 leading-relaxed">{movie.overview}</p></div>
              {director && <div className="mt-6"><h3 className="text-xl font-bold text-foreground">Director</h3><p className="text-gray-500">{director.name}</p></div>}
            </div>
          </div>
          {cast?.length > 0 && <div className="mt-12 relative"><h2 className="text-3xl font-bold text-foreground mb-4">Top Billed Cast</h2><div className="flex overflow-x-auto gap-5 pb-4 custom-scrollbar">{cast.map(actor => <CastCard key={actor.cast_id} actor={actor} />)}</div><div className="absolute top-12 right-0 bottom-0 w-16 bg-gradient-to-l from-background pointer-events-none"></div></div>}
        </div>
      </div>
    </>
  );
}