import Image from 'next/image';
import { FaStar, FaClock, FaCalendarAlt } from 'react-icons/fa';
import CastCard from '@/components/CastCard';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import MediaActionButtons from '@/components/MediaActionButtons';

async function getMovieDetails(id, userId) {
  const token = process.env.TMDB_API_TOKEN;
  const options = { headers: { accept: 'application/json', Authorization: `Bearer ${token}` } };
  
  const [detailsRes, creditsRes, videosRes] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, options),
    fetch(`https://api.themoviedb.org/3/movie/${id}/credits?language=en-US`, options),
    fetch(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`, options)
  ]);

  if (!detailsRes.ok) return null;

  const movie = await detailsRes.json();
  movie.credits = await creditsRes.json();
  const videosData = await videosRes.json();
  movie.trailer = videosData.results?.find(v => v.type === 'Trailer') || videosData.results?.[0];

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { favoriteMovies: { select: { tmdbId: true } }, watchlistMovies: { select: { tmdbId: true } } }
    });
    const isFavorite = user?.favoriteMovies.some(m => m.tmdbId === movie.id) || false;
    const isWatchlisted = user?.watchlistMovies.some(m => m.tmdbId === movie.id) || false;
    movie.isFavorite = isFavorite;
    movie.isWatchlisted = isWatchlisted;
  } else {
    movie.isFavorite = false;
    movie.isWatchlisted = false;
  }

  return movie;
}

export default async function MoviePage({ params }) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  let userId = null;
  if (token) {
    try {
      const decoded = await verifyToken(token);
      userId = decoded.id;
    } catch (e) { /* Invalid token */ }
  }

  const movie = await getMovieDetails(params.id, userId);

  if (!movie) return <div className="text-center py-20 text-foreground">Movie not found.</div>;

  const director = movie.credits?.crew.find((p) => p.job === 'Director');
  const cast = movie.credits?.cast.slice(0, 20);
  const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : '';
  const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';

  return (
    <div className="min-h-screen">
      {backdropUrl && (
        <div className="absolute top-0 left-0 w-full h-[60vh] -z-10">
          <Image src={backdropUrl} alt={`${movie.title} backdrop`} layout="fill" objectFit="cover" className="opacity-80 object-top" />
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
            
            <MediaActionButtons 
              item={movie} 
              itemType="movie"
              initialFavorite={movie.isFavorite}
              initialWatchlisted={movie.isWatchlisted}
              trailer={movie.trailer}
            />

            {movie.genres?.length > 0 && <div className="mt-6"><h2 className="text-2xl font-bold text-foreground mb-2">Genres</h2><div className="flex flex-wrap gap-2">{movie.genres.map(g => <span key={g.id} className="bg-stone-700 text-gray-300 px-3 py-1 rounded-full text-sm">{g.name}</span>)}</div></div>}
            <div className="mt-6"><h2 className="text-2xl font-bold text-foreground mb-2">Overview</h2><p className="text-gray-500 leading-relaxed">{movie.overview}</p></div>
            {director && <div className="mt-6"><h3 className="text-xl font-bold text-foreground">Director</h3><p className="text-gray-500">{director.name}</p></div>}
          </div>
        </div>
        {cast?.length > 0 && <div className="mt-12 relative"><h2 className="text-3xl font-bold text-foreground mb-4">Top Billed Cast</h2><div className="flex overflow-x-auto gap-5 pb-4 custom-scrollbar">{cast.map(actor => <CastCard key={actor.cast_id} actor={actor} />)}</div><div className="absolute top-12 right-0 bottom-0 w-16 bg-gradient-to-l from-background pointer-events-none"></div></div>}
      </div>
    </div>
  );
}