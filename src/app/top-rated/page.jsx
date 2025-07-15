import TopRatedMovies from "@/components/TopRatedMovies";

export default function TopRatedPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-white text-center mb-12">
        Top 300 Rated Movies
      </h1>
      <TopRatedMovies />
    </div>
  );
}