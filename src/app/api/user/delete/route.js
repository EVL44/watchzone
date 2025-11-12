import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function DELETE(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const decoded = await verifyToken(token);
    const userId = decoded.id;

    // Delete the user from the database
    await prisma.user.delete({
      where: { id: userId },
    });

    // Create a response and clear the cookie
    const response = NextResponse.json({ message: 'Account successfully deleted. Redirecting to login.' });
    
    // Clear the token cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Account Deletion Error:', error);
    // Specifically handle the case where the user is not found (already deleted, maybe?)
    if (error.code === 'P2025') { 
        // We still clear the cookie just in case, but return a 404/400.
        const response = NextResponse.json({ message: 'User not found, but session cleared.' }, { status: 404 });
        response.cookies.set('token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', expires: new Date(0), path: '/' });
        return response;
    }
    return NextResponse.json({ message: 'An internal server error occurred during deletion.' }, { status: 500 });
  }
}