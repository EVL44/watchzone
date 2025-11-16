import TopRatedSeries from "@/components/TopRatedSeries";
import Adsense from "@/components/Adsense"; 

// ** NEW: Added metadata for this page **
export const metadata = {
  title: "Top 300 Rated TV Series", // The template in layout.jsx will add "| watchzone"
  description: "Browse the top 300 all-time rated TV series, as ranked by users on watchzone. Find your next binge-watch.",
  keywords: ['top rated series', 'best tv shows', 'tv series rankings', 'watchzone', 'top 300 series'],
};

export default function TopRatedSeriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-foreground text-center mb-12">
        Top 300 Rated TV Series
      </h1>
      <div className="my-8 ">
        <Adsense
            adSlot="9095823329"
            style={{ display: 'block' }}
            format="auto"
            responsive="true"
        />
      </div>
      <TopRatedSeries />
    </div>
  );
}