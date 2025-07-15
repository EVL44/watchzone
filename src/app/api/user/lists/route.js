import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

const jwtSecret = process.env.JWT_SECRET || 'your-default-secret';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('token');

  if (!token) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token.value, jwtSecret);
    const userWithLists = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        favorites: true,
        watchlist: true,
        // You can include custom movieLists here as well if you implement them
      },
    });

    if (!userWithLists) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { password, ...lists } = userWithLists;
    return NextResponse.json(lists);
  } catch (error) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}