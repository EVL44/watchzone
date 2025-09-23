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
  title: "Kentar - Your Movie Platform",
  description: "Rate and review your favorite movies and series.",
  icons: {
    icon: "\icon.png",
  }
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* AdSense script for connecting the website to your account */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8121438559622738"
          crossOrigin="anonymous"></script>
      </head>
      <body className={jetBrains_mono.variable}>
        <Providers>
          <Nav />
          <main>
            {children}
          </main>
          <Footer />
        </Providers>
        {/* The Cloudinary script is essential for the upload widget to function */}
        <Script src="https://upload-widget.cloudinary.com/global/all.js" type="text/javascript" strategy="beforeInteractive" />
      </body>
    </html>
  );
}