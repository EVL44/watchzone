const UserProfileSkeleton = () => {
    return (
      <div className="min-h-screen animate-pulse">
        {/* Banner Section */}
        <div className="relative w-full h-48 md:h-64 bg-secondary overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
  
        {/* Profile Header */}
        <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
            {/* Avatar */}
            <div className="w-28 h-28 md:w-36 md:h-36 flex-shrink-0">
              <div className="w-full h-full rounded-full border-4 border-background bg-surface shadow-xl"></div>
            </div>
  
            {/* Username + Bio */}
            <div className="flex-grow text-center md:text-left pb-2 w-full flex flex-col items-center md:items-start">
              <div className="h-8 bg-surface rounded w-48 mb-2"></div>
              <div className="h-4 bg-surface rounded w-64 max-w-full"></div>
              <div className="h-4 bg-surface rounded w-48 max-w-full mt-1"></div>
            </div>
  
            {/* Follow Button */}
            <div className="w-24 h-10 bg-surface rounded-full mb-2"></div>
          </div>
  
          {/* Stats Bar */}
          <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-2 border-b border-secondary pb-4">
             <div className="h-6 bg-surface rounded w-16"></div>
             <div className="h-6 bg-surface rounded w-16"></div>
             <div className="h-6 bg-surface rounded w-16"></div>
             <div className="h-6 bg-surface rounded w-20"></div>
             <div className="h-6 bg-surface rounded w-20"></div>
          </div>
  
          {/* Tabs */}
          <div className="mt-2 -mb-px">
            <nav className="flex space-x-1 overflow-x-auto">
              <div className="h-10 bg-surface rounded w-24 mr-2"></div>
              <div className="h-10 bg-surface rounded w-24 mr-2"></div>
              <div className="h-10 bg-surface rounded w-24 mr-2"></div>
              <div className="h-10 bg-surface rounded w-24 mr-2"></div>
              <div className="h-10 bg-surface rounded w-24 mr-2"></div>
            </nav>
          </div>
        </div>
  
        {/* Tab Content */}
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="bg-surface p-6 rounded-lg mb-6">
             <div className="h-8 bg-secondary/50 rounded w-1/4 mb-6"></div>
             <div className="grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
               {Array.from({ length: 10 }).map((_, index) => (
                 <div key={index} className="bg-secondary/50 rounded-lg overflow-hidden">
                   <div className="w-full aspect-[2/3] bg-secondary"></div>
                   <div className="p-4 space-y-3">
                     <div className="h-6 bg-secondary rounded w-3/4"></div>
                     <div className="flex items-center justify-between mt-2">
                       <div className="h-4 bg-secondary rounded w-1/4"></div>
                       <div className="h-4 bg-secondary rounded w-1/4"></div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default UserProfileSkeleton;
