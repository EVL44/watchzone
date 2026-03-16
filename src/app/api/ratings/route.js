import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET ratings for a specific media item
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tmdbId = parseInt(searchParams.get('tmdbId'));
    const mediaType = searchParams.get('mediaType'); // "movie" or "series"
    const userId = searchParams.get('userId'); // Optional: get ratings by user

    if (userId) {
      // Get all ratings by a specific user (for profile page)
      const ratings = await prisma.rating.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });
      return NextResponse.json(ratings);
    }

    if (!tmdbId || !mediaType) {
      return NextResponse.json({ message: 'tmdbId and mediaType are required' }, { status: 400 });
    }

    // Get community ratings for this media
    const ratings = await prisma.rating.findMany({
      where: { tmdbId, mediaType },
      include: {
        user: {
          select: { id: true, username: true, avatarUrl: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
    });

    const totalRatings = ratings.length;
    const averageScore = totalRatings > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / totalRatings
      : 0;

    // Check if current user has rated
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    let userRating = null;
    if (token?.id) {
      userRating = ratings.find(r => r.userId === token.id) || null;
    }

    return NextResponse.json({
      averageScore: Math.round(averageScore * 10) / 10,
      totalRatings,
      userRating,
      ratings: ratings.slice(0, 10), // Return top 10 recent ratings
    });
  } catch (error) {
    console.error('Get Ratings Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST/UPDATE a rating
export async function POST(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { tmdbId, mediaType, score, review } = await request.json();

    if (!tmdbId || !mediaType || score === undefined) {
      return NextResponse.json({ message: 'tmdbId, mediaType, and score are required' }, { status: 400 });
    }

    if (score < 0.5 || score > 5) {
      return NextResponse.json({ message: 'Score must be between 0.5 and 5' }, { status: 400 });
    }

    const rating = await prisma.rating.upsert({
      where: {
        userId_tmdbId_mediaType: {
          userId: token.id,
          tmdbId: parseInt(tmdbId),
          mediaType,
        }
      },
      update: { score, review: review || null },
      create: {
        userId: token.id,
        tmdbId: parseInt(tmdbId),
        mediaType,
        score,
        review: review || null,
      },
    });

    return NextResponse.json(rating);
  } catch (error) {
    console.error('Create Rating Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE a rating
export async function DELETE(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { tmdbId, mediaType } = await request.json();

    await prisma.rating.delete({
      where: {
        userId_tmdbId_mediaType: {
          userId: token.id,
          tmdbId: parseInt(tmdbId),
          mediaType,
        }
      },
    });

    return NextResponse.json({ message: 'Rating deleted' });
  } catch (error) {
    console.error('Delete Rating Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
