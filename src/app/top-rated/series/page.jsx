import TopRatedSeries from "@/components/TopRatedSeries";
import Adsense from "@/components/Adsense"; 

export default function TopRatedSeriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-foreground text-center mb-12">
        Top 300 Rated TV Series
      </h1>
      <div className="my-8">
        <Adsense
            adSlot="9095823329"
            style={{ display: 'block' }}
            format="autorelaxed"
        />
      </div>
      <TopRatedSeries />
    </div>
  );
}