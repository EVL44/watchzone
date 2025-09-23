// src/app/api/playlists/[playlistId]/route.js

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { playlistId } = params;

  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        user: { select: { username: true } },
        movies: true,
        series: true,
      },
    });

    if (!playlist) {
      return NextResponse.json({ message: 'Playlist not found' }, { status: 404 });
    }
    
    return NextResponse.json(playlist);
  } catch (error) {
    console.error('Failed to fetch playlist:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}