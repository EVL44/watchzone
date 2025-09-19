'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaStar, FaPlay, FaBookmark, FaHeart, FaList, FaTv } from 'react-icons/fa';
import TrailerModal from '@/components/TrailerModal';
import CastCard from '@/components/CastCard';
import { useAuth } from '@/context/AuthContext';

export default function SerieDetailsPage() {
    const [serie, setSerie] = useState(null);
    const [credits, setCredits] = useState(null);
    const [trailer, setTrailer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTrailer, setShowTrailer] = useState(false);
    
    const params = useParams();
    const { id } = params;
    const { user, updateUserContext } = useAuth();
    const router = useRouter();

    const [isFavorite, setIsFavorite] = useState(false);
    const [isWatchlisted, setIsWatchlisted] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (user && serie) {
            const favoriteTmdbIds = user.favoriteSeries?.map(s => s.tmdbId.toString()) || [];
            const watchlistTmdbIds = user.watchlistSeries?.map(s => s.tmdbId.toString()) || [];
            
            setIsFavorite(favoriteTmdbIds.includes(id));
            setIsWatchlisted(watchlistTmdbIds.includes(id));
        }
    }, [user, serie, id]);

    useEffect(() => {
        if (!id) return;
        const fetchAllDetails = async () => {
            try {
                setLoading(true);
                const [detailsRes, creditsRes, videosRes] = await Promise.all([
                    fetch(`/api/series/details/${id}`),
                    fetch(`/api/series/credits/${id}`),
                    fetch(`/api/series/videos/${id}`)
                ]);
                if (!detailsRes.ok) throw new Error("Failed to fetch serie details");

                const serieData = await detailsRes.json();
                setSerie(serieData);
                setCredits(await creditsRes.json());
                const videosData = await videosRes.json();
                const officialTrailer = videosData.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer') || videosData.results?.[0];
                setTrailer(officialTrailer);
            } catch (error) {
                console.error("Failed to fetch serie details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllDetails();
    }, [id]);

    const handleListAction = useCallback(async (listType) => {
        if (!user) return router.push('/login');
        if (!serie) return;

        setIsUpdating(true);
        const currentStatus = listType === 'favorites' ? isFavorite : isWatchlisted;
        const action = currentStatus ? 'remove' : 'add';
        
        if (listType === 'favorites') setIsFavorite(!isFavorite);
        else setIsWatchlisted(!isWatchlisted);

        try {
            const res = await fetch('/api/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: id, itemType: 'series', listType, action }),
            });
            const updatedUser = await res.json();
            if (!res.ok) throw new Error(updatedUser.message || 'Failed to update list');
            updateUserContext(updatedUser);
        } catch (error) {
            console.error(error);
            alert(`Error: ${error.message}`);
            if (listType === 'favorites') setIsFavorite(isFavorite);
            else setIsWatchlisted(isWatchlisted);
        } finally {
            setIsUpdating(false);
        }
    }, [user, serie, id, isFavorite, isWatchlisted, router, updateUserContext]);

    if (loading) return <div className="text-center py-20 text-foreground">Loading series...</div>;
    if (!serie) return <div className="text-center py-20 text-foreground">Series not found.</div>;

    const director = credits?.crew.find((p) => p.job === 'Director');
    const cast = credits?.cast.slice(0, 20);
    const backdropUrl = serie.backdrop_path ? `https://image.tmdb.org/t/p/original${serie.backdrop_path}` : '';
    const posterUrl = serie.poster_path ? `https://image.tmdb.org/t/p/w500${serie.poster_path}` : '';

    return (
        <>
            {showTrailer && <TrailerModal trailerKey={trailer?.key} onClose={() => setShowTrailer(false)} />}
            <div className="min-h-screen">
                {backdropUrl && (
                    <div className="absolute top-0 left-0 w-full h-[60vh] -z-10">
                        <Image src={backdropUrl} alt={`${serie.name} backdrop`} layout="fill" objectFit="cover" className="opacity-80 object-top" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
                    </div>
                )}
                <div className="container mt-30 mx-auto px-4 py-16 md:py-24">
                    <div className="md:flex md:gap-8">
                        <div className="md:w-1/3 flex-shrink-0">
                            {posterUrl && (
                                <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                                    <Image src={posterUrl} alt={serie.name} layout="fill" objectFit="cover" />
                                </div>
                            )}
                        </div>
                        <div className="md:w-2/3 mt-8 md:mt-0">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">{serie.name}</h1>
                            {serie.tagline && <p className="text-gray-500 text-lg italic mt-2">"{serie.tagline}"</p>}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-500 mt-4">
                                <div className="flex items-center gap-2"><FaStar className="text-yellow-400" /><span className="font-bold text-foreground text-lg">{serie.vote_average.toFixed(1)}</span></div>
                                <div className="flex items-center gap-2"><FaTv /><span>{serie.number_of_seasons} Seasons</span></div>
                                <div className="flex items-center gap-2"><FaTv /><span>{serie.number_of_episodes} Episodes</span></div>
                            </div>
                            <div className="flex items-center gap-4 mt-6">
                                <button onClick={() => handleListAction('watchlist')} disabled={isUpdating} className={`bg-stone-700 font-bold p-3 rounded-full transition-colors ${isWatchlisted ? 'text-primary' : 'text-white hover:text-primary'}`} title="Add to Watchlist"><FaBookmark /></button>
                                <button onClick={() => handleListAction('favorites')} disabled={isUpdating} className={`bg-stone-700 font-bold p-3 rounded-full transition-colors ${isFavorite ? 'text-primary' : 'text-white hover:text-primary'}`} title="Add to Favorites"><FaHeart /></button>
                                <button className="bg-stone-700 text-white hover:text-primary font-bold p-3 rounded-full transition-colors" title="Add to List"><FaList /></button>
                                {trailer && <button onClick={() => setShowTrailer(true)} className="flex items-center gap-2 bg-primary hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg transition-colors"><FaPlay /><span>Watch Trailer</span></button>}
                            </div>
                            {serie.genres?.length > 0 && <div className="mt-6"><h2 className="text-2xl font-bold text-foreground mb-2">Genres</h2><div className="flex flex-wrap gap-2">{serie.genres.map(g => <span key={g.id} className="bg-stone-700 text-gray-300 px-3 py-1 rounded-full text-sm">{g.name}</span>)}</div></div>}
                            <div className="mt-6"><h2 className="text-2xl font-bold text-foreground mb-2">Overview</h2><p className="text-gray-500 leading-relaxed">{serie.overview}</p></div>
                            {director && <div className="mt-6"><h3 className="text-xl font-bold text-white">Director</h3><p className="text-gray-500">{director.name}</p></div>}
                        </div>
                    </div>
                    {cast?.length > 0 && (
                        <div className="mt-12 relative">
                            <h2 className="text-3xl font-bold text-foreground mb-4">Top Billed Cast</h2>
                            <div className="flex overflow-x-auto gap-5 pb-4 custom-scrollbar">
                                {/* **CRITICAL FIX**: Using actor.id which is guaranteed to be unique */}
                                {cast.map(actor => <CastCard key={actor.id} actor={actor} />)}
                            </div>
                            <div className="absolute top-12 right-0 bottom-0 w-16 bg-gradient-to-l from-background pointer-events-none"></div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}