'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import UserListModal from '@/components/UserListModal';
import MediaGrid from '@/components/MediaGrid';
import PlaylistCard from '@/components/PlaylistCard';
import { FaUserCircle } from 'react-icons/fa';

export default function UserProfileClient({ profile }) {
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const [isFollowing, setIsFollowing] = useState(profile.isFollowing);
  const [followers, setFollowers] = useState(profile.followers);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUsers, setModalUsers] = useState([]);
  
  const [activeTab, setActiveTab] = useState('favorites');

  const handleFollowToggle = async () => {
    if (!currentUser) return router.push('/login');
    setIsUpdatingFollow(true);
    const action = isFollowing ? 'unfollow' : 'follow';
    try {
      await fetch('/api/user/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: profile.id, action }),
      });
      setIsFollowing(!isFollowing);
      if (action === 'follow') {
        setFollowers([...followers, currentUser]);
      } else {
        setFollowers(followers.filter(user => user.id !== currentUser.id));
      }
    } catch (err) {
      console.error(err);
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

  return (
    <>
      {modalOpen && <UserListModal title={modalTitle} users={modalUsers} onClose={() => setModalOpen(false)} />}
      <div className="bg-surface p-6 rounded-lg mb-8 md:flex md:items-center">
        <div className="w-24 h-24 md:w-32 md:h-32 mx-auto md:mx-0 mb-4 md:mb-0 md:mr-6 flex-shrink-0">
          <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-4xl font-bold text-white overflow-hidden relative">
            {profile.avatarUrl ? <Image src={profile.avatarUrl} alt="Avatar" layout="fill" objectFit="cover" /> : <FaUserCircle />}
          </div>
        </div>
        <div className="flex-grow text-center md:text-left">
          <h1 className="text-3xl font-bold">{profile.username}</h1>
          <div className="flex justify-center md:justify-start items-center gap-6 mt-4 text-foreground/80">
            <div className="text-center">
              <span className="font-bold text-lg text-foreground">{profile.playlists?.length || 0}</span>
              <span className="text-sm block">Playlists</span>
            </div>
            <button onClick={() => openModal('Followers', followers)} className="text-center">
              <span className="font-bold text-lg text-foreground">{followers.length}</span>
              <span className="text-sm block">Followers</span>
            </button>
            <button onClick={() => openModal('Following', profile.following)} className="text-center">
              <span className="font-bold text-lg text-foreground">{profile.following.length}</span>
              <span className="text-sm block">Following</span>
            </button>
          </div>
        </div>
        {currentUser && !profile.isCurrentUser && (
          <button onClick={handleFollowToggle} disabled={isUpdatingFollow} className={`mt-4 md:mt-0 px-6 py-2 rounded-full font-semibold transition-colors disabled:opacity-50 ${isFollowing ? 'bg-secondary text-foreground' : 'bg-primary text-white hover:bg-opacity-80'}`}>
            {isUpdatingFollow ? '...' : isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>
      
      <div className="mb-6 border-b border-secondary">
        <nav className="flex space-x-4">
          <button onClick={() => setActiveTab('favorites')} className={`px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'favorites' ? 'border-b-2 border-primary text-primary' : 'text-foreground/70 hover:text-foreground'}`}>Favorites</button>
          <button onClick={() => setActiveTab('watchlist')} className={`px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'watchlist' ? 'border-b-2 border-primary text-primary' : 'text-foreground/70 hover:text-foreground'}`}>Watchlist</button>
          <button onClick={() => setActiveTab('playlists')} className={`px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'playlists' ? 'border-b-2 border-primary text-primary' : 'text-foreground/70 hover:text-foreground'}`}>Playlists</button>
        </nav>
      </div>

      <div>
        {activeTab === 'favorites' && <MediaGrid items={combinedFavorites} title={`${profile.username}'s Favorites`} />}
        {activeTab === 'watchlist' && <MediaGrid items={combinedWatchlist} title={`${profile.username}'s Watchlist`} />}
        {activeTab === 'playlists' && (
           <div>
            <h3 className="text-2xl font-bold mb-4">{`${profile.username}'s Playlists`}</h3>
            {profile.playlists && profile.playlists.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {profile.playlists.map(playlist => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            ) : (
              <div className="bg-surface p-6 rounded-lg"><p className="text-foreground/70">This user hasn't created any playlists yet.</p></div>
            )}
           </div>
        )}
      </div>
    </>
  );
}