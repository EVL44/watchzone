import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

const jwtSecret = process.env.JWT_SECRET || 'your-default-secret';

export async function POST(request) {
  const cookieStore = cookies();
  const token = cookieStore.get('token');

  if (!token) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { userId } = jwt.verify(token.value, jwtSecret);
    const { username, email, password, avatarUrl } = await request.json();

    const updateData = {
      username,
      email,
      avatarUrl,
    };

    // Only hash and update the password if a new one is provided
    if (password) {
      updateData.password = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { // Select only the fields safe to return to the client
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    if (error.code === 'P2002') { // Handle unique constraint violation
        return NextResponse.json({ message: 'Username or email already in use.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'An error occurred during update.' }, { status: 500 });
  }
}