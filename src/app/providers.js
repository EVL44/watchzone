'use client';

import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }) {
  // `attribute="class"` will toggle the .dark class on the <html> element.
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}