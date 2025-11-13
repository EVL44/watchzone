import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt'; // 1. Import next-auth's getToken

export async function POST(request) {
  // 2. Get the user's session token
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const currentUserId = token.id; // 3. Get the ID from the token
    const { targetUserId, action } = await request.json(); // action: 'follow' or 'unfollow'

    if (!targetUserId || !action) {
      return NextResponse.json({ message: 'Missing target user ID or action' }, { status: 400 });
    }
    
    // --- THIS IS THE FIX ---
    if (currentUserId === targetUserId) {
        return NextResponse.json({ message: 'You cannot follow yourself' }, { status: 400 });
    }
    // --- END OF FIX ---

    if (action === 'follow') {
      await prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUserId,
          },
        },
        update: {},
        create: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      });
      return NextResponse.json({ message: 'Successfully followed user' });
    } else if (action === 'unfollow') {
      await prisma.follow.deleteMany({
        where: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      });
      return NextResponse.json({ message: 'Successfully unfollowed user' });
    } else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Follow/Unfollow API Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}