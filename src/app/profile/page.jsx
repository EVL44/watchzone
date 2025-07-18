'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import UploadWidget from '@/components/UploadWidget';
import { FaUserCircle, FaEdit, FaHeart, FaListAlt } from 'react-icons/fa';

const MediaListComponent = ({ title, items, type }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    {items && items.length > 0 ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map(item => (
          <Link href={`/${type}/${item.tmdbId}`} key={item.id}>
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <Image src={`https://image.tmdb.org/t/p/w500${item.posterPath}`} alt={item.title || item.name} layout="fill" objectFit="cover" />
            </div>
          </Link>
        ))}
      </div>
    ) : <p className="text-foreground text-opacity-70">No items in this list yet.</p>}
  </div>
);

export default function ProfilePage() {
  const { user, loading, updateUserContext } = useAuth(); // FIX: Changed setUser to updateUserContext
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('favorites');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user, loading, router]);

  const handleUpdate = async (payload) => {
    setIsUpdating(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      updateUserContext(data); // FIX: Changed setUser to updateUserContext
      setMessage({ type: 'success', text: 'Update successful!' });
      if (payload.password) setPassword('');
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const payload = { username, email };
    if (password) payload.password = password;
    handleUpdate(payload);
  };

  if (loading || !user) return <div className="text-center py-20 text-foreground">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-surface p-6 rounded-lg mb-8 md:flex md:items-center">
        <div className="relative w-32 h-32 mx-auto md:mx-0 mb-4 md:mb-0 md:mr-6 flex-shrink-0">
          <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
            {user.avatarUrl ? <Image src={user.avatarUrl} alt="Avatar" layout="fill" objectFit="cover" /> : <FaUserCircle />}
          </div>
          <UploadWidget onUpload={(url) => handleUpdate({ avatarUrl: url })} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{user.username}</h1>
          <p className="text-foreground text-opacity-70">{user.email}</p>
        </div>
      </div>
      
      <div className="md:flex gap-8">
        <aside className="md:w-1/4 flex-shrink-0">
          <nav className="bg-surface p-4 rounded-lg">
            <ul className="space-y-2">
              <li><button onClick={() => setActiveTab('favorites')} className={`w-full text-left p-3 rounded-md transition-colors flex items-center gap-2 ${activeTab === 'favorites' ? 'bg-primary text-white' : 'hover:bg-secondary'}`}><FaHeart /> Favorites</button></li>
              <li><button onClick={() => setActiveTab('watchlist')} className={`w-full text-left p-3 rounded-md transition-colors flex items-center gap-2 ${activeTab === 'watchlist' ? 'bg-primary text-white' : 'hover:bg-secondary'}`}><FaListAlt /> Watchlist</button></li>
              <li><button onClick={() => setActiveTab('edit')} className={`w-full text-left p-3 rounded-md transition-colors flex items-center gap-2 ${activeTab === 'edit' ? 'bg-primary text-white' : 'hover:bg-secondary'}`}><FaEdit /> Edit Profile</button></li>
            </ul>
          </nav>
        </aside>
        
        <main className="flex-1 mt-8 md:mt-0">
          <div className="bg-surface p-6 rounded-lg">
            {activeTab === 'edit' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2 font-medium">Username</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-secondary p-3 rounded-md border-border focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-secondary p-3 rounded-md border-border focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">New Password</label>
                        <input type="password" placeholder="Leave blank to keep current" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-secondary p-3 rounded-md border-border focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                    <button type="submit" disabled={isUpdating} className="bg-primary text-white px-6 py-3 rounded-md hover:bg-opacity-80 disabled:bg-opacity-50 transition-colors">{isUpdating ? 'Saving...' : 'Save Changes'}</button>
                    {message.text && <p className={`mt-4 text-sm ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>{message.text}</p>}
                </form>
              </div>
            )}
            {activeTab === 'favorites' && <>
              <MediaListComponent title="Favorite Movies" items={user.favoriteMovies} type="movie" />
              <div className="mt-8"><MediaListComponent title="Favorite Series" items={user.favoriteSeries} type="serie" /></div>
            </>}
            {activeTab === 'watchlist' && <>
              <MediaListComponent title="Movie Watchlist" items={user.watchlistMovies} type="movie" />
              <div className="mt-8"><MediaListComponent title="Series Watchlist" items={user.watchlistSeries} type="serie" /></div>
            </>}
          </div>
        </main>
      </div>
    </div>
  );
}