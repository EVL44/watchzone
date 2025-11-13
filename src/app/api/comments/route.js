import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

// GET comments for a specific item
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tmdbId = parseInt(searchParams.get('tmdbId'));
  const mediaType = searchParams.get('mediaType');

  if (!tmdbId || !mediaType) {
    return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: {
        tmdbId,
        mediaType,
      },
      include: {
        user: {
          select: { username: true, avatarUrl: true, name: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST a new comment
export async function POST(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const userId = token.id;

    const { tmdbId, mediaType, text } = await request.json();

    if (!tmdbId || !mediaType || !text) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newComment = await prisma.comment.create({
      data: {
        text,
        tmdbId: parseInt(tmdbId),
        mediaType,
        userId,
      },
      include: {
        user: {
          select: { username: true, avatarUrl: true, name: true },
        },
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Failed to create comment:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}