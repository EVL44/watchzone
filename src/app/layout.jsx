import { JetBrains_Mono } from "next/font/google";
import Nav from "../components/Nav";
import "./globals.css";
import { Providers } from './providers';
import Footer from "../components/Footer";
import Script from "next/script";

const jetBrains_mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-jetBrains-mono',
});

export const metadata = {
  title: "Watchzone - Your Movie Platform",
  description: "Watch your favorite movies and series.",
  icons: {
    icon: "\wzonenbg.png",
  }
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={jetBrains_mono.variable}>
        
        {/* --- THIS IS THE FIX --- */}
        {/* This strategy tells Next.js to load this script *after* the page */}
        {/* is fully interactive, preventing the hydration error. */}
        <Script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8121438559622738"
          crossOrigin="anonymous"
          strategy="afterInteractive" 
        />
        {/* --- END OF FIX --- */}
        
        <Providers>
          <Nav />
          <main>
            {children}
          </main>
          <Footer />
        </Providers>
        
        {/* The Cloudinary script needs to load early */}
        <Script 
          src="https://upload-widget.cloudinary.com/global/all.js" 
          type="text/javascript" 
          strategy="beforeInteractive" 
        />
      </body>
    </html>
  );
}