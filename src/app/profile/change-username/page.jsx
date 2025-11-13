'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function ChangeUsernamePage() {
  const { user, loading, updateUserContext } = useAuth();
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      setUsername(user.username || user.name || '');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      // Update the user in our global context/session
      updateUserContext(data); 
      
      setMessage({ type: 'success', text: 'Username updated successfully!' });

      // Redirect to the new profile page
      router.push(`/user/${data.username}`);
      
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || !user) return <div className="text-center py-20 text-foreground">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Link href="/profile" className="flex items-center gap-2 text-primary hover:underline mb-4">
        <FaArrowLeft />
        Back to Settings
      </Link>
      <div className="bg-surface p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-6">Change Username</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block mb-2 font-medium">Username</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  className="w-full bg-secondary p-3 rounded-md focus:ring-2 focus:ring-primary focus:outline-none" 
                />
            </div>
            
            <button type="submit" disabled={isUpdating} className="bg-primary text-white px-6 py-3 rounded-md hover:bg-opacity-80 disabled:bg-opacity-50 transition-colors">
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
            
            {message.text && (
              <p className={`mt-4 text-sm ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                {message.text}
              </p>
            )}
        </form>
      </div>
    </div>
  );
}