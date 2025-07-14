import Image from 'next/image';

export default function CastCard({ actor }) {
  const placeholderImage = '/placeholder-person.png'; 
  const imageUrl = actor.profile_path
    ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
    : placeholderImage;

  return (
    <div className="w-36 flex-shrink-0">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-stone-800 shadow-md transition-transform duration-300 hover:scale-105">
        <Image
          src={imageUrl}
          alt={actor.name}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="mt-2 px-1">
        <p className="text-white font-semibold text-sm truncate">{actor.name}</p>
        <p className="text-gray-400 text-xs truncate">{actor.character}</p>
      </div>
    </div>
  );
}