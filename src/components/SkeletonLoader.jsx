'use client';

// This is a reusable skeleton loader component to ensure consistent loading states.
const SkeletonLoader = ({ count = 10 }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-surface rounded-lg p-4 flex items-start animate-pulse">
          <div className="w-12 text-center pt-2 flex-shrink-0">
             <div className="h-6 bg-secondary rounded mx-auto w-6"></div>
          </div>
          <div className="w-24 h-36 bg-secondary rounded-md flex-shrink-0"></div>
          <div className="flex-1 ml-4">
            <div className="h-6 bg-secondary rounded w-1/2"></div>
            <div className="h-4 bg-secondary rounded w-12 mt-2"></div>
            <div className="h-5 bg-secondary rounded w-8 mt-4"></div>
            <div className="space-y-2 mt-4">
              <div className="h-3 bg-secondary rounded w-full"></div>
              <div className="h-3 bg-secondary rounded w-5/6"></div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-start gap-3 pl-4">
            <div className="w-10 h-10 bg-secondary rounded-full"></div>
            <div className="w-10 h-10 bg-secondary rounded-full"></div>
            <div className="w-10 h-10 bg-secondary rounded-full"></div>
            <div className="w-10 h-10 bg-secondary rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
