import PosterGridSkeleton from "../../../components/PosterGridSkeleton";

export default function PlaylistLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="mb-8">
        {/* Skeleton for Title */}
        <div className="h-10 bg-surface rounded w-3/4 mb-3"></div>
        {/* Skeleton for User */}
        <div className="h-5 bg-surface rounded w-1/4 mb-4"></div>
        {/* Skeleton for Description */}
        <div className="h-4 bg-surface rounded w-1/2"></div>
      </div>
      
      {/* Skeleton for Media Grid */}
      <div className="h-8 bg-surface rounded w-1/3 mb-4"></div>
      <PosterGridSkeleton count={12} />
    </div>
  );
}