// src/app/profile/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import UploadWidget from '@/components/UploadWidget';
// --- THIS IS THE FIX ---
import { FaUserCircle, FaEdit, FaHeart, FaListAlt, FaTrash, FaKey, FaUserTag, FaGoogle } from 'react-icons/fa';
// --- END OF FIX ---
import MediaGrid from '@/components/MediaGrid';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, deleteAccount } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('favorites');
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const handleDeleteAccount = async () => {
    setIsUpdating(true);
    try {
      await deleteAccount();
      // The AuthContext now handles the redirect
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete account.' });
      setShowDeleteConfirmation(false);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const userIdentifier = user?.username || user?.name;

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
          
          <UploadWidget onUpload={(url) => {
             fetch('/api/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatarUrl: url }),
             })
             .then(res => res.json())
             .then(updatedUser => {
                router.refresh(); 
             });
          }} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{user.username || user.name}</h1>
          <p className="text-foreground text-opacity-70">{user.email}</p>
        </div>
      </div>
      
      <div className="md:flex gap-8">
        <aside className="md:w-1/4 flex-shrink-0">
          <nav className="bg-surface p-4 rounded-lg">
            <ul className="space-y-2">
              <li><button onClick={() => setActiveTab('favorites')} className={`w-full text-left p-3 rounded-md transition-colors flex items-center gap-2 ${activeTab === 'favorites' ? 'bg-primary text-white' : 'hover:bg-secondary'}`}><FaHeart /> Favorites</button></li>
              <li><button onClick={() => setActiveTab('watchlist')} className={`w-full text-left p-3 rounded-md transition-colors flex items-center gap-2 ${activeTab === 'watchlist' ? 'bg-primary text-white' : 'hover:bg-secondary'}`}><FaListAlt /> Watchlist</button></li>
              <li><button onClick={() => setActiveTab('settings')} className={`w-full text-left p-3 rounded-md transition-colors flex items-center gap-2 ${activeTab === 'settings' ? 'bg-primary text-white' : 'hover:bg-secondary'}`}><FaEdit /> Settings</button></li>
            </ul>
            <div className="mt-6 pt-4 border-t border-secondary">
              <button 
                onClick={() => {
                  setDeleteConfirmationInput('');
                  setShowDeleteConfirmation(true);
                }}
                className="w-full text-left p-3 rounded-md transition-colors flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                <FaTrash /> Delete Account
              </button>
            </div>
          </nav>
        </aside>
        
        <main className="flex-1 mt-8 md:mt-0">
          <div className="bg-surface p-6 rounded-lg">
            
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                <div className="space-y-4">
                  
                  <Link href="/profile/change-username">
                    <div className="flex items-center gap-3 bg-secondary p-4 rounded-lg hover:bg-opacity-80 transition-colors cursor-pointer mb-4">
                      <FaUserTag className="text-primary" />
                      <div>
                        <h3 className="font-semibold text-foreground">Change Username</h3>
                        <p className="text-sm text-foreground/70">Update your unique @username.</p>
                      </div>
                    </div>
                  </Link>
                  
                  {user.hasPassword && (
                    <Link href="/profile/change-password">
                      <div className="flex items-center gap-3 bg-secondary p-4 rounded-lg hover:bg-opacity-80 transition-colors cursor-pointer">
                        <FaKey className="text-primary" />
                        <div>
                          <h3 className="font-semibold text-foreground">Change Password</h3>
                          <p className="text-sm text-foreground/70">Update your login password.</p>
                        </div>
                      </div>
                    </Link>
                  )}
                  
                  {!user.hasPassword && (
                    <div className="flex items-center gap-3 bg-secondary p-4 rounded-lg">
                      <FaGoogle className="text-red-500" />
                      <div>
                        <h3 className="font-semibold text-foreground">Logged in with Google</h3>
                        <p className="text-sm text-foreground/70">Manage your password in your Google account settings.</p>
                      </div>
                    </div>
                  )}
                  
                </div>
              </div>
            )}
            
            {activeTab === 'favorites' && <MediaGrid items={combinedFavorites} title="My Favorites" />}
            {activeTab === 'watchlist' && <MediaGrid items={combinedWatchlist} title="My Watchlist" />}
          </div>
        </main>
      </div>

      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-surface rounded-lg w-full max-w-sm p-6 relative shadow-2xl">
            <h2 className="text-xl font-bold text-red-500 mb-4">Confirm Account Deletion</h2>
            <p className="text-foreground/80 mb-6">
              This action is permanent. To confirm, please type your username: <strong className="text-foreground">{userIdentifier}</strong>
            </p>
            
            <input
              type="text"
              value={deleteConfirmationInput}
              onChange={(e) => setDeleteConfirmationInput(e.target.value)}
              className="w-full bg-secondary p-3 rounded-md focus:ring-2 focus:ring-primary focus:outline-none mb-4"
              placeholder={`Type "${userIdentifier}" to confirm`}
            />

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteConfirmation(false)} 
                disabled={isUpdating} 
                className="bg-secondary text-foreground px-4 py-2 rounded-md hover:bg-secondary/70 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount} 
                disabled={isUpdating || deleteConfirmationInput !== userIdentifier} 
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isUpdating ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
            {message.text && message.type === 'error' && <p className={`mt-4 text-sm text-red-500`}>{message.text}</p>}
          </div>
        </div>
      )}
    </div>
  );
}