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
          select: { id: true, username: true, avatarUrl: true, name: true, roles: true, email: true }, // Include email
        },
      },
      orderBy: {
        createdAt: 'desc', 
      },
    });

    // --- SUPER ADMIN CHECK ---
    // Manually add `isSuperAdmin` flag to each comment's user
    const commentsWithSuperAdmin = comments.map(comment => ({
      ...comment,
      user: {
        ...comment.user,
        isSuperAdmin: comment.user.email === process.env.SUPER_ADMIN_EMAIL,
        // Force roles for Super Admin in comments
        roles: comment.user.email === process.env.SUPER_ADMIN_EMAIL ? ['ADMIN', 'VERIFIED'] : comment.user.roles,
      }
    }));
    // --- END SUPER ADMIN CHECK ---

    return NextResponse.json(commentsWithSuperAdmin);
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST a new comment or reply
export async function POST(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const userId = token.id;

    const { tmdbId, mediaType, text, parentId } = await request.json();

    if (!tmdbId || !mediaType || !text) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const commentData = {
      text,
      tmdbId: parseInt(tmdbId),
      mediaType,
      userId,
    };

    if (parentId) {
      commentData.parentId = parentId;
    }

    const newComment = await prisma.comment.create({
      data: commentData,
      include: {
        user: {
          select: { id: true, username: true, avatarUrl: true, name: true, roles: true, email: true }, // Include email
        },
      },
    });
    
    // --- SUPER ADMIN CHECK ---
    // Manually add `isSuperAdmin` flag to the new comment
    const newCommentWithSuperAdmin = {
      ...newComment,
      user: {
        ...newComment.user,
        isSuperAdmin: newComment.user.email === process.env.SUPER_ADMIN_EMAIL,
        // Force roles for Super Admin in comments
        roles: newComment.user.email === process.env.SUPER_ADMIN_EMAIL ? ['ADMIN', 'VERIFIED'] : newComment.user.roles,
      }
    };
    // --- END SUPER ADMIN CHECK ---

    return NextResponse.json(newCommentWithSuperAdmin, { status: 201 });
  } catch (error) {
    console.error('Failed to create comment:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}