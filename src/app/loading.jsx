import PosterGridSkeleton from "@/components/PosterGridSkeleton";

export default function HomeLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-16">
        <div className="h-10 bg-surface rounded-lg w-1/3 mb-6 animate-pulse"></div>
        <PosterGridSkeleton count={5} />
      </div>
      <div className="mb-16">
        <div className="h-10 bg-surface rounded-lg w-1/4 mb-6 animate-pulse"></div>
        <PosterGridSkeleton count={5} />
      </div>
    </div>
  );
}