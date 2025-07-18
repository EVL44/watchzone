'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaBars, FaSearch, FaTimes, FaAngleDown } from 'react-icons/fa';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTopRatedOpen, setIsTopRatedOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const profileRef = useRef(null);
  const topRatedRef = useRef(null);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      router.push(`/search?query=${searchQuery.trim()}`);
      setSearchQuery('');
      if (isMenuOpen) setIsMenuOpen(false);
    }
  };

  const getAvatarInitial = () => user?.username?.charAt(0).toUpperCase() || '';
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
      if (topRatedRef.current && !topRatedRef.current.contains(event.target)) setIsTopRatedOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchInputClassName = 'w-full bg-secondary text-foreground placeholder-foreground/70 border border-transparent rounded-4xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <>
      <nav className="bg-background shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-primary">Kentar</Link>
            <div className="hidden md:flex flex-grow max-w-xl mx-4 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-foreground/50"><FaSearch /></span>
              <input type="text" placeholder="Search for a movie, tv show..." className={searchInputClassName} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch}/>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2">
                <ThemeToggle />
                {loading ? <div className="h-8 w-48 bg-secondary animate-pulse rounded-md"></div> : user ? (
                  <>
                    <div className="relative" ref={topRatedRef}>
                      <button onClick={() => setIsTopRatedOpen(!isTopRatedOpen)} className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center">Top Rated <FaAngleDown className="ml-1" /></button>
                      {isTopRatedOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                          <Link href="/top-rated/movies" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary">Movies</Link>
                          <Link href="/top-rated/series" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary">Series</Link>
                        </div>
                      )}
                    </div>
                    <div className="relative" ref={profileRef}>
                      <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        {user.avatarUrl ? <Image src={user.avatarUrl} alt="User Avatar" width={32} height={32} className="w-full h-full rounded-full object-cover" /> : getAvatarInitial()}
                      </button>
                      {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                          <Link href="/profile" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary">Profile</Link>
                          <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-foreground hover:bg-secondary">Logout</button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                    <Link href="/signup" className="bg-primary text-white hover:bg-opacity-80 px-4 py-2 rounded-md text-sm font-medium">Sign Up</Link>
                  </>
                )}
              </div>
              <div className="md:hidden flex items-center"><ThemeToggle /><button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-primary p-2">{isMenuOpen ? <FaTimes size={24}/> : <FaBars size={24}/>}</button></div>
            </div>
          </div>
        </div>
      </nav>
      <div className={`fixed top-0 left-0 w-full h-screen bg-surface z-50 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
        <div className="flex justify-between items-center p-4 border-b border-secondary">
            <Link href="/" onClick={closeMenu} className="text-2xl font-bold text-primary">Kentar</Link>
            <button onClick={closeMenu} className="text-foreground p-2 rounded-md text-2xl"><FaTimes /></button>
        </div>
        <div className="p-4">
            <div className="relative w-full text-foreground/70 focus-within:text-primary mb-4">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><FaSearch /></span>
                <input type="text" placeholder="Search..." className={searchInputClassName} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch}/>
            </div>
            <div className="flex flex-col gap-2">
                {loading ? null : user ? (
                    <>
                        <Link href="/profile" onClick={closeMenu}><span className="text-foreground hover:bg-secondary block px-3 py-3 rounded-md text-lg font-medium">Profile</span></Link>
                        <Link href="/top-rated/movies" onClick={closeMenu}><span className="text-foreground hover:bg-secondary block px-3 py-3 rounded-md text-lg font-medium">Top Rated Movies</span></Link>
                        <Link href="/top-rated/series" onClick={closeMenu}><span className="text-foreground hover:bg-secondary block px-3 py-3 rounded-md text-lg font-medium">Top Rated Series</span></Link>
                        <button onClick={() => { closeMenu(); logout(); }} className="text-left text-foreground hover:bg-secondary block px-3 py-3 rounded-md text-lg font-medium">Logout</button>
                    </>
                ) : (
                    <>
                        <Link href="/top-rated/movies" onClick={closeMenu}><span className="text-foreground hover:bg-secondary block px-3 py-3 rounded-md text-lg font-medium">Top Rated Movies</span></Link>
                        <Link href="/top-rated/series" onClick={closeMenu}><span className="text-foreground hover:bg-secondary block px-3 py-3 rounded-md text-lg font-medium">Top Rated Series</span></Link>
                        <Link href="/login" onClick={closeMenu}><span className="text-foreground hover:bg-secondary block px-3 py-3 rounded-md text-lg font-medium">Login</span></Link>
                        <Link href="/signup" onClick={closeMenu}><span className="text-foreground hover:bg-secondary block px-3 py-3 rounded-md text-lg font-medium">Sign Up</span></Link>
                    </>
                )}
            </div>
        </div>
      </div>
    </>
  );
}