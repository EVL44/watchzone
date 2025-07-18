import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: email }, { username: username }] },
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      return NextResponse.json({ message: `${field} is already taken` }, { status: 409 });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });

  } catch (error) {
    console.error('Signup Error:', error); // Log the actual error on the server
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}