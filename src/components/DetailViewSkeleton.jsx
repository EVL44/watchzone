// A skeleton loader for the movie and series detail pages.
const DetailViewSkeleton = () => {
  return (
    <div className="min-h-screen animate-pulse">
      {/* 1. Skeleton for Backdrop */}
      <div className="absolute top-0 left-0 w-full h-[80vh] -z-10 bg-secondary">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
      </div>

      {/* 3. Main Content Container */}
      <div className="container mt-30 px-4 py-16 md:py-24 ">
        <div className="xl:mx-40 md:flex md:gap-8">
          
          {/* 4. Skeleton for Poster (matching md:w-1/4) */}
          <div className="md:w-1/4 flex-shrink-0">
            <div className="relative w-full aspect-[2/3] rounded-lg bg-surface"></div>
          </div>
          
          {/* 5. Skeleton for Details (matching md:w-2/3) */}
          <div className="md:w-2/3 mt-8 md:mt-0">
            {/* Title */}
            <div className="h-12 bg-surface rounded w-3/4 mb-4"></div>
            {/* Tagline */}
            <div className="h-6 bg-surface rounded w-1/2 mb-6"></div>
            
            {/* Stats */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-500 mt-4 mb-8">
              <div className="h-6 bg-surface rounded w-20"></div>
              <div className="h-6 bg-surface rounded w-24"></div>
              <div className="h-6 bg-surface rounded w-28"></div>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface rounded-full"></div>
                <div className="w-12 h-12 bg-surface rounded-full"></div>
                <div className="w-12 h-12 bg-surface rounded-full"></div>
              </div>
              <div className="w-full md:w-40 h-12 bg-surface rounded-lg"></div>
            </div>

            {/* Genres */}
            <div className="h-8 bg-surface rounded w-1/4 mt-8 mb-2"></div>
            <div className="flex flex-wrap gap-2">
              <div className="h-7 bg-surface rounded-full w-20"></div>
              <div className="h-7 bg-surface rounded-full w-24"></div>
              <div className="h-7 bg-surface rounded-full w-16"></div>
            </div>

            {/* Overview */}
            <div className="h-8 bg-surface rounded w-1/4 mt-8 mb-2"></div>
            <div className="space-y-3">
              <div className="h-4 bg-surface rounded w-full"></div>
              <div className="h-4 bg-surface rounded w-full"></div>
              <div className="h-4 bg-surface rounded w-5/6"></div>
            </div>
          </div>
        </div>
        
        {/* 6. Skeleton for Ad and Cast */}
        <div className="xl:mx-40 my-8">
          <div className="h-24 bg-surface rounded-lg w-full max-w-4xl mx-auto"></div>
        </div>

        <div className="xl:mx-40 mt-12 relative">
          <div className="h-9 bg-surface rounded w-1/3 mb-4"></div>
          <div className="flex overflow-x-auto gap-5 pb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-secondary rounded-lg w-40 flex-shrink-0">
                <div className="w-full h-48 bg-surface rounded-t-lg"></div>
                <div className="p-2">
                  <div className="h-5 bg-surface rounded w-3/4 mb-1"></div>
                  <div className="h-4 bg-surface rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 7. Skeleton for Recommendations and Comments */}
        <div className='xl:mx-40'>
          {/* Recommendations */}
          <div className="mt-12">
            <div className="h-9 bg-surface rounded w-1/3 mb-4"></div>
            <div className="flex overflow-x-auto gap-5 pb-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-secondary rounded-lg w-40 flex-shrink-0">
                  <div className="w-full h-60 bg-surface rounded-t-lg"></div>
                  <div className="p-3">
                    <div className="h-5 bg-surface rounded w-3/4 mb-1"></div>
                    <div className="h-4 bg-surface rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Comments */}
          <div className="mt-12">
            <div className="h-9 bg-surface rounded w-1/3 mb-6"></div>
            <div className="bg-surface p-6 rounded-lg">
              {/* Comment Form Skeleton */}
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-secondary rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-20 bg-secondary rounded-md"></div>
                  <div className="h-10 bg-secondary rounded-md w-24 ml-auto"></div>
                </div>
              </div>
              {/* Comment List Skeleton */}
              <div className="mt-8 space-y-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 bg-secondary rounded-full flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-secondary rounded w-1/4"></div>
                      <div className="h-4 bg-secondary rounded w-full"></div>
                      <div className="h-4 bg-secondary rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailViewSkeleton;