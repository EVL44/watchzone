import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

// DELETE a comment
export async function DELETE(request, { params }) {
  const commentId = params.id;
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const userId = token.id;

    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
    }

    // Check if the user owns the comment
    if (comment.userId !== userId) {
      return NextResponse.json({ message: 'You are not authorized to delete this comment' }, { status: 403 });
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}