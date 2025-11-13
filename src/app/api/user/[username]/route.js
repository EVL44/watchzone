// src/app/api/user/[username]/route.js

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt'; // 1. Import next-auth's getToken

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { username } = params;
  
  // 2. Get the current session token using next-auth
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const currentUserId = token?.id || null;

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

    // 3. Destructure the password to remove it
    const { password, ...userProfile } = user;
    
    userProfile.followers = user.followers.map(f => f.follower);
    userProfile.following = user.following.map(f => f.following);
    userProfile.isFollowing = user.followers.some(f => f.follower.id === currentUserId);
    userProfile.isCurrentUser = user.id === currentUserId;

    // 4. THIS IS THE FIX
    // This flag tells the client if the user has a password or not
    userProfile.hasPassword = !!password;
    // ---
    
    if (!userProfile.isCurrentUser) {
      // Don't send email to other users
      delete userProfile.email; 
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}