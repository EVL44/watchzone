import Image from 'next/image';
import { FaStar, FaTv } from 'react-icons/fa';
import CastCard from '@/components/CastCard';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import MediaActionButtons from '@/components/MediaActionButtons';

async function getSerieDetails(id, userId) {
  const token = process.env.TMDB_API_TOKEN;
  const options = { headers: { accept: 'application/json', Authorization: `Bearer ${token}` } };
  
  const [detailsRes, creditsRes, videosRes] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/tv/${id}?language=en-US`, options),
    fetch(`https://api.themoviedb.org/3/tv/${id}/credits?language=en-US`, options),
    fetch(`https://api.themoviedb.org/3/tv/${id}/videos?language=en-US`, options)
  ]);

  if (!detailsRes.ok) return null;

  const serie = await detailsRes.json();
  serie.credits = await creditsRes.json();
  const videosData = await videosRes.json();
  serie.trailer = videosData.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videosData.results?.[0];

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { favoriteSeries: { select: { tmdbId: true } }, watchlistSeries: { select: { tmdbId: true } } }
    });
    const isFavorite = user?.favoriteSeries.some(s => s.tmdbId === serie.id) || false;
    const isWatchlisted = user?.watchlistSeries.some(s => s.tmdbId === serie.id) || false;
    serie.isFavorite = isFavorite;
    serie.isWatchlisted = isWatchlisted;
  } else {
    serie.isFavorite = false;
    serie.isWatchlisted = false;
  }

  return serie;
}

export default async function SerieDetailsPage({ params }) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  let userId = null;
  if (token) {
    try {
      const decoded = await verifyToken(token);
      userId = decoded.id;
    } catch (e) { /* Invalid token */ }
  }

  const serie = await getSerieDetails(params.id, userId);

  if (!serie) return <div className="text-center py-20 text-foreground">Series not found.</div>;

  const creator = serie.created_by?.length > 0 ? serie.created_by[0] : null;
  const cast = serie.credits?.cast.slice(0, 20);
  const backdropUrl = serie.backdrop_path ? `https://image.tmdb.org/t/p/original${serie.backdrop_path}` : '';
  const posterUrl = serie.poster_path ? `https://image.tmdb.org/t/p/w500${serie.poster_path}` : '';

  return (
    <div className="min-h-screen">
      {backdropUrl && (
        <div className="absolute top-0 left-0 w-full h-[60vh] -z-10">
          <Image src={backdropUrl} alt={`${serie.name} backdrop`} layout="fill" objectFit="cover" className="opacity-80 object-top" unoptimized={true} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        </div>
      )}
      <div className="container mt-30 mx-auto px-4 py-16 md:py-24">
        <div className="md:flex md:gap-8">
          <div className="md:w-1/3 flex-shrink-0">
            {posterUrl && (
              <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                <Image src={posterUrl} alt={serie.name} layout="fill" objectFit="cover" unoptimized={true} />
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
            
            <MediaActionButtons 
              item={serie} 
              itemType="series"
              initialFavorite={serie.isFavorite}
              initialWatchlisted={serie.isWatchlisted}
              trailer={serie.trailer}
            />

            {serie.genres?.length > 0 && <div className="mt-6"><h2 className="text-2xl font-bold text-foreground mb-2">Genres</h2><div className="flex flex-wrap gap-2">{serie.genres.map(g => <span key={g.id} className="bg-stone-700 text-gray-300 px-3 py-1 rounded-full text-sm">{g.name}</span>)}</div></div>}
            <div className="mt-6"><h2 className="text-2xl font-bold text-foreground mb-2">Overview</h2><p className="text-gray-500 leading-relaxed">{serie.overview}</p></div>
            {creator && <div className="mt-6"><h3 className="text-xl font-bold text-foreground">Creator</h3><p className="text-gray-500">{creator.name}</p></div>}
          </div>
        </div>
        {cast?.length > 0 && (
          <div className="mt-12 relative">
            <h2 className="text-3xl font-bold text-foreground mb-4">Top Billed Cast</h2>
            <div className="flex overflow-x-auto gap-5 pb-4 custom-scrollbar">
              {cast.map(actor => <CastCard key={actor.id} actor={actor} />)}
            </div>
            <div className="absolute top-12 right-0 bottom-0 w-16 bg-gradient-to-l from-background pointer-events-none"></div>
          </div>
        )}
      </div>
    </div>
  );
}