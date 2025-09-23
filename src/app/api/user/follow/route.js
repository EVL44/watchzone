import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const decoded = await verifyToken(token);
    const currentUserId = decoded.id;

    const { targetUserId, action } = await request.json(); // action: 'follow' or 'unfollow'

    if (!targetUserId || !action) {
      return NextResponse.json({ message: 'Missing target user ID or action' }, { status: 400 });
    }
    
    if (currentUserId === targetUserId) {
        return NextResponse.json({ message: 'You cannot follow yourself' }, { status: 400 });
    }

    if (action === 'follow') {
      // Use upsert to prevent creating duplicate follow records
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
