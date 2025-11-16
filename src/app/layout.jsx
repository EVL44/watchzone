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
  title: "watchzone - Your Movie Platform",
  description: "Watch your favorite movies and series.",
  icons: {
    icon: "\wzmax.png",
  }
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#0c0a09" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <link rel="apple-touch-icon" href="/wzmax.png"></link>
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
          <main>
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