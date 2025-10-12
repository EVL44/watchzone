import PopularMovies from "../components/PopularMovies";
import PopularSeries from "../components/PopularSeries";
import Trending from "../components/Trending";
import Adsense from "@/components/Adsense";

// Helper function to fetch trending items
async function getTrendingBackdrop() {
  try {
    // Fetch trending items from your API route
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trending?time_window=day`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch trending data');
    }
    const data = await res.json();

    // Filter for items that have a backdrop image
    const itemsWithBackdrops = data.filter(item => item.backdrop_path);
    
    // Pick a random item from the list
    if (itemsWithBackdrops.length > 0) {
      const randomItem = itemsWithBackdrops[Math.floor(Math.random() * itemsWithBackdrops.length)];
      return `https://image.tmdb.org/t/p/original${randomItem.backdrop_path}`;
    }
  } catch (error) {
    console.error(error);
  }
  // Return the default image if the fetch fails or no backdrops are found
  return '/jhon_wick.jpg';
}


export default async function Home() {
  const backgroundImage = await getTrendingBackdrop();

  return (
    <>
      <div 
        className="relative h-[60vh] flex items-center justify-center text-white text-center px-4 bg-cover bg-fixed bg-center" 
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      >
        <div className="absolute inset-0 bg-primary opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold">Welcome to WatchZone</h1>
          <p className="text-xl md:text-2xl mt-4">Your ultimate destination for discovering and tracking movies and TV shows.</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {/* Horizontal Ad */}
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
          <h2 className="text-3xl font-bold text-foreground mb-6">Popular Movies</h2>
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
          <h2 className="text-3xl font-bold text-foreground mb-6">Popular Series</h2>
          <PopularSeries />
        </div>
      </div>
    </>
  );
}