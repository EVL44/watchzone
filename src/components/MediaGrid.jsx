// src/components/MediaGrid.jsx

import Link from 'next/link';
import Image from 'next/image';

export default function MediaGrid({ items, title }) {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      {items && items.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {items.map(item => {
            const itemType = item.title ? 'movie' : 'serie';
            const tmdbId = item.tmdbId || item.id;
            const posterPath = item.posterPath || item.poster_path;
            const itemName = item.title || item.name;

            // **THE FIX IS HERE**: The key is now guaranteed to be unique
            return (
              <Link href={`/${itemType}/${tmdbId}`} key={`${itemType}-${item.id}`}>
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                  {posterPath ? (
                    <Image src={`https://image.tmdb.org/t/p/w500${posterPath}`} alt={itemName} layout="fill" objectFit="cover" unoptimized={true} />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center p-2">
                      <span className="text-foreground/50 text-xs text-center">{itemName}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : <p className="text-foreground text-opacity-70">Nothing to see here yet.</p>}
    </div>
  );
};