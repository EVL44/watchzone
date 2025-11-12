// src/app/profile/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // CORRECTED IMPORT PATH
import Image from 'next/image';
import UploadWidget from '@/components/UploadWidget';
import { FaUserCircle, FaEdit, FaHeart, FaListAlt, FaTrash } from 'react-icons/fa';
import MediaGrid from '@/components/MediaGrid';

export default function ProfilePage() {
  const { user, loading, updateUserContext, deleteAccount } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('favorites');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

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
      updateUserContext(data);
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

  const handleDeleteAccount = async () => {
    setIsUpdating(true);
    try {
      await deleteAccount();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      setShowDeleteConfirmation(false);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || !user) return <div className="text-center py-20 text-foreground">Loading...</div>;

  const combinedFavorites = [...(user.favoriteMovies || []), ...(user.favoriteSeries || [])];
  const combinedWatchlist = [...(user.watchlistMovies || []), ...(user.watchlistSeries || [])];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-surface p-6 rounded-lg mb-8 md:flex md:items-center">
        <div className="relative w-32 h-32 mx-auto md:mx-0 mb-4 md:mb-0 md:mr-6 flex-shrink-0">
          <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
            {user.avatarUrl ? <Image src={user.avatarUrl} alt="Avatar" layout="fill" objectFit="cover" unoptimized={true} /> : <FaUserCircle />}
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
            {/* NEW DELETE BUTTON SECTION */}
            <div className="mt-6 pt-4 border-t border-secondary">
              <button 
                onClick={() => setShowDeleteConfirmation(true)}
                className="w-full text-left p-3 rounded-md transition-colors flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                <FaTrash /> Delete Account
              </button>
            </div>
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
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-secondary p-3 rounded-md focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-secondary p-3 rounded-md focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">New Password</label>
                        <input type="password" placeholder="Leave blank to keep current" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-secondary p-3 rounded-md focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                    <button type="submit" disabled={isUpdating} className="bg-primary text-white px-6 py-3 rounded-md hover:bg-opacity-80 disabled:bg-opacity-50 transition-colors">{isUpdating ? 'Saving...' : 'Save Changes'}</button>
                    {message.text && <p className={`mt-4 text-sm ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>{message.text}</p>}
                </form>
              </div>
            )}
            {activeTab === 'favorites' && <MediaGrid items={combinedFavorites} title="My Favorites" />}
            {activeTab === 'watchlist' && <MediaGrid items={combinedWatchlist} title="My Watchlist" />}
          </div>
        </main>
      </div>

      {/* NEW DELETE CONFIRMATION MODAL */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-surface rounded-lg w-full max-w-sm p-6 relative shadow-2xl">
            <h2 className="text-xl font-bold text-red-500 mb-4">Confirm Account Deletion</h2>
            <p className="text-foreground/80 mb-6">Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirmation(false)} disabled={isUpdating} className="bg-secondary text-foreground px-4 py-2 rounded-md hover:bg-secondary/70 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleDeleteAccount} disabled={isUpdating} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors">
                {isUpdating ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}