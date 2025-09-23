'use client';

// This is a reusable skeleton loader component to ensure consistent loading states.
const SkeletonLoader = ({ count = 10 }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-surface rounded-lg p-4 flex items-start animate-pulse">
          <div className="w-12 text-center text-2xl font-bold text-transparent bg-secondary rounded-md pt-2 flex-shrink-0">#</div>
          <div className="w-24 h-36 bg-secondary rounded-md ml-4"></div>
          <div className="flex-1 ml-4 space-y-3">
            <div className="h-6 bg-secondary rounded w-3/4"></div>
            <div className="h-4 bg-secondary rounded w-1/4"></div>
            <div className="h-4 bg-secondary rounded w-full"></div>
            <div className="h-4 bg-secondary rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
