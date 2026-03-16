'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import cloudinaryLoader from '@/lib/cloudinaryLoader';
import { useAuth } from '@/context/AuthContext';
import UserListModal from '@/components/UserListModal';
import MediaGrid from '@/components/MediaGrid';
import PlaylistCard from '@/components/PlaylistCard';
import { FaUserCircle, FaStar, FaStarHalfAlt, FaFilm, FaTv, FaEye } from 'react-icons/fa';
import Badges from '@/components/Badges';
import Link from 'next/link';
import EditProfileModal from '@/components/EditProfileModal';

export default function UserProfileClient({ profile }) {
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const [isFollowing, setIsFollowing] = useState(profile.isFollowing);
  const [followers, setFollowers] = useState(profile.followers);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUsers, setModalUsers] = useState([]);
  
  const [activeTab, setActiveTab] = useState('watched');
  const [showEditProfile, setShowEditProfile] = useState(false);

  const handleFollowToggle = async () => {
    if (!currentUser) return router.push('/login');
    
    setIsUpdatingFollow(true);
    const action = isFollowing ? 'unfollow' : 'follow';

    const originalFollowState = isFollowing;
    const originalFollowers = followers;

    setIsFollowing(!isFollowing);
    if (action === 'follow') {
      setFollowers([...followers, currentUser]);
    } else {
      setFollowers(followers.filter(user => user.id !== currentUser.id));
    }

    try {
      const res = await fetch('/api/user/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: profile.id, action }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Follow request failed');
      }
      
    } catch (err) {
      console.error(err.message);
      setIsFollowing(originalFollowState);
      setFollowers(originalFollowers);
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  const openModal = (title, users) => {
    setModalTitle(title);
    setModalUsers(users);
    setModalOpen(true);
  };

  const combinedFavorites = [...(profile.favoriteMovies || []), ...(profile.favoriteSeries || [])];
  const combinedWatchlist = [...(profile.watchlistMovies || []), ...(profile.watchlistSeries || [])];
  const combinedWatched = [...(profile.watchedMovies || []), ...(profile.watchedSeries || [])];
  
  const stats = profile.stats || {};
  const ratings = profile.ratings || [];

  // Render star display for a rating score
  const renderStarsDisplay = (score) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (score >= i) {
        stars.push(<FaStar key={i} className="text-yellow-400 text-xs" />);
      } else if (score >= i - 0.5) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400 text-xs" />);
      }
    }
    return stars;
  };

  const tabs = [
    { key: 'watched', label: 'Watched', icon: <FaEye className="text-sm" /> },
    { key: 'ratings', label: 'Ratings', icon: <FaStar className="text-sm" /> },
    { key: 'favorites', label: 'Favorites' },
    { key: 'watchlist', label: 'Watchlist' },
    { key: 'playlists', label: 'Playlists' },
  ];

  return (
    <>
      {modalOpen && <UserListModal isOpen={modalOpen} title={modalTitle} users={modalUsers} onClose={() => setModalOpen(false)} />}
      {showEditProfile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditProfile(false)}
          onSave={() => { setShowEditProfile(false); router.refresh(); }}
        />
      )}

      {/* Banner Section */}
      <div className="relative w-full h-48 md:h-64 bg-gradient-to-r from-stone-900 via-stone-800 to-primary/30 overflow-hidden">
        {profile.bannerUrl && (
          <Image 
            src={profile.bannerUrl} 
            alt="Profile Banner" 
            layout="fill" 
            objectFit="cover" 
            className="opacity-60"
            loader={cloudinaryLoader}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* Profile Header - Overlapping the banner */}
      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
          {/* Avatar */}
          <div className="w-28 h-28 md:w-36 md:h-36 flex-shrink-0">
            <div className="w-full h-full rounded-full border-4 border-background bg-primary flex items-center justify-center text-4xl md:text-5xl font-bold text-white overflow-hidden relative shadow-xl">
              {profile.avatarUrl ? (
                <Image src={profile.avatarUrl} alt="Avatar" layout="fill" objectFit="cover" loader={cloudinaryLoader} />
              ) : (
                <FaUserCircle className="text-6xl" />
              )}
            </div>
          </div>

          {/* Username + Actions */}
          <div className="flex-grow text-center md:text-left pb-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{profile.username}</h1>
              <Badges user={profile} />
            </div>
            {profile.bio && (
              <p className="text-foreground/60 text-sm mt-1 max-w-lg">{profile.bio}</p>
            )}
          </div>

          {/* Follow/Edit Button */}
          {currentUser && !profile.isCurrentUser && (
            <button 
              onClick={handleFollowToggle} 
              disabled={isUpdatingFollow} 
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-all disabled:opacity-50 mb-2 ${
                isFollowing 
                  ? 'bg-secondary text-foreground hover:bg-red-500/20 hover:text-red-400' 
                  : 'bg-primary text-white hover:bg-opacity-80'
              }`}
            >
              {isUpdatingFollow ? '...' : isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
          {profile.isCurrentUser && (
            <button 
              onClick={() => setShowEditProfile(true)}
              className="px-5 py-2 rounded-md font-semibold text-xs tracking-wider uppercase border border-foreground/30 text-foreground/80 hover:text-foreground hover:border-foreground/60 transition-colors mb-2"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Stats Bar */}
        <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-2 border-b border-secondary pb-4">
          <div className="flex items-center gap-2 text-foreground/70">
            <FaFilm className="text-primary" />
            <span className="font-bold text-foreground">{stats.moviesWatched || 0}</span>
            <span className="text-sm">Films</span>
          </div>
          <div className="flex items-center gap-2 text-foreground/70">
            <FaTv className="text-primary" />
            <span className="font-bold text-foreground">{stats.seriesWatched || 0}</span>
            <span className="text-sm">Shows</span>
          </div>
          <div className="flex items-center gap-2 text-foreground/70">
            <FaStar className="text-yellow-400" />
            <span className="font-bold text-foreground">{stats.totalRatings || 0}</span>
            <span className="text-sm">Ratings</span>
          </div>
          <button onClick={() => openModal('Followers', followers)} className="flex items-center gap-1 text-foreground/70 hover:text-foreground transition-colors">
            <span className="font-bold text-foreground">{followers.length}</span>
            <span className="text-sm">Followers</span>
          </button>
          <button onClick={() => openModal('Following', profile.following)} className="flex items-center gap-1 text-foreground/70 hover:text-foreground transition-colors">
            <span className="font-bold text-foreground">{profile.following.length}</span>
            <span className="text-sm">Following</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-2 -mb-px">
          <nav className="flex space-x-1 overflow-x-auto custom-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-foreground/50 hover:text-foreground hover:border-foreground/30'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'watched' && (
          <MediaGrid items={combinedWatched} title={`${profile.username}'s Watched`} />
        )}

        {activeTab === 'ratings' && (
          <div>
            <h3 className="text-2xl font-bold mb-4">{profile.username}&apos;s Ratings</h3>
            {ratings.length > 0 ? (
              <div className="grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {ratings.map(rating => {
                  const isMovie = rating.mediaType === 'movie';
                  const href = isMovie ? `/movie/${rating.tmdbId}` : `/serie/${rating.tmdbId}`;
                  
                  return (
                    <Link href={href} key={rating.id} className="group">
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-secondary transform group-hover:scale-105 transition-transform duration-300">
                        <div className="w-full h-full flex items-center justify-center p-3">
                          {isMovie ? (
                            <FaFilm className="text-4xl text-foreground/20" />
                          ) : (
                            <FaTv className="text-4xl text-foreground/20" />
                          )}
                        </div>
                        {/* Rating overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                          <div className="flex items-center gap-0.5">
                            {renderStarsDisplay(rating.score)}
                          </div>
                          <span className="text-white/60 text-xs capitalize">{rating.mediaType}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="bg-surface p-6 rounded-lg">
                <p className="text-foreground/70">No ratings yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <MediaGrid items={combinedFavorites} title={`${profile.username}'s Favorites`} />
        )}

        {activeTab === 'watchlist' && (
          <MediaGrid items={combinedWatchlist} title={`${profile.username}'s Watchlist`} />
        )}

        {activeTab === 'playlists' && (
          <div>
            <h3 className="text-2xl font-bold mb-4">{profile.username}&apos;s Playlists</h3>
            {profile.playlists && profile.playlists.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                {profile.playlists.map(playlist => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            ) : (
              <div className="bg-surface p-6 rounded-lg">
                <p className="text-foreground/70">This user hasn&apos;t created any playlists yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
