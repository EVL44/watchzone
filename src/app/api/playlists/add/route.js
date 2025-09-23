import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST to add a movie or series to a playlist
export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    
    const decoded = await verifyToken(token);
    const userId = decoded.id;

    const { playlistId, item, itemType } = await request.json(); // itemType is 'movie' or 'series'

    if (!playlistId || !item || !itemType) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Ensure the user owns the playlist
    const playlist = await prisma.playlist.findFirst({
      where: { id: playlistId, userId }
    });

    if (!playlist) {
      return NextResponse.json({ message: 'Playlist not found or you do not have permission to edit it' }, { status: 404 });
    }
    
    // Upsert the movie/series to ensure it exists in our DB
    const mediaModel = itemType === 'movie' ? prisma.movie : prisma.series;
    const createPayload = itemType === 'movie'
      ? { tmdbId: item.id, title: item.title, posterPath: item.poster_path, releaseDate: item.release_date }
      : { tmdbId: item.id, name: item.name, posterPath: item.poster_path, firstAirDate: item.first_air_date };
      
    const mediaItem = await mediaModel.upsert({
      where: { tmdbId: item.id },
      update: {},
      create: createPayload,
    });

    // Add the item to the playlist
    const relationField = itemType === 'movie' ? 'movies' : 'series';
    await prisma.playlist.update({
      where: { id: playlistId },
      data: {
        [relationField]: {
          connect: { id: mediaItem.id }
        }
      }
    });

    return NextResponse.json({ message: 'Item added to playlist successfully' });

  } catch (error) {
    console.error('Failed to add item to playlist:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
