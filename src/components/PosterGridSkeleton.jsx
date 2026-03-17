// A skeleton loader for any page that displays a grid of posters.
const PosterGridSkeleton = ({ count = 10 }) => {
  return (
    <div className="grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-secondary rounded-lg overflow-hidden animate-pulse">
          <div className="w-full aspect-[2/3] bg-surface"></div>
          <div className="p-4 space-y-3">
            <div className="h-6 bg-surface rounded w-3/4"></div>
            <div className="flex items-center justify-between mt-2">
              <div className="h-4 bg-surface rounded w-1/4"></div>
              <div className="h-4 bg-surface rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PosterGridSkeleton;