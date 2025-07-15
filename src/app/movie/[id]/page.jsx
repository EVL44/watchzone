'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaStar, FaClock, FaCalendarAlt, FaPlay, FaBookmark, FaHeart, FaList } from 'react-icons/fa';
import TrailerModal from '@/components/TrailerModal';
import CastCard from '@/components/CastCard';
import { useAuth } from '../../../context/AuthContext';

export default function MoviePage() {
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const params = useParams();
  const { id } = params;
  const { user } = useAuth();
  const router = useRouter();

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

        if (!detailsRes.ok) throw new Error("Failed to fetch movie details");

        const movieData = await detailsRes.json();
        const creditsData = await creditsRes.json();
        const videosData = await videosRes.json();

        setMovie(movieData);
        setCredits(creditsData);

        const officialTrailer = videosData.results?.find(
          (video) => video.site === 'YouTube' && video.type === 'Trailer' && video.official
        ) || videosData.results?.find(
          (video) => video.site === 'YouTube' && video.type === 'Trailer'
        );
        setTrailer(officialTrailer);

      } catch (error) {
        console.error("Failed to fetch all movie details:", error);
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDetails();
  }, [id]);

  const handleActionClick = (action) => {
    if (!user) {
      router.push('/login');
    } else {
      console.log(`${action} clicked for movie ${movie.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-white text-2xl">Loading movie details...</p>
      </div>
    );
  }

  if (!movie || movie.success === false) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-white text-2xl">Movie not found.</p>
      </div>
    );
  }

  const director = credits?.crew.find((person) => person.job === 'Director');
  const cast = credits?.cast.slice(0, 20);
  const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : '';
  const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';

  return (
    <>
      {showTrailer && <TrailerModal trailerKey={trailer?.key} onClose={() => setShowTrailer(false)} />}
      <div className="min-h-screen">
        {backdropUrl && (
          <div className="absolute top-0 left-0 w-full h-[60vh] -z-10">
            <Image
              src={backdropUrl}
              alt={`${movie.title} backdrop`}
              layout="fill"
              objectFit="cover"
              className="opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          </div>
        )}

        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="md:flex md:gap-8">
            <div className="md:w-1/3 flex-shrink-0">
              {posterUrl && (
                <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src={posterUrl}
                    alt={movie.title}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              )}
            </div>

            <div className="md:w-2/3 mt-8 md:mt-0">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white">{movie.title}</h1>
              {movie.tagline && <p className="text-gray-400 text-lg italic mt-2">"{movie.tagline}"</p>}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-300 mt-4">
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-400" />
                  <span className="font-bold text-white text-lg">{movie.vote_average.toFixed(1)}</span>
                </div>
                {movie.runtime > 0 && (
                  <div className="flex items-center gap-2">
                    <FaClock />
                    <span>{`${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FaCalendarAlt />
                  <span>{new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={() => handleActionClick('watchlist')}
                  className="bg-stone-700 hover:bg-stone-600 text-white font-bold p-3 rounded-full transition-colors"
                  title="Add to Watchlist"
                >
                  <FaBookmark />
                </button>
                <button
                  onClick={() => handleActionClick('favorite')}
                  className="bg-stone-700 hover:bg-stone-600 text-white font-bold p-3 rounded-full transition-colors"
                  title="Add to Favorites"
                >
                  <FaHeart />
                </button>
                <button
                  onClick={() => handleActionClick('list')}
                  className="bg-stone-700 hover:bg-stone-600 text-white font-bold p-3 rounded-full transition-colors"
                  title="Add to List"
                >
                  <FaList />
                </button>
                {trailer && (
                  <button 
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    <FaPlay />
                    <span>Watch Trailer</span>
                  </button>
                )}
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Genres</h2>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <span key={genre.id} className="bg-stone-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h2 className="text-2xl font-bold text-white mb-2">Overview</h2>
                <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
              </div>
              
              {director && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-white">Director</h3>
                  <p className="text-gray-300">{director.name}</p>
                </div>
              )}
            </div>
          </div>
          
          {cast && cast.length > 0 && (
            <div className="mt-12 relative">
              <h2 className="text-3xl font-bold text-white mb-4">Top Billed Cast</h2>
              <div className="flex overflow-x-auto gap-5 pb-4 custom-scrollbar">
                {cast.map((actor) => (
                  <CastCard key={actor.cast_id} actor={actor} />
                ))}
              </div>
              <div className="absolute top-12 right-0 bottom-0 w-16 bg-gradient-to-l from-background pointer-events-none"></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}