// A skeleton loader for the user profile pages.
const ProfileSkeleton = () => {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        {/* Header */}
        <div className="bg-surface p-6 rounded-lg mb-8 md:flex md:items-center">
          <div className="relative w-32 h-32 bg-secondary rounded-full mx-auto md:mx-0 mb-4 md:mb-0 md:mr-6 flex-shrink-0"></div>
          <div className="flex-grow text-center md:text-left space-y-3">
            <div className="h-9 bg-secondary rounded w-48 mx-auto md:mx-0"></div>
            <div className="h-5 bg-secondary rounded w-64 mx-auto md:mx-0"></div>
            <div className="h-5 bg-secondary rounded w-3/4 max-w-sm mx-auto md:mx-0 mt-2"></div>
          </div>
        </div>
        
        {/* Body Layout */}
        <div className="md:flex gap-8">
          {/* Sidebar */}
          <aside className="md:w-1/4 flex-shrink-0">
            <nav className="bg-surface p-4 rounded-lg space-y-2">
              <div className="h-12 bg-secondary rounded w-full"></div>
              <div className="h-12 bg-secondary rounded w-full"></div>
              <div className="h-12 bg-secondary rounded w-full"></div>
              <div className="h-12 bg-secondary rounded w-full"></div>
              <div className="mt-6 pt-4 border-t border-secondary">
                <div className="h-12 bg-secondary rounded w-full"></div>
              </div>
            </nav>
          </aside>
          
          {/* Main Content Grid */}
          <main className="flex-1 mt-8 md:mt-0">
            <div className="bg-surface p-6 rounded-lg">
              <div className="h-8 bg-secondary rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="bg-secondary rounded-lg overflow-hidden">
                    <div className="w-full aspect-[2/3] bg-secondary/50"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-secondary/50 rounded w-3/4"></div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="h-4 bg-secondary/50 rounded w-1/4"></div>
                        <div className="h-4 bg-secondary/50 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  };
  
  export default ProfileSkeleton;