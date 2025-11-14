import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

// POST to like/unlike a comment
export async function POST(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const userId = token.id;

    const { commentId } = await request.json();

    if (!commentId) {
      return NextResponse.json({ message: 'Comment ID is required' }, { status: 400 });
    }

    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { likedByIds: true },
    });

    if (!comment) {
      return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
    }

    const hasLiked = comment.likedByIds.includes(userId);
    let action;

    if (hasLiked) {
      // User has liked, so UNLIKE
      action = 'unlike';
      await prisma.$transaction([
        // Remove user from comment's likedByIds
        prisma.comment.update({
          where: { id: commentId },
          data: {
            likedByIds: {
              pull: userId,
            },
          },
        }),
        // Remove comment from user's likedCommentsIds
        prisma.user.update({
          where: { id: userId },
          data: {
            likedCommentsIds: {
              pull: commentId,
            },
          },
        }),
      ]);
    } else {
      // User has not liked, so LIKE
      action = 'like';
      await prisma.$transaction([
        // Add user to comment's likedByIds
        prisma.comment.update({
          where: { id: commentId },
          data: {
            likedByIds: {
              push: userId,
            },
          },
        }),
        // Add comment to user's likedCommentsIds
        prisma.user.update({
          where: { id: userId },
          data: {
            likedCommentsIds: {
              push: commentId,
            },
          },
        }),
      ]);
    }

    return NextResponse.json({ success: true, action });

  } catch (error) {
    console.error('Failed to like/unlike comment:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}