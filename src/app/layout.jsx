import { JetBrains_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import "@/app/globals.css";
import { Providers } from '@/app/providers';
import Footer from "@/components/Footer";
import Script from "next/script";
import { metadata as siteMetadata } from '@/app/metadata'; // Import metadata

const jetBrains_mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-jetBrains-mono',
});

// Use the imported metadata
export const metadata = { ...siteMetadata };

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Viewport and theme-color are automatically handled by Next.js metadata */}
        <link rel="apple-touch-icon" href="/wzmax.png"></link>
        {/* manifest.json is also automatically added by Next.js if present in /public */}
      </head>
      <body className={jetBrains_mono.variable}>
        
        <Script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8121438559622738"
          crossOrigin="anonymous"
          strategy="afterInteractive" 
        />
        
        <Providers>
          <Nav />
          {/* Add padding-bottom on mobile (md:pb-0) to prevent bottom nav from covering content */}
          <main className="pb-20 md:pb-0">
            {children}
          </main>
          <Footer />
        </Providers>
        
        <Script 
          src="https://upload-widget.cloudinary.com/global/all.js" 
          type="text/javascript" 
          strategy="beforeInteractive" 
        />
      </body>
    </html>
  );
}