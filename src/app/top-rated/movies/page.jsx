import TopRatedMovies from "@/components/TopRatedMovies";
import Adsense from "@/components/Adsense"; 

export const metadata = {
  title: "watchzone - Top 300 Rated Movies",
  description: "Browse the top 300 all-time rated movies, as ranked by users. Find your next great film to watch.",
};

export default function TopRatedPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-foreground text-center mb-12">
        Top 300 Rated Movies
      </h1>
      <div className="my-8 ">
        <Adsense
            adSlot="9095823329"
            style={{ display: 'block' }}
            format="auto"
            responsive="true"
        />
      </div>
      <TopRatedMovies />
    </div>
  );
}