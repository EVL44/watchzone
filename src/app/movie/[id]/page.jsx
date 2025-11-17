import Image from 'next/image';
import { FaStar, FaClock, FaCalendarAlt, FaPlay } from 'react-icons/fa';
import CastCard from '@/components/CastCard';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import MediaActionButtons from '@/components/MediaActionButtons';
import Adsense from '@/components/Adsense';
import Link from 'next/link';
import Recommendations from '@/components/Recommendations'; 
import CommentSection from '@/components/CommentSection'; 
import { notFound } from 'next/navigation';

// Helper function to create JSON-LD structured data
const createJsonLd = (movie, director) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": movie.title,
    "description": movie.overview,
    "image": `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
    "datePublished": movie.release_date,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": movie.vote_average.toFixed(1),
      "bestRating": "10",
      "ratingCount": movie.vote_count
    },
    "genre": movie.genres.map(g => g.name),
  };

  if (director) {
    data.director = {
      "@type": "Person",
      "name": director.name
    };
  }
  
  return JSON.stringify(data);
};


export async function generateMetadata({ params }) {
  const { id } = params;
  const token = process.env.TMDB_API_TOKEN;

  const options = { headers: { accept: 'application/json', Authorization: `Bearer ${token}` } };
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, options);
  
  if (!res.ok) {
    // This will trigger the notFound() page
    return notFound();
  }

  const movie = await res.json();
  const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
  
  // SEO-optimized description
  const description = movie.overview 
    ? `Discover details, cast, trailers, and reviews for ${movie.title} (${releaseYear}). Track, rate, and add ${movie.title} to your watchlist on watchzone.`
    : `Details for ${movie.title} (${releaseYear}) on watchzone.`;

  return {
    // CRITICAL FIX: "watchwone" -> "watchzone"
    // The template from layout.jsx will automatically add "| watchzone"
    title: `${movie.title || 'Movie'} (${releaseYear})`,
    description: description,
    
    // Open Graph data for rich social sharing
    openGraph: {
      title: `${movie.title || 'Movie'} (${releaseYear}) | watchzone`,
      description: description,
      images: [
        {
          url: `https://image.tmdb.org/t/p/w780${movie.backdrop_path || movie.poster_path}`,
          width: 780,
          height: 439, // Approximate 16:9 for backdrops
          alt: `${movie.title} Backdrop`,
        },
        {
          url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          width: 500,
          height: 750,
          alt: `${movie.title} Poster`,
        },
      ],
      type: 'video.movie',
      releaseDate: movie.release_date,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${movie.title || 'Movie'} (${releaseYear}) | watchzone`,
      description: description,
      images: [`https://image.tmdb.org/t/p/w780${movie.backdrop_path || movie.poster_path}`],
    },
  };
}

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
    movie.isFavorite = user?.favoriteMovies.some(m => m.tmdbId === movie.id) || false;
    movie.isWatchlisted = user?.watchlistMovies.some(m => m.tmdbId === movie.id) || false;
  } else {
    movie.isFavorite = false;
    movie.isWatchlisted = false;
  }

  return movie;
}

export default async function MoviePage({ params }) {
  const session = await getServerSession(authOptions);
  let userId = session?.user?.id || null;

  const movie = await getMovieDetails(params.id, userId);

  if (!movie) {
    notFound(); // Triggers the 404 page
  }

  const director = movie.credits?.crew.find((p) => p.job === 'Director');
  const cast = movie.credits?.cast.slice(0, 20);
  const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : '';
  const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';
  
  // Create the JSON-LD data
  const jsonLd = createJsonLd(movie, director);

  return (
    <div className="min-h-screen">
      {/* ** NEW: JSON-LD Structured Data Script **
        This script is invisible to users but tells Google details about this movie,
        helping you get rich snippets (star ratings, etc.) in search results.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      {/* End of JSON-LD Script */}

      {/* 1. Backdrop Image */}
      {backdropUrl && (
        <div className="absolute top-0 left-0 w-full h-[80vh] -z-10">
          <Image src={backdropUrl} alt={`${movie.title} backdrop`} layout="fill" objectFit="cover" className="opacity-90 object-top" unoptimized={true} priority />
          {/* 2. Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        </div>
      )}
      
      {/* 3. Main Content Container */}
      <div className="container mt-30 px-4 py-16 md:py-24 ">
        <div className="xl:mx-40 md:flex md:gap-8">
          {/* 4. Poster */}
          <div className="md:w-1/4 flex-shrink-0 ">
            {posterUrl && (
              <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                <Image src={posterUrl} alt={movie.title} layout="fill" objectFit="cover" unoptimized={true} priority />
              </div>
            )}
          </div>
          
          {/* 5. Details */}
          <div className="md:w-2/3 mt-8 md:mt-0">
            {/* Use <h1> for the main title for SEO */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">{movie.title}</h1>
            {movie.tagline && <p className="text-gray-500 text-lg italic mt-2">"{movie.tagline}"</p>}
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-500 mt-4">
              <div className="flex items-center gap-2"><FaStar className="text-yellow-400" /><span className="font-bold text-foreground text-lg">{movie.vote_average.toFixed(1)}</span></div>
              {movie.runtime > 0 && <div className="flex items-center gap-2"><FaClock /><span>{`${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`}</span></div>}
              <div className="flex items-center gap-2"><FaCalendarAlt /><span>{new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center">
              <MediaActionButtons 
                item={movie} 
                itemType="movie"
                initialFavorite={movie.isFavorite}
                initialWatchlisted={movie.isWatchlisted}
                trailer={movie.trailer}
              />
              <Link 
                href={`/watch/movie/${params.id}`} 
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors mt-4 md:mt-6 md:ml-4 w-full md:w-auto"
              >
                <FaPlay />
                <span>Watch Now</span>
              </Link>
            </div>

            {movie.genres?.length > 0 && <div className="mt-6"><h2 className="text-2xl font-bold text-foreground mb-2">Genres</h2><div className="flex flex-wrap gap-2">{movie.genres.map(g => <span key={g.id} className="bg-stone-700 text-gray-300 px-3 py-1 rounded-full text-sm">{g.name}</span>)}</div></div>}
            <div className="mt-6"><h2 className="text-2xl font-bold text-foreground mb-2">Overview</h2><p className="text-gray-500 leading-relaxed">{movie.overview}</p></div>
            {director && <div className="mt-6"><h3 className="text-xl font-bold text-foreground">Director</h3><p className="text-gray-500">{director.name}</p></div>}
          </div>
        </div>
        
        {/* 6. Ad and Cast (Unchanged) */}
        <div className="xl:mx-40 my-8">
          <Adsense
              adSlot="9095823329"
              style={{ display: 'block' }}
              format="auto"
              responsive="true"
          />
        </div>
        {cast?.length > 0 && <div className="xl:mx-40 mt-12 relative"><h2 className="text-3xl font-bold text-foreground mb-4">Top Billed Cast</h2><div className="flex overflow-x-auto gap-5 pb-4 custom-scrollbar">{cast.map(actor => <CastCard key={actor.cast_id} actor={actor} />)}</div><div className="absolute top-12 right-0 bottom-0 w-16 bg-gradient-to-l from-background pointer-events-none"></div></div>}
        
        {/* 7. New Sections (Kept) */}
        <div className='xl:mx-40'>
          <Recommendations tmdbId={movie.id} mediaType="movies" />
          <CommentSection tmdbId={movie.id} mediaType="movies" />
        </div>
      </div>
    </div>
  );
}