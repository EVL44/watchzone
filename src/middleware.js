// src/middleware.js

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const completeProfileUrl = new URL('/profile/complete', req.url);
  const profileUrl = new URL('/profile', req.url);
  const homeUrl = new URL('/', req.url);
  
  const authPages = ['/login', '/signup'];

  // If the user IS logged in
  if (token) {
    // 1. Check if they need to complete their profile
    if (token.needsUsername) {
      if (pathname !== completeProfileUrl.pathname) {
        return NextResponse.redirect(completeProfileUrl);
      }
    }
    
    // 2. If they have a username and are trying to access /profile/complete
    else if (pathname === completeProfileUrl.pathname) {
      return NextResponse.redirect(homeUrl);
    }
    
    // 3. If they are logged-in and try to access /login or /signup
    else if (authPages.includes(pathname)) {
      return NextResponse.redirect(homeUrl);
    }

    // 4. If they are a GOOGLE USER (no password) and try to access
    // the change-password page, redirect them to settings.
    else if (pathname === '/profile/change-password' && !token.hasPassword) {
      return NextResponse.redirect(profileUrl);
    }

    // 5. --- NEW ADMIN ROUTE PROTECTION ---
    // If they try to access the admin panel but do not have the ADMIN role
    if (pathname.startsWith('/admin') && !token.roles?.includes('ADMIN')) {
      return NextResponse.redirect(homeUrl);
    }
    // --- END OF NEW PROTECTION ---

  }

  // If the user is NOT logged in
  if (!token) {
    // 6. If they try to access any protected profile page
    if (pathname.startsWith('/profile') || pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Allow all other requests
  return NextResponse.next();
}

// Updated matcher to include all profile sub-pages
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};