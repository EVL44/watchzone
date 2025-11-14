// src/app/profile/complete/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/context/AuthContext';

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession(); // Get next-auth session
  const { updateUserContext } = useAuth(); // Get your custom context updater
  
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Prefill username from Google name if available
  useEffect(() => {
    if (session && !session.user.username && session.user.name) {
      // Suggest a username based on their Google name (simple slug)
      const suggestedUsername = session.user.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      setUsername(suggestedUsername);
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      await updateSession({ username: data.username });
      updateUserContext(data);
      router.push('/'); 

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-secondary rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-foreground">
          Welcome!
        </h1>
        <p className="text-center text-gray-400">
          Please choose a unique username to complete your profile.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 text-foreground bg-background border border-stone-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Choose a username"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-md hover:bg-opacity-80 disabled:bg-opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}