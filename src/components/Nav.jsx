'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// 1. Import new icons
import { FaBars, FaSearch, FaTimes, FaAngleDown, FaUserCircle, FaFilm, FaTv, FaHome, FaStar } from 'react-icons/fa';
import { User, Settings, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTopRatedOpen, setIsTopRatedOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const profileRef = useRef(null);
  const topRatedRef = useRef(null);

  // Effect for fetching search recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (searchQuery.length > 2) {
        const response = await fetch(`/api/search?query=${searchQuery}&recommendations=true`);
        if (response.ok) {
            const data = await response.json();
            setRecommendations(data || []);
        }
      } else {
        setRecommendations([]);
      }
    };

    const debounce = setTimeout(() => {
      fetchRecommendations();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Effect for closing menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (topRatedRef.current && !topRatedRef.current.contains(event.target)) {
        setIsTopRatedOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      router.push(`/search?query=${searchQuery.trim()}`);
      setSearchQuery('');
      setRecommendations([]);
      if (isMenuOpen) setIsMenuOpen(false);
    }
  };

  const handleRecommendationClick = (item) => {
    if (item.media_type === 'user') {
      router.push(`/user/${item.name}`);
    } else if (item.media_type === 'movie') {
      router.push(`/movie/${item.id}`);
    } else if (item.media_type === 'tv') {
      router.push(`/serie/${item.id}`);
    }
    setSearchQuery('');
    setRecommendations([]);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const getAvatarInitial = () => user?.username?.charAt(0).toUpperCase() || '';
  const closeMenu = () => setIsMenuOpen(false);

  const searchInputClassName = 'w-full bg-secondary text-foreground placeholder-foreground/70 border border-transparent rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary';

  const profileLink = user ? (user.username ? `/user/${user.username}` : '/profile') : '/login';

  return (
    <>
      {/* 2. Top Nav (sticky, standard background) */}
      <nav className="bg-background shadow-md sticky top-0 z-20">
        <div className="max-w-7xl xl:mx-40 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-primary flex items-center">
              <Image
                src="/wz0.png" // Corrected path
                alt="wzone"
                width={60} // Added width
                height={20} // Added height
                className="h-auto transition-transform duration-500 group-hover:scale-110"
                priority={true} // Optional: Prioritize loading the logo
                unoptimized={true}
              />
            </Link>
            
            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-grow max-w-xl mx-4 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-foreground/50"><FaSearch /></span>
              <input type="text" placeholder="Search for movies, series, users..." className={searchInputClassName} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch}/>
              {recommendations.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-surface rounded-md shadow-lg z-10 py-1">
                  {recommendations.map(item => (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-2 hover:bg-secondary cursor-pointer text-sm" onClick={() => handleRecommendationClick(item)}>
                       {item.media_type === 'user' ? (
                        item.avatarUrl ? (
                          <Image src={item.avatarUrl} alt={item.name} width={24} height={24} className="rounded-full" unoptimized={true} />
                        ) : (
                          <FaUserCircle className="w-6 h-6 text-foreground/50" />
                        )
                       ) : (
                        item.poster_path ? (
                          <Image src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt={item.name} width={24} height={36} className="rounded-sm" unoptimized={true} />
                        ) : (
                          item.media_type === 'movie' ? <FaFilm className="w-6 h-6 text-foreground/50" /> : <FaTv className="w-6 h-6 text-foreground/50" />
                        )
                       )}
                       <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Desktop Nav Items */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4">
                <ThemeToggle />
                {loading ? <div className="h-9 w-48 bg-secondary animate-pulse rounded-md"></div> : user ? (
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
                    
                    {/* --- IMPROVED PROFILE DROPDOWN --- */}
                    <div className="relative" ref={profileRef}>
                      <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary">
                        {user.avatarUrl ? <Image src={user.avatarUrl} alt="User Avatar" width={36} height={36} className="w-full h-full rounded-full object-cover" unoptimized={true} /> : getAvatarInitial()}
                      </button>
                      {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-surface rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                          <div className="px-4 py-2 border-b border-secondary mb-1">
                            <p className="text-sm text-foreground/70">Signed in as</p>
                            <p className="font-semibold text-foreground truncate">{user.username}</p>
                          </div>
                          {user.username && (
                            <Link href={`/user/${user.username}`} onClick={() => setIsProfileOpen(false)} className="flex items-center w-full text-left gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary">
                              <User className="h-4 w-4" />
                              <span>View Profile</span>
                            </Link>
                          )}
                          <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center w-full text-left gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary">
                            <Settings className="h-4 w-4" />
                            <span>Edit Profile</span>
                          </Link>
                          <button onClick={() => { logout(); setIsProfileOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-secondary">
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                          </button>
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
              {/* 3. Mobile top-right: Only ThemeToggle. Hamburger is moved. */}
              <div className="md:hidden flex items-center">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 4. NEW: Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-surface border-t border-secondary z-20 flex justify-around items-center px-2">
        <Link href="/" className="flex flex-col items-center justify-center text-foreground/70 hover:text-primary">
          <FaHome size={24} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/search" className="flex flex-col items-center justify-center text-foreground/70 hover:text-primary">
          <FaSearch size={24} />
          <span className="text-xs mt-1">Search</span>
        </Link>
        <Link href="/top-rated/movies" className="flex flex-col items-center justify-center text-foreground/70 hover:text-primary">
          <FaStar size={24} />
          <span className="text-xs mt-1">Top Rated</span>
        </Link>
        <Link href={profileLink} className="flex flex-col items-center justify-center text-foreground/70 hover:text-primary">
          <FaUserCircle size={24} />
          <span className="text-xs mt-1">{user ? "Profile" : "Sign In"}</span>
        </Link>
        <button onClick={() => setIsMenuOpen(true)} className="flex flex-col items-center justify-center text-foreground/70 hover:text-primary">
          <FaBars size={24} />
          <span className="text-xs mt-1">Menu</span>
        </button>
      </nav>

      {/* 5. Existing Mobile Menu (now opened by bottom nav) */}
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
                {user.username && <Link href={`/user/${user.username}`} onClick={closeMenu}><span className="text-foreground hover:bg-secondary block px-3 py-3 rounded-md text-lg font-medium">View Profile</span></Link>}
                <Link href="/profile" onClick={closeMenu}><span className="text-foreground hover:bg-secondary block px-3 py-3 rounded-md text-lg font-medium">Edit Profile</span></Link>
                <Link href="/top-rated/movies" onClick={closeMenu}><span className="text-foreground hover:bg-secondary block px-3 py-3 rounded-md text-lg font-medium">Top Rated Movies</span></Link>
                <Link href="/top-rated/series" onClick={closeMenu}><span className="text-foreground hover:bg-secondary block px-3 py-3 rounded-md text-lg font-medium">Top Rated Series</span></Link>
                <button onClick={() => { closeMenu(); logout(); }} className="text-left text-foreground hover:bg-secondary block px-3 py-3 rounded-md text-lg font-medium">Logout</button>
              </>
            ) : (
              <>
                <Link href="/top-rated/movies" onClick={closeMenu}><span className="text-foreground hover:bg-secondary block px-3 py-3 rounded-md text-lg font-medium">Top Rated Movies</span></Link>
                <Link href="/top-rated/series" onClick={closeMenu}><span className="text-foreground hover:bg-secondary block px-3 py-3 rounded-md text-lg font-medium">Top Rated Series</span></Link>
                <Link href="/login" onClick={closeMenu}><span className="text-foreground hover:bg-secondary block px-3 py-3 rounded-md text-lg font-medium">Login</span></Link>
                <Link href="/signup" className="text-foreground hover:bg-secondary block px-3 py-3 rounded-md text-lg font-medium">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}