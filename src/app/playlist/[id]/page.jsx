// src/app/playlist/[id]/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import MediaGrid from '@/components/MediaGrid';

export default function PlaylistPage() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchPlaylist = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/playlists/${id}`);
          if (!res.ok) throw new Error('Playlist not found');
          const data = await res.json();
          setPlaylist(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchPlaylist();
    }
  }, [id]);

  if (loading) return <div className="text-center py-20">Loading playlist...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!playlist) return null;

  const combinedItems = [...(playlist.movies || []), ...(playlist.series || [])];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-foreground">{playlist.name}</h1>
        <p className="text-foreground/70">
          A playlist by <Link href={`/user/${playlist.user.username}`} className="font-bold hover:text-primary">{playlist.user.username}</Link>
        </p>
        {playlist.description && <p className="mt-2 max-w-2xl">{playlist.description}</p>}
      </div>
      <MediaGrid items={combinedItems} title="Items in this Playlist" />
    </div>
  );
}