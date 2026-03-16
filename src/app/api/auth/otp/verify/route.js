import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { email, username, password, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });
    }

    // 1. Find the latest OTP token for this email
    const otpRecord = await prisma.otpToken.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return NextResponse.json({ message: 'No verification code found. Please request a new one.' }, { status: 404 });
    }

    // 2. Validate the OTP string
    if (otpRecord.otp !== otp) {
      return NextResponse.json({ message: 'Invalid verification code.' }, { status: 401 });
    }

    // 3. Check expiration
    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json({ message: 'Code has expired. Please request a new one.' }, { status: 401 });
    }

    // 4. Success! OTP is valid. We can now create/update the User record safely.
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
        where: { email }
    });

    if (existingUser) {
        if (existingUser.isDeactivated) {
             const hashedPassword = await bcrypt.hash(password, 10);
             await prisma.user.update({
               where: { id: existingUser.id },
               data: {
                 isDeactivated: false,
                 username: username,
                 password: hashedPassword,
                 name: username,
                 emailVerified: new Date()
               }
             });
        }
    } else {
        // Create full new user
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
          data: {
            username,
            email,
            password: hashedPassword,
            emailVerified: new Date(),
          },
        });
    }

    // 5. Clean up used OTPs
    await prisma.otpToken.deleteMany({
      where: { email }
    });
    // Clean up rate limits so they have a fresh start after verify
    await prisma.otpRateLimit.deleteMany({
      where: { email }
    });

    return NextResponse.json({ message: 'Email verified and account activated successfully.' }, { status: 200 });

  } catch (error) {
    console.error('OTP Verify Error:', error);
    return NextResponse.json({ message: 'Internal server error during verification' }, { status: 500 });
  }
}
