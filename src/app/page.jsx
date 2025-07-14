import MovieCard from "../components/PopularMovies";

export default async function Home() {

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Popular Movies</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}