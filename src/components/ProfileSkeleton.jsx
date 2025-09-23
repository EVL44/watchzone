// A skeleton loader for the user profile pages.
const ProfileSkeleton = () => {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="bg-surface p-6 rounded-lg mb-8 md:flex md:items-center">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-secondary rounded-full mx-auto md:mx-0 md:mr-6 flex-shrink-0"></div>
          <div className="flex-grow text-center md:text-left">
            <div className="h-8 bg-secondary rounded w-48 mx-auto md:mx-0"></div>
            <div className="flex justify-center md:justify-start items-center gap-6 mt-4">
              <div className="h-10 bg-secondary rounded w-20"></div>
              <div className="h-10 bg-secondary rounded w-20"></div>
              <div className="h-10 bg-secondary rounded w-20"></div>
            </div>
          </div>
        </div>
        <div className="h-12 bg-surface rounded-lg mb-6"></div>
        <div className="bg-surface p-6 rounded-lg">
           <div className="h-8 bg-secondary rounded w-1/4 mb-6"></div>
           <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="w-full aspect-[2/3] bg-secondary rounded-lg"></div>
              ))}
           </div>
        </div>
      </div>
    );
  };
  
  export default ProfileSkeleton;