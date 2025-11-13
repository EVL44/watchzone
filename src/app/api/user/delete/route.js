import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt'; // 1. Import next-auth's getToken
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function DELETE(request) {
  // 2. Get the user's session token
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const userId = token.id; // 3. Get the ID from the token

    // Delete the user from the database
    await prisma.user.delete({
      where: { id: userId },
    });

    // 4. Just return a success message.
    // The client will handle the sign-out.
    return NextResponse.json({ message: 'Account successfully deleted.' });

  } catch (error) {
    console.error('Account Deletion Error:', error);
    if (error.code === 'P2025') { 
        return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'An internal server error occurred during deletion.' }, { status: 500 });
  }
}