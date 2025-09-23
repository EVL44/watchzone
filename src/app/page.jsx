import PopularMovies from "../components/PopularMovies";
import PopularSeries from "../components/PopularSeries";
import Trending from "../components/Trending";

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
        <div className="mb-16">
          <Trending />
        </div>
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">Popular Movies</h2>
          <PopularMovies />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-6">Popular Series</h2>
          <PopularSeries />
        </div>
      </div>
    </>
  );
}