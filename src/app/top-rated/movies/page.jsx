import TopRatedMovies from "@/components/TopRatedMovies";
import Adsense from "@/components/Adsense"; 

// Updated metadata to be more specific and include brand
export const metadata = {
  title: "Top 300 Rated Movies", // The template in layout.jsx will add "| watchzone"
  description: "Browse the top 300 all-time rated movies, as ranked by users on watchzone. Find your next great film to watch.",
  keywords: ['top rated movies', 'best movies', 'movie rankings', 'watchzone', 'top 300 movies'],
};

export default function TopRatedPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-foreground text-center mb-12">
        Top 300 Rated Movies
      </h1>
      <div className="my-8 mx-10 w-full flex justify-center">
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