import Image from 'next/image';
import { FaUserCircle } from 'react-icons/fa';

export default function CastCard({ actor }) {
  const imageUrl = actor.profile_path
    ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
    : '/placeholder.png'; // Make sure you have a placeholder image or handle it differently

  return (
    <div className="bg-secondary rounded-lg overflow-hidden text-center w-40 flex-shrink-0">
        <div className="w-full h-48 relative">
            {actor.profile_path ? (
                <Image
                    src={imageUrl}
                    alt={actor.name}
                    layout="fill"
                    objectFit="cover"
                    unoptimized={true} 
                />
            ) : (
                <div className="w-full h-full bg-surface flex items-center justify-center">
                    <FaUserCircle className="text-5xl text-stone-500" />
                </div>
            )}
        </div>
      <div className="p-2">
        <p className="font-bold text-foreground text-sm truncate">{actor.name}</p>
        <p className="text-xs text-gray-500 truncate">{actor.character}</p>
      </div>
    </div>
  );
}