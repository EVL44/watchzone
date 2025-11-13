'use client';

import { AuthProvider } from '@/context/AuthContext'; // Your custom provider
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react'; // 1. Import next-auth provider

export function Providers({ children }) {
  // `attribute="class"` will toggle the .dark class on the <html> element.
  return (
    // 2. Wrap everything in SessionProvider
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}