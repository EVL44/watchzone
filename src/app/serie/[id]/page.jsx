import Image from 'next/image';
import cloudinaryLoader from '@/lib/cloudinaryLoader';
import { FaStar, FaTv, FaPlay } from 'react-icons/fa';
import CastCard from '@/components/CastCard';
import { getAuthSession } from "@/lib/session";
import prisma from '@/lib/prisma';
import MediaActionButtons from '@/components/MediaActionButtons';
import Adsense from '@/components/Adsense';
import Link from 'next/link';
import Recommendations from '@/components/Recommendations'; 
import AIRecommendations from '@/components/AIRecommendations';
import CommentSection from '@/components/CommentSection'; 
import { notFound } from 'next/navigation';

// Helper function to create JSON-LD structured data
const createJsonLd = (serie, creator) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "name": serie.name,
    "description": serie.overview,
    "image": `https://image.tmdb.org/t/p/w500${serie.poster_path}`,
    "datePublished": serie.first_air_date,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": serie.vote_average.toFixed(1),
      "bestRating": "10",
      "ratingCount": serie.vote_count
    },
    "genre": serie.genres.map(g => g.name),
    "numberOfSeasons": serie.number_of_seasons,
    "numberOfEpisodes": serie.number_of_episodes,
  };

  if (creator) {
    data.creator = {
      "@type": "Person",
      "name": creator.name
    };
  }
  
  return JSON.stringify(data);
};

export async function generateMetadata({ params }) {
  const { id }  = await params;
  const token = process.env.TMDB_API_TOKEN;

  const options = { headers: { accept: 'application/json', Authorization: `Bearer ${token}` } };
  const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?language=en-US`, options);
  
  if (!res.ok) {
    return notFound();
  }

  const serie = await res.json();
  const airYear = serie.first_air_date ? serie.first_air_date.split('-')[0] : 'N/A';

  // SEO-optimized description
  const description = serie.overview 
    ? `Watch ${serie.name} (${airYear}) full episodes online on watchzone. Discover details, seasons, cast, trailers, and reviews. Track, rate, and add ${serie.name} to your watchlist.`
    : `Watch ${serie.name} (${airYear}) on watchzone.`;

  return {
    // The template from layout.jsx will automatically add " - Watchzone"
    title: `Watch ${serie.name || 'Series'} (${airYear})`,
    description: description,
    
    // Open Graph data for rich social sharing
    openGraph: {
      title: `Watch ${serie.name || 'Series'} (${airYear}) | watchzone`,
      description: description,
      images: [
        {
          url: `https://image.tmdb.org/t/p/w780${serie.backdrop_path || serie.poster_path}`,
          width: 780,
          height: 439,
          alt: `${serie.name} Backdrop`,
        },
        {
          url: `https://image.tmdb.org/t/p/w500${serie.poster_path}`,
          width: 500,
          height: 750,
          alt: `${serie.name} Poster`,
        },
      ],
      type: 'video.tv_show',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Watch ${serie.name || 'Series'} (${airYear}) | watchzone`,
      description: description,
      images: [`https://image.tmdb.org/t/p/w780${serie.backdrop_path || serie.poster_path}`],
    },
  };
}

async function getSerieDetails(id, userId) {
  const token = process.env.TMDB_API_TOKEN;
  const options = { 
    headers: { accept: 'application/json', Authorization: `Bearer ${token}` },
    next: { revalidate: 3600 } 
  };
  
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

  // Fetch community ratings from our DB
  let ratings = [];
  try {
    ratings = await prisma.rating.findMany({
      where: { tmdbId: serie.id, mediaType: 'series' },
    });
  } catch (err) {
    console.error('Rating fetch error:', err.message);
  }
  const totalRatings = ratings.length;
  const averageScore = totalRatings > 0
    ? Math.round((ratings.reduce((sum, r) => sum + r.score, 0) / totalRatings) * 10) / 10
    : 0;

  serie.ratingData = { averageScore, totalRatings, userRating: null };

  if (userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          favoriteSeries: { select: { tmdbId: true } }, 
          watchlistSeries: { select: { tmdbId: true } },
          watchedSeries: { select: { tmdbId: true } },
        }
      });
      serie.isFavorite = user?.favoriteSeries.some(s => s.tmdbId === serie.id) || false;
      serie.isWatchlisted = user?.watchlistSeries.some(s => s.tmdbId === serie.id) || false;
      serie.isWatched = user?.watchedSeries.some(s => s.tmdbId === serie.id) || false;

      const userRating = ratings.find(r => r.userId === userId);
      if (userRating) serie.ratingData.userRating = userRating;
    } catch (err) {
      console.error('User data fetch error:', err.message);
      serie.isFavorite = false;
      serie.isWatchlisted = false;
      serie.isWatched = false;
    }
  } else {
    serie.isFavorite = false;
    serie.isWatchlisted = false;
    serie.isWatched = false;
  }

  return serie;
}

export default async function SerieDetailsPage({ params }) {
  const session = await getAuthSession();
  let userId = session?.user?.id || null;

  const serie = await getSerieDetails((await params).id, userId);

  if (!serie) {
    notFound();
  }

  const creator = serie.created_by?.length > 0 ? serie.created_by[0] : null;
  const cast = serie.credits?.cast.slice(0, 20);
  const backdropUrl = serie.backdrop_path ? `https://image.tmdb.org/t/p/original${serie.backdrop_path}` : '';
  const posterUrl = serie.poster_path ? `https://image.tmdb.org/t/p/w500${serie.poster_path}` : '';

  // Create the JSON-LD data
  const jsonLd = createJsonLd(serie, creator);

  return (
    <div className="min-h-screen">
      {/* ** NEW: JSON-LD Structured Data Script **
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      {/* End of JSON-LD Script */}

      {/* 1. Backdrop Image */}
      {backdropUrl && (
        <div className="absolute top-0 left-0 w-full h-[80vh] -z-10">
          <Image src={backdropUrl} alt={`${serie.name} backdrop`} layout="fill" objectFit="cover" className="opacity-90 object-top" unoptimized={true} priority />
          {/* 2. Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        </div>
      )}
      
      {/* 3. Main Content Container */}
      <div className="container mt-30 px-4 py-16 md:py-24 ">
        <div className="xl:mx-40 md:flex md:gap-8">
          {/* 4. Poster */}
          <div className="md:w-1/4 flex-shrink-0">
            {posterUrl && (
              <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                <Image src={posterUrl} alt={serie.name} layout="fill" objectFit="cover" unoptimized={true} priority />
              </div>
            )}
          </div>
          
          {/* 5. Details */}
          <div className="md:w-2/3 mt-8 md:mt-0">
            {/* Use <h1> for the main title for SEO */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">{serie.name}</h1>
            {serie.tagline && <p className="text-gray-500 text-lg italic mt-2">"{serie.tagline}"</p>}
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-500 mt-4">
              <div className="flex items-center gap-2"><FaStar className="text-yellow-400" /><span className="font-bold text-foreground text-lg">{serie.vote_average.toFixed(1)}</span></div>
              <div className="flex items-center gap-2"><FaTv /><span>{serie.number_of_seasons} Seasons</span></div>
              <div className="flex items-center gap-2"><FaTv /><span>{serie.number_of_episodes} Episodes</span></div>
            </div>
            
            <div className="flex flex-wrap items-start gap-4 mt-6">
                <MediaActionButtons 
                  item={serie} 
                  itemType="series"
                  initialFavorite={serie.isFavorite}
                  initialWatchlisted={serie.isWatchlisted}
                  initialWatched={serie.isWatched}
                  trailer={serie.trailer}
                  ratingData={serie.ratingData}
                />
                <Link 
                  href={`/watch/tv/${(await params).id}`} 
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 md:py-2 md:px-4 rounded-lg transition-colors w-full sm:w-auto"
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
        <div className=" xl:mx-40 my-8">
          <Adsense
            adSlot="9095823329"
            style={{ display: 'block' }}
            format="auto"
            responsive="true"
          />
        </div>
        {cast?.length > 0 && (
          <div className="xl:mx-40 mt-12 relative">
            <h2 className="text-3xl font-bold text-foreground mb-4">Top Billed Cast</h2>
            <div className="flex overflow-x-auto gap-5 pb-4 custom-scrollbar">
              {cast.map(actor => <CastCard key={actor.id} actor={actor} />)}
            </div>
            <div className="absolute top-12 right-0 bottom-0 w-16 bg-gradient-to-l from-background pointer-events-none"></div>
          </div>
        )}
        
        {/* 7. New Sections (Kept) */}
        <div className='xl:mx-40'>
          <AIRecommendations tmdbId={serie.id} type="tv" title={serie.name} overview={serie.overview} />
          <Recommendations tmdbId={serie.id} mediaType="series" />
          <CommentSection tmdbId={serie.id} mediaType="series" />
        </div>
      </div>
    </div>
  );
}