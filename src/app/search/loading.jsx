import PosterGridSkeleton from "@/components/PosterGridSkeleton";

export default function SearchLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-10 bg-surface rounded-lg w-1/2 mx-auto mb-12 animate-pulse"></div>
      <PosterGridSkeleton count={15} />
    </div>
  );
}