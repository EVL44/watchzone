import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET user's playlists
export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    
    const decoded = await verifyToken(token);
    const userId = decoded.id;

    const playlists = await prisma.playlist.findMany({
      where: { userId },
      select: { id: true, name: true }
    });

    return NextResponse.json(playlists);
  } catch (error) {
    console.error('Failed to fetch playlists:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}


// POST to create a new playlist
export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const decoded = await verifyToken(token);
    const userId = decoded.id;

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ message: 'Playlist name is required' }, { status: 400 });
    }

    const newPlaylist = await prisma.playlist.create({
      data: {
        name,
        description,
        userId,
      },
    });

    return NextResponse.json(newPlaylist, { status: 201 });
  } catch (error) {
    console.error('Failed to create playlist:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
