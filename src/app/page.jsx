import PopularMovies from "../components/PopularMovies";
import PopularSeries from "../components/PopularSeries";
import Trending from "../components/Trending";
import Adsense from "@/components/Adsense";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import HeroSearch from "@/components/HeroSearch";
import { headers } from 'next/headers';

// Helper function to fetch trending items directly from TMDB
async function getTrendingData(timeWindow = 'day') {
  const token = process.env.TMDB_API_TOKEN;
  if (!token) return [];
  
  const options = {
    method: 'GET',
    headers: { accept: 'application/json', Authorization: `Bearer ${token}` },
    next: { revalidate: 3600 }
  };
  
  try {
    const res = await fetch(`https://api.themoviedb.org/3/trending/all/${timeWindow}?language=en-US`, options);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Trending fetch error:', error);
    return [];
  }
}

function getTrendingBackdrop(items) {
  const itemsWithBackdrops = (Array.isArray(items) ? items : []).filter(item => item.backdrop_path);

  if (itemsWithBackdrops.length > 0) {
    const randomItem = itemsWithBackdrops[Math.floor(Math.random() * itemsWithBackdrops.length)];
    return `https://image.tmdb.org/t/p/original${randomItem.backdrop_path}`;
  }
  return '/jhon_wick.jpg';
}


export default async function Home() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  const initialTrending = await getTrendingData('day');
  const backgroundImage = getTrendingBackdrop(initialTrending);

  return (
    <>
      <div
        className="relative h-[65vh] flex items-center justify-center text-foreground text-center px-4 bg-cover bg-center"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        {/* 2. Update the z-10 container */}
        <div 
          className="relative z-10 w-full px-4" 
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
        >
          {user ? (
            <>
              <h1 className="text-5xl md:text-6xl font-extrabold"> Welcome back <span className="text-primary">{user.username}</span></h1>
              <p className="text-xl md:text-2xl mt-4 mb-8">Here is some movies and series you may like.</p>

            </>
          ) : (
            <>
              <h1 className="text-5xl md:text-6xl font-extrabold">WELCOME TO <span className="text-primary">WATCHZONE</span></h1>
              <p className="text-xl md:text-2xl mt-4 mb-8">Your ultimate destination for discovering and tracking movies and TV shows.</p>
            </>
          )}
          <HeroSearch />

        </div>
      </div>

      {/* (Rest of your page content) */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-16">
          <Trending initialData={initialTrending} />
        </div>
        <div className="my-8">
          <Adsense
            adSlot="9786088462"
            style={{ display: 'block' }}
            format="auto"
            responsive="true"
          />
        </div>
        <div className="mb-16">
          <PopularMovies />
        </div>
        <div className="my-8">
          <Adsense
            adSlot="9786088462"
            style={{ display: 'block' }}
            format="auto"
            responsive="true"
          />
        </div>
        <div>
          <PopularSeries />
        </div>
        <div className="my-8">
          <Adsense
            adSlot="9786088462"
            style={{ display: 'block' }}
            format="auto"
            responsive="true"
          />
        </div>
      </div>
    </>
  );
}