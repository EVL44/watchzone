import PopularMovies from "../components/PopularMovies";
import PopularSeries from "../components/PopularSeries";
import Trending from "../components/Trending";
import Adsense from "@/components/Adsense";

export default function Home() {
  return (
    <>
      <div className="relative h-[60vh] flex items-center justify-center text-white text-center px-4 bg-cover bg-fixed  bg-center" style={{ backgroundImage: "url('/jhon_wick.jpg')" }}>
        <div className="absolute inset-0 bg-primary opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold">Welcome to Kentar</h1>
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