import PosterGridSkeleton from "../components/PosterGridSkeleton";

export default function HomeLoading() {
  return (
    <>
      {/* 1. Skeleton for the Hero Section */}
      <div 
        className="relative h-[60vh] flex items-center justify-center text-center px-4 bg-secondary animate-pulse" 
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        <div className="relative z-10 w-full px-4">
          {/* Skeleton for Title */}
          <div className="h-14 md:h-16 bg-surface/30 rounded-lg w-3/4 max-w-2xl mx-auto mb-4"></div>
          {/* Skeleton for Subtitle */}
          <div className="h-6 md:h-8 bg-surface/30 rounded-lg w-1/2 max-w-lg mx-auto mb-8"></div>
          {/* Skeleton for Search Bar */}
          <div className="h-14 bg-surface/30 rounded-2xl w-full max-w-xl mx-auto"></div>
        </div>
      </div>
      
      {/* 2. Skeleton for the page content */}
      <div className="container mx-auto px-4 py-8">
        {/* Skeleton for Ad */}
        <div className="h-24 bg-surface rounded-lg w-full max-w-4xl mx-auto my-8 animate-pulse"></div>

        {/* Skeleton for Trending */}
        <div className="mb-16">
          <div className="h-10 bg-surface rounded-lg w-1/3 mb-6 animate-pulse"></div>
          <PosterGridSkeleton count={5} />
        </div>
        
        {/* Skeleton for Ad */}
        <div className="h-24 bg-surface rounded-lg w-full max-w-4xl mx-auto my-8 animate-pulse"></div>

        {/* Skeleton for Popular Movies */}
        <div className="mb-16">
          <div className="h-10 bg-surface rounded-lg w-1/4 mb-6 animate-pulse"></div>
          <PosterGridSkeleton count={5} />
        </div>

        {/* Skeleton for Ad */}
        <div className="h-24 bg-surface rounded-lg w-full max-w-4xl mx-auto my-8 animate-pulse"></div>
        
        {/* Skeleton for Popular Series */}
        <div>
          <div className="h-10 bg-surface rounded-lg w-1/4 mb-6 animate-pulse"></div>
          <PosterGridSkeleton count={5} />
        </div>
      </div>
    </>
  );
}