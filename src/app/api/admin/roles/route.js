import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { Role } from '@prisma/client'; // Import the Role enum

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.roles?.includes('ADMIN')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { userId, roles } = await request.json();

    if (!userId || !Array.isArray(roles)) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    // --- SUPER ADMIN CHECK ---
    // Fetch the user to check their email
    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (userToUpdate?.email === process.env.SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ message: "The Super Admin's roles cannot be modified." }, { status: 403 });
    }
    // --- END SUPER ADMIN CHECK ---

    const validRoles = roles.filter(role => Object.values(Role).includes(role));

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          set: validRoles,
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        roles: true,
      },
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Admin Update Roles Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}