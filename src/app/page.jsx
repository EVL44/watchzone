import PopularMovies from "../components/PopularMovies";
import PopularSeries from "../components/PopularSeries";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-foreground">
          Welcome to <span className="text-primary">Kentar</span>
        </h1>
        <p className="text-gray-400 mt-2">
          Your ultimate destination for discovering and tracking movies and TV shows.
        </p>
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
  );
}