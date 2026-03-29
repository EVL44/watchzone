import { cookies } from 'next/headers';
import { decode } from 'next-auth/jwt';

export async function getAuthSession() {
  const cookieStore = await cookies();
  const secureCookie = process.env.NODE_ENV === "production" || process.env.NEXTAUTH_URL?.startsWith("https://");
  
  let tokenStr = cookieStore.get(secureCookie ? "__Secure-next-auth.session-token" : "next-auth.session-token")?.value;
  if (!tokenStr) {
    // Fallback in case of environment mismatch
    tokenStr = cookieStore.get(secureCookie ? "next-auth.session-token" : "__Secure-next-auth.session-token")?.value;
  }
  
  if (!tokenStr) return null;
  
  try {
    const decoded = await decode({ token: tokenStr, secret: process.env.NEXTAUTH_SECRET });
    if (!decoded) return null;
    return { user: decoded };
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}
