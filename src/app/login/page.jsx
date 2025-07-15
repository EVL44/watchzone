'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the authentication check is done and the user is logged in, redirect
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: loginIdentifier, password }),
      });

      const data = await res.json();
      if (res.ok) {
        login(data.user);
      } else {
        setError(data.message || 'Failed to login');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Don't render the form if the user is logged in (to avoid flash of content)
  if (authLoading || user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-stone-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-white">Login to Kentar</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="login"
              className="text-sm font-medium text-gray-300"
            >
              Username or Email
            </label>
            <input
              id="login"
              type="text"
              value={loginIdentifier}
              onChange={(e) => setLoginIdentifier(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-white bg-stone-700 border border-stone-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Username or Email"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-white bg-stone-700 border border-stone-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Password"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 font-semibold text-white bg-primary rounded-md hover:bg-opacity-80 disabled:bg-opacity-50 transition-colors"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-400">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}