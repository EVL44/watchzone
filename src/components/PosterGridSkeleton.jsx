// A skeleton loader for any page that displays a grid of posters.
const PosterGridSkeleton = ({ count = 10 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="w-full aspect-[2/3] bg-surface rounded-lg animate-pulse"></div>
          <div className="h-4 bg-surface rounded w-3/4 animate-pulse"></div>
          <div className="h-3 bg-surface rounded w-1/2 animate-pulse"></div>
        </div>
      ))}
    </div>
  );
};

export default PosterGridSkeleton;