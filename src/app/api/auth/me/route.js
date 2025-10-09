import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = await verifyToken(token); // Use the utility function
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        favoriteMovies: true,
        watchlistMovies: true,
        favoriteSeries: true,
        watchlistSeries: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    // Catch errors from verifyToken (e.g., token expired, invalid signature)
    return NextResponse.json({ message: 'Invalid token or session expired' }, { status: 401 });
  }
}