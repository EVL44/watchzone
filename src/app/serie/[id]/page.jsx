import Image from 'next/image';
import { FaStar, FaTv, FaPlay } from 'react-icons/fa';
import CastCard from '@/components/CastCard';
// REMOVE: import { cookies } from 'next/headers';
// REMOVE: import { verifyToken } from '@/lib/auth';
import { getServerSession } from 'next-auth/next'; // ADD
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // ADD
import prisma from '@/lib/prisma';
import MediaActionButtons from '@/components/MediaActionButtons';
import Adsense from '@/components/Adsense';
import Link from 'next/link';
import Recommendations from '@/components/Recommendations'; 
import CommentSection from '@/components/CommentSection'; 
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { id } = params;
  const token = process.env.TMDB_API_TOKEN;

  // Note: Using the correct 'tv' endpoint
  const options = { headers: { accept: 'application/json', Authorization: `Bearer ${token}` } };
  const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?language=en-US`, options);
  
  if (!res.ok) {
    return {
      title: 'Series Not Found',
      description: 'This series could not be found.',
    }
  }

  const serie = await res.json();

  // --- FIX ---
  // Safely get the year, or use 'N/A' as a fallback
  const airYear = serie.first_air_date ? serie.first_air_date.split('-')[0] : 'N/A';

  // Safely get the description, or use a default fallback
  const description = serie.overview 
    ? (serie.overview.length > 155 ? `${serie.overview.substring(0, 155)}...` : serie.overview)
    : 'No description available.';
  // --- END FIX ---

  return {
    // Use the safe variables here
    title: `${serie.name || 'Series'} (${airYear}) - watchzone`,
    description: description,
    openGraph: {
      title: serie.name || 'Series',
      description: description,
      images: [
        {
          url: `https://image.tmdb.org/t/p/w500${serie.poster_path}`,
          width: 500,
          height: 750,
          alt: serie.name || 'Series Poster',
        },
      ],
    },
  };
}

async function getSerieDetails(id, userId) {
  // ... (The internals of this function are fine)
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
    serie.isFavorite = user?.favoriteSeries.some(s => s.tmdbId === serie.id) || false;
    serie.isWatchlisted = user?.watchlistSeries.some(s => s.tmdbId === serie.id) || false;
  } else {
    serie.isFavorite = false;
    serie.isWatchlisted = false;
  }

  return serie;
}

export default async function SerieDetailsPage({ params }) {
  // --- THIS IS THE FIX ---
  const session = await getServerSession(authOptions);
  let userId = session?.user?.id || null;
  // --- END OF FIX ---

  // (The old, incorrect logic is removed)
  // const cookieStore = cookies();
  // const token = cookieStore.get('token')?.value;
  // let userId = null;
  // if (token) {
  //   try {
  //     const decoded = await verifyToken(token);
  //     userId = decoded.id;
  //   } catch (e) { /* Invalid token */ }
  // }

  const serie = await getSerieDetails(params.id, userId);

  // ... (rest of the component is unchanged)
  if (!serie) return <div className="text-center py-20 text-foreground">Series not found.</div>;

  const creator = serie.created_by?.length > 0 ? serie.created_by[0] : null;
  const cast = serie.credits?.cast.slice(0, 20);
  const backdropUrl = serie.backdrop_path ? `https://image.tmdb.org/t/p/original${serie.backdrop_path}` : '';
  const posterUrl = serie.poster_path ? `https://image.tmdb.org/t/p/w500${serie.poster_path}` : '';

  return (
    // ... (rest of the JSX is unchanged)
    <div className="min-h-screen">
      {/* 1. Backdrop Image */}
      {backdropUrl && (
        <div className="absolute top-0 left-0 w-full h-[80vh] -z-10">
          <Image src={backdropUrl} alt={`${serie.name} backdrop`} layout="fill" objectFit="cover" className="opacity-90 object-top" unoptimized={true} />
          {/* 2. Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        </div>
      )}
      
      {/* 3. Main Content Container */}
      <div className="container mt-30 px-4 py-16 md:py-24 ">
        <div className="md:flex md:gap-8">
          {/* 4. Poster */}
          <div className="md:w-1/4 flex-shrink-0">
            {posterUrl && (
              <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                <Image src={posterUrl} alt={serie.name} layout="fill" objectFit="cover" unoptimized={true} />
              </div>
            )}
          </div>
          
          {/* 5. Details */}
          <div className="md:w-2/3 mt-8 md:mt-0">
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">{serie.name}</h1>
            {serie.tagline && <p className="text-gray-500 text-lg italic mt-2">"{serie.tagline}"</p>}
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-500 mt-4">
              <div className="flex items-center gap-2"><FaStar className="text-yellow-400" /><span className="font-bold text-foreground text-lg">{serie.vote_average.toFixed(1)}</span></div>
              <div className="flex items-center gap-2"><FaTv /><span>{serie.number_of_seasons} Seasons</span></div>
              <div className="flex items-center gap-2"><FaTv /><span>{serie.number_of_episodes} Episodes</span></div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center">
                <MediaActionButtons 
                  item={serie} 
                  itemType="series"
                  initialFavorite={serie.isFavorite}
                  initialWatchlisted={serie.isWatchlisted}
                  trailer={serie.trailer}
                />
                <Link 
                  href={`/watch/tv/${params.id}`} 
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors mt-4 md:mt-6 md:ml-4 w-full md:w-auto"
                >
                  <FaPlay />
                  <span>Watch Now</span>
                </Link>
            </div>

            {serie.genres?.length > 0 && <div className="mt-6"><h2 className="text-2xl font-bold text-foreground mb-2">Genres</h2><div className="flex flex-wrap gap-2">{serie.genres.map(g => <span key={g.id} className="bg-stone-700 text-gray-300 px-3 py-1 rounded-full text-sm">{g.name}</span>)}</div></div>}
            <div className="mt-6"><h2 className="text-2xl font-bold text-foreground mb-2">Overview</h2><p className="text-gray-500 leading-relaxed">{serie.overview}</p></div>
            {creator && <div className="mt-6"><h3 className="text-xl font-bold text-foreground">Creator</h3><p className="text-gray-500">{creator.name}</p></div>}
          </div>
        </div>
        
        {/* 6. Ad and Cast (Unchanged) */}
        <div className="my-8">
          <Adsense
            adSlot="9095823329"
            style={{ display: 'block' }}
            format="auto"
            responsive="true"
          />
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
        
        {/* 7. New Sections (Kept) */}
        <Recommendations tmdbId={serie.id} mediaType="series" />
        <CommentSection tmdbId={serie.id} mediaType="series" />
      </div>
    </div>
  );
}