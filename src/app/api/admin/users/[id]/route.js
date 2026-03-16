import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    // Check if user is authenticated AND is an admin
    if (!token || !token.roles?.includes('ADMIN')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        roles: true,
        isDeactivated: true,
        createdAt: true,
        avatarUrl: true,
        banExpires: true,
        banReason: true,
        favoriteMovieIds: true,
        favoriteSeriesIds: true
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error('--- ADMIN GET USER CRITICAL ERROR ---');
    console.error(error.stack || error);
    console.error('-------------------------------------');
    return NextResponse.json({ message: 'Internal server error during fetch', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    // Check if user is authenticated AND is an admin
    if (!token || !token.roles?.includes('ADMIN')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Soft delete the user by anonymizing and deactivating the profile
    await prisma.user.update({
      where: { id: userId },
      data: {
        isDeactivated: true,
        name: 'watchzone user',
        username: `${userId}_deactivated`,
        avatarUrl: null,
        image: null,
      }
    });

    return NextResponse.json({ message: 'User account successfully deactivated.' });

  } catch (error) {
    console.error('Admin Delete User Error:', error);
    if (error.code === 'P2025') {
       return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal server error during deletion' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    // Check if user is authenticated AND is an admin
    if (!token || !token.roles?.includes('ADMIN')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { action } = body;

    // 1. REACTIVATE (Soft Delete Recovery)
    if (action === 'reactivate') {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return NextResponse.json({ message: 'User not found.' }, { status: 404 });
      if (!user.isDeactivated) return NextResponse.json({ message: 'User is not deactivated.' }, { status: 400 });
      
      let newUsername = user.username.replace('_deactivated', '');
      await prisma.user.update({
        where: { id: userId },
        data: { isDeactivated: false, name: newUsername, username: newUsername }
      });
      return NextResponse.json({ message: 'User account successfully reactivated.' });
    }

    // 2. BAN (Suspend Access)
    if (action === 'ban') {
       const { duration, reason } = body;
       // Duration logic: 24h, 7d, 30d, permanent
       let expiresAt = new Date();
       if (duration === '24h') expiresAt.setDate(expiresAt.getDate() + 1);
       else if (duration === '7d') expiresAt.setDate(expiresAt.getDate() + 7);
       else if (duration === '30d') expiresAt.setDate(expiresAt.getDate() + 30);
       else if (duration === 'permanent') expiresAt.setFullYear(expiresAt.getFullYear() + 100); // 100 years -> Permanent
       else return NextResponse.json({ message: 'Invalid ban duration' }, { status: 400 });

       if (!reason) return NextResponse.json({ message: 'Ban reason is required' }, { status: 400 });

       await prisma.user.update({
         where: { id: userId },
         data: {
           banExpires: expiresAt,
           banReason: reason
         }
       });
       return NextResponse.json({ message: 'User successfully banned.' });
    }

    // 3. UNBAN (Pardon)
    if (action === 'unban') {
       await prisma.user.update({
         where: { id: userId },
         data: {
           banExpires: null,
           banReason: null
         }
       });
       return NextResponse.json({ message: 'User successfully unbanned.' });
    }

    // 4. UPDATE INFO (Entity Overrides)
    if (action === 'updateInfo') {
       const { username, email, roles } = body;
       
       // Protect Super Admin
       const targetUser = await prisma.user.findUnique({ where: { id: userId }});
       if (targetUser.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL && token.email !== targetUser.email) {
          return NextResponse.json({ message: 'Cannot modify Super Admin origin.' }, { status: 403 });
       }

       await prisma.user.update({
         where: { id: userId },
         data: { username, email, roles }
       });
       return NextResponse.json({ message: 'Entity parameters updated.' });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin PATCH User Error:', error);
    return NextResponse.json({ message: 'Internal server error during update' }, { status: 500 });
  }
}
