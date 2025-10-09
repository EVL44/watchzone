// src/components/PlaylistCard.jsx

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaThList } from 'react-icons/fa';

export default function PlaylistCard({ playlist }) {
  // Combine movies and series, then take the first 4 for the grid
  const items = [...(playlist.movies || []), ...(playlist.series || [])];
  const posters = items.slice(0, 4).map(item => item.posterPath);
  const totalItems = (playlist._count?.movies || 0) + (playlist._count?.series || 0);

  // Pad the array with placeholders if there are fewer than 4 items
  while (posters.length < 4) {
    posters.push(null);
  }

  return (
    <Link href={`/playlist/${playlist.id}`}>
      <div className="bg-secondary rounded-lg overflow-hidden group cursor-pointer transition-transform duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl">
        <div className="relative w-full aspect-square grid grid-cols-2 grid-rows-2">
          {posters.map((poster, index) => (
            <div key={index} className="relative bg-surface overflow-hidden">
              {poster ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w300${poster}`}
                  alt="Playlist item"
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-500 group-hover:scale-110"
                  unoptimized={true}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaThList className="text-foreground/10 text-4xl" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-4">
          <h4 className="font-bold text-lg text-foreground truncate transition-colors group-hover:text-primary">{playlist.name}</h4>
          <p className="text-sm text-foreground/70">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
        </div>
      </div>
    </Link>
  );
}