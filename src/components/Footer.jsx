'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="bg-secondary text-foreground/70 border-t border-secondary/50 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          
          {/* Column 1: Greeting & Brand */}
          <div>
            <h2 className="text-xl font-bold text-primary mb-2">WatchZone</h2>
            {user ? (
              <p>Hi, <span className="font-bold text-foreground">{user.username}</span>! Thanks for visiting.</p>
            ) : (
              <p>Your ultimate destination for discovering and tracking movies and TV shows.</p>
            )}
          </div>

          {/* Column 2: Navigation & Socials */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/top-rated/movies" className="hover:text-primary transition-colors">Top Movies</Link></li>
              <li><Link href="/top-rated/series" className="hover:text-primary transition-colors">Top Series</Link></li>
            </ul>
            <div className="flex justify-center md:justify-start space-x-4 mt-4">
                <a href="https://github.com/EVL44/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><FaGithub size={20} /></a>
                <a href="https://www.linkedin.com/in/abdelouahed-id" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><FaLinkedin size={20} /></a>
                <a href="https://www.instagram.com/abdoidboubrik" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><FaInstagram size={20} /></a>
                <a href="https://x.com/evl_44" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><FaTwitter size={20} /></a>
            </div>
          </div>

          {/* Column 3: TMDb Attribution */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-foreground mb-3">Data Provided By</h3>
            <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e342510f8202baf6bffa71d7f5c4.svg" 
                alt="The Movie Database (TMDb)" 
                className="h-10"
              />
            </a>
            <p className="text-xs mt-2 text-center md:text-left">
              This product uses the TMDb API but is not endorsed or certified by TMDb.
            </p>
          </div>

        </div>
        <div className="border-t border-secondary/50 mt-8 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Kentar. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}