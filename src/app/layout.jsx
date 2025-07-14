import { JetBrains_Mono } from "next/font/google";
import Nav from "../components/Nav"; 
import "./globals.css";


const jetBrains_mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: '400',
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
    <html lang="en">
      <body className={`${jetBrains_mono.variable}`} >
        <Nav /> 
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
