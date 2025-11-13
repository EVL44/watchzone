// src/components/HeroSearch.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaSearch, FaUserCircle, FaFilm, FaTv } from 'react-icons/fa';

export default function HeroSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const router = useRouter();
  const searchRef = useRef(null);

  // Effect for fetching search recommendations (autocomplete)
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

    // Debounce to avoid spamming the API
    const debounce = setTimeout(() => {
      fetchRecommendations();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Effect to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setRecommendations([]);
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
  };

  return (
    <div className="relative w-full max-w-xl mx-auto" ref={searchRef}>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-6 text-gray-500">
          <FaSearch size={20} />
        </span>
        <input
          type="text"
          placeholder="Search for movies, series, users..."
          className="w-full text-lg py-4 pl-16 pr-6 bg-white text-gray-900 placeholder-gray-500 border-none rounded-2xl shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          spellCheck="true"
          autoCorrect="on"
        />
      </div>

      {/* Autocomplete Dropdown */}
      {recommendations.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl z-10 overflow-hidden text-left">
          <ul className="py-2">
            {recommendations.map(item => (
              <li
                key={item.id}
                className="flex items-center gap-4 px-4 py-3 hover:bg-secondary cursor-pointer text-gray-900"
                onClick={() => handleRecommendationClick(item)}
              >
                {/* Image/Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-md bg-secondary flex items-center justify-center overflow-hidden">
                  {item.media_type === 'user' ? (
                    item.avatarUrl ? (
                      <Image src={item.avatarUrl} alt={item.name} width={40} height={40} className="w-full h-full object-cover" unoptimized={true} />
                    ) : (
                      <FaUserCircle className="w-6 h-6 text-gray-400" />
                    )
                  ) : (
                    item.poster_path ? (
                      <Image src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt={item.name} width={40} height={60} className="w-full h-full object-cover" unoptimized={true} />
                    ) : (
                      item.media_type === 'movie' ? <FaFilm className="w-6 h-6 text-gray-400" /> : <FaTv className="w-6 h-6 text-gray-400" />
                    )
                  )}
                </div>
                {/* Title */}
                <span className="font-medium">{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}