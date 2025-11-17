import PopularMovies from "../components/PopularMovies";
import PopularSeries from "../components/PopularSeries";
import Trending from "../components/Trending";
import Adsense from "@/components/Adsense";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import HeroSearch from "@/components/HeroSearch"; // 1. Import the new component

// Helper function to fetch trending items
async function getTrendingBackdrop() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trending?time_window=day`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch trending data');
    }
    const data = await res.json();
    const itemsWithBackdrops = data.filter(item => item.backdrop_path);
    
    if (itemsWithBackdrops.length > 0) {
      const randomItem = itemsWithBackdrops[Math.floor(Math.random() * itemsWithBackdrops.length)];
      return `https://image.tmdb.org/t/p/original${randomItem.backdrop_path}`;
    }
  } catch (error) {
    console.error(error);
  }
  return '/jhon_wick.jpg';
}


export default async function Home() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  const backgroundImage = await getTrendingBackdrop();

  return (
    <>
      <div 
        className="relative h-[60vh] flex items-center justify-center text-white text-center px-4 bg-cover bg-center" 
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      >
        <div className="absolute inset-0 bg-primary opacity-40"></div>
        {/* 2. Update the z-10 container */}
        <div className="relative z-10 w-full px-4">
          {user ? (
            <h1 className="text-5xl md:text-6xl font-extrabold"> Welcome back <span>{user.username}</span></h1>
          ):(
            <h1 className="text-5xl md:text-6xl font-extrabold">Welcome to WatchZone</h1>
          )}
          
          <p className="text-xl md:text-2xl mt-4 mb-8">Your ultimate destination for discovering and tracking movies and TV shows.</p>
          
          <HeroSearch />
          
        </div>
      </div>
      
      {/* (Rest of your page content) */}
      <div className="container mx-auto px-4 py-8">
        <div className="my-8">
          <Adsense
            adSlot="9786088462"
            style={{ display: 'block' }}
            format="auto"
            responsive="true"
          />
        </div>
        <div className="mb-16">
          <Trending />
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
      </div>
    </>
  );
}