// A skeleton loader for the movie and series detail pages.
const DetailViewSkeleton = () => {
    return (
      <div className="container mt-30 mx-auto px-4 py-16 md:py-24 animate-pulse">
        <div className="md:flex md:gap-8">
          <div className="md:w-1/3 flex-shrink-0">
            <div className="relative w-full aspect-[2/3] rounded-lg bg-surface"></div>
          </div>
          <div className="md:w-2/3 mt-8 md:mt-0">
            <div className="h-12 bg-surface rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-surface rounded w-1/2 mb-6"></div>
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-surface rounded-full"></div>
                <div className="w-12 h-12 bg-surface rounded-full"></div>
                <div className="w-12 h-12 bg-surface rounded-full"></div>
                <div className="w-40 h-12 bg-surface rounded-lg"></div>
            </div>
            <div className="space-y-3">
                <div className="h-4 bg-surface rounded w-full"></div>
                <div className="h-4 bg-surface rounded w-full"></div>
                <div className="h-4 bg-surface rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default DetailViewSkeleton;