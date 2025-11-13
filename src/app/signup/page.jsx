'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react'; 
import GoogleLogo from '@/components/GoogleLogo';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // 1. Import icons

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 2. Add state
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false, 
      });

      if (signInResult.error) {
        throw new Error(signInResult.error);
      }
      
      router.push('/');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-surface rounded-lg shadow-lg"> 
        <h1 className="text-3xl font-bold text-center text-foreground">Create an Account</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 text-foreground bg-secondary border border-stone-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
              placeholder="Username"
              required
            />
          </div>
          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 text-foreground bg-secondary border border-stone-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
              placeholder="Email"
              required
            />
          </div>
          
          {/* 3. Add relative wrapper and toggle button */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 text-foreground bg-secondary border border-stone-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
              placeholder="Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/70 hover:text-primary"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-md hover:bg-opacity-80 disabled:bg-opacity-50 transition-colors"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-surface text-gray-400"> 
              Or sign up with
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full py-2 px-4 bg-secondary text-foreground font-semibold rounded-md hover:bg-opacity-80 disabled:bg-opacity-50 transition-colors flex items-center justify-center gap-2" 
        >
          <GoogleLogo /> 
          Sign up with Google
        </button>

        <p className="text-sm text-center text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}