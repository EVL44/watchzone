'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaBars, FaSearch, FaTimes } from 'react-icons/fa';

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-background shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <span className="text-xl font-bold text-primary cursor-pointer">
                  Kentar
                </span>
              </Link>
            </div>

            {/* Center: Desktop Search Bar */}
            <div className="hidden md:flex flex-grow max-w-xl mx-4">
              <div className="relative w-full text-gray-900 focus-within:text-primary">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  placeholder="Search for a movie, tv show, person..."
                  className="w-full bg-stone-100 text-primary placeholder-gray-500 border border-transparent rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Right side: Auth Links & Mobile Menu Button */}
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2">
                 <Link href="/top-rated">
                  <span className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer">
                    Top Rated
                  </span>
                </Link>
                <Link href="/watchlist">
                  <span className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer">
                    Watchlist
                  </span>
                </Link>
                <Link href="/login">
                  <span className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer">
                    Login
                  </span>
                </Link>
              </div>
              <Link href="/signup">
                <span className="bg-primary text-white hover:bg-opacity-80 px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
                  Sign Up
                </span>
              </Link>
              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-primary p-2 rounded-md text-2xl">
                  <FaBars />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Mobile Menu Overlay --- */}
      <div className={`fixed top-0 left-0 w-full h-screen bg-background z-50 transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out md:hidden`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <Link href="/" onClick={() => setIsMenuOpen(false)}>
            <span className="text-2xl font-bold text-primary">
              Kentar
            </span>
          </Link>
          <button onClick={() => setIsMenuOpen(false)} className="text-foreground p-2 rounded-md text-2xl">
            <FaTimes />
          </button>
        </div>

        <div className="p-4">
          {/* Mobile Search Bar - FIXED */}
          <div className="relative w-full text-gray-400 focus-within:text-primary mb-4">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-stone-800 text-white placeholder-gray-500 border border-transparent rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Mobile Menu Links */}
          <div className="flex flex-col gap-2">
             <Link href="/top-rated" onClick={() => setIsMenuOpen(false)}>
              <span className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-3 rounded-md text-lg font-medium">
                Top Rated
              </span>
            </Link>
            <Link href="/watchlist" onClick={() => setIsMenuOpen(false)}>
              <span className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-3 rounded-md text-lg font-medium">
                Watchlist
              </span>
            </Link>
            <Link href="/login" onClick={() => setIsMenuOpen(false)}>
              <span className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-3 rounded-md text-lg font-medium">
                Login
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}