'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaBars, FaSearch, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user, logout, loading } = useAuth(); // Destructure loading state

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      router.push(`/search?query=${searchQuery.trim()}`);
      setSearchQuery('');
      if (isMenuOpen) setIsMenuOpen(false); // Close mobile menu on search
    }
  };

  const getAvatarInitial = () => {
    if (user && user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return '';
  };

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  // --- FIX IS HERE ---
  // Define a single style for both search inputs to ensure consistency
  const searchInputClassName = "w-full bg-stone-100 text-primary placeholder-gray-500 border border-transparent rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all";

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

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-grow max-w-xl mx-4">
              <div className="relative w-full text-gray-900 focus-within:text-primary">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  placeholder="Search for a movie, tv show, person..."
                  className={searchInputClassName} // Use the consistent class name
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </div>
            </div>

            {/* Right side: Desktop Auth Links & Mobile Menu Button */}
            <div className="flex items-center gap-4">
              {loading ? (
                <div className="h-10 w-48 bg-stone-800 animate-pulse rounded-md"></div>
              ) : user ? (
                <div className="hidden md:flex items-center gap-4">
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
                  <Link href="/profile">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold cursor-pointer">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        getAvatarInitial()
                      )}
                    </div>
                  </Link>
                  <button onClick={logout} className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                   <Link href="/top-rated">
                    <span className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer">
                      Top Rated
                    </span>
                  </Link>
                  <Link href="/login">
                    <span className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer">
                      Login
                    </span>
                  </Link>
                  <Link href="/signup">
                    <span className="bg-primary text-white hover:bg-opacity-80 px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
                      Sign Up
                    </span>
                  </Link>
                </div>
              )}
              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-primary p-2 rounded-md text-2xl">
                  {isMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Mobile Menu Overlay --- */}
      <div className={`fixed top-0 left-0 w-full h-screen bg-background z-50 transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out md:hidden`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <Link href="/" onClick={closeMenu}>
            <span className="text-2xl font-bold text-primary">
              Kentar
            </span>
          </Link>
          <button onClick={closeMenu} className="text-foreground p-2 rounded-md text-2xl">
            <FaTimes />
          </button>
        </div>

        <div className="p-4">
          <div className="relative w-full text-gray-400 focus-within:text-primary mb-4">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search..."
              className={searchInputClassName} // Use the consistent class name
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>

          <div className="flex flex-col gap-2">
            {loading ? null : user ? (
              <>
                 <Link href="/profile" onClick={closeMenu}>
                  <span className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-3 rounded-md text-lg font-medium">
                    Profile
                  </span>
                </Link>
                <Link href="/top-rated" onClick={closeMenu}>
                  <span className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-3 rounded-md text-lg font-medium">
                    Top Rated
                  </span>
                </Link>
                <Link href="/watchlist" onClick={closeMenu}>
                  <span className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-3 rounded-md text-lg font-medium">
                    Watchlist
                  </span>
                </Link>
                <button onClick={handleLogout} className="text-left text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-3 rounded-md text-lg font-medium">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/top-rated" onClick={closeMenu}>
                  <span className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-3 rounded-md text-lg font-medium">
                    Top Rated
                  </span>
                </Link>
                <Link href="/login" onClick={closeMenu}>
                  <span className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-3 rounded-md text-lg font-medium">
                    Login
                  </span>
                </Link>
                <Link href="/signup" onClick={closeMenu}>
                  <span className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-3 rounded-md text-lg font-medium">
                    Sign Up
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}