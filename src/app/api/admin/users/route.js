import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    // 1. Check if user is authenticated AND is an admin
    if (!token || !token.roles?.includes('ADMIN')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // 2. Build search query
    const whereClause = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    // 3. Fetch users, excluding password
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        roles: true,
        createdAt: true, // Optional: for sorting
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit results
    });

    return NextResponse.json(users);

  } catch (error) {
    console.error('Admin Fetch Users Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}