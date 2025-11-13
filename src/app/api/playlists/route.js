import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt'; // 1. Import next-auth's getToken
// import { verifyToken } from '@/lib/auth'; // 2. Remove old auth

export const dynamic = 'force-dynamic';

// GET user's playlists
export async function GET(request) {
  try {
    // --- THIS IS THE FIX ---
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const userId = token.id;
    // --- END OF FIX ---

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
    // --- THIS IS THE FIX ---
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const userId = token.id;
    // --- END OF FIX ---

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