import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, createToken } from '@/lib/auth';

export async function POST(request) {
  try {
    // The login identifier can be either a username or an email
    const { login, password } = await request.json();

    if (!login || !password) {
      return NextResponse.json({ message: 'Username/email and password are required' }, { status: 400 });
    }

    // Find the user by either their unique username or unique email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: login },
          { email: login },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = createToken(user);
    const response = NextResponse.json({
      message: 'Login successful',
      user: { id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl },
    }, { status: 200 });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60, // 1 day
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An error occurred during login' }, { status: 500 });
  }
}