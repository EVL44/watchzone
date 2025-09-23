// src/app/api/user/[username]/route.js

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { username } = params;
  const token = request.cookies.get('token')?.value;
  let currentUserId = null;

  if (token) {
    try {
      const decoded = await verifyToken(token);
      currentUserId = decoded.id;
    } catch (error) {
      console.log("Invalid token, proceeding as guest.");
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        favoriteMovies: true,
        watchlistMovies: true,
        favoriteSeries: true,
        watchlistSeries: true,
        playlists: {
          select: { 
            id: true, 
            name: true, 
            description: true,
            // Fetch first 4 of each to build the poster grid
            movies: { take: 4, select: { posterPath: true, id: true } }, 
            series: { take: 4, select: { posterPath: true, id: true } },
            _count: {
              select: { movies: true, series: true }
            }
          }
        },
        followers: { select: { follower: { select: { id: true, username: true, avatarUrl: true } } } },
        following: { select: { following: { select: { id: true, username: true, avatarUrl: true } } } },
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { password, ...userProfile } = user;
    userProfile.followers = user.followers.map(f => f.follower);
    userProfile.following = user.following.map(f => f.following);
    userProfile.isFollowing = user.followers.some(f => f.follower.id === currentUserId);
    userProfile.isCurrentUser = user.id === currentUserId;

    if (!userProfile.isCurrentUser) {
      delete userProfile.email;
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}