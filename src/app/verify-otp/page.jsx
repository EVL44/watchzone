'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'; 

export default function VerifyOtpPage() {
  const [credentials, setCredentials] = useState(null);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(60); 
  const [canResend, setCanResend] = useState(false);

  const router = useRouter();

  useEffect(() => {
    // 1. Check for pending registration credentials
    const pendingParams = sessionStorage.getItem('pendingRegistration');
    if (!pendingParams) {
      router.push('/signup');
      return;
    }
    setCredentials(JSON.parse(pendingParams));
  }, [router]);

  // Handle countdown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0 && !canResend) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    } else if (cooldown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [cooldown, canResend]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: credentials.email, 
          username: credentials.username, 
          password: credentials.password, 
          otp 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Verification failed');
      }
      
      setSuccessMsg('Email verified successfully! Logging you in...');
      sessionStorage.removeItem('pendingRegistration'); // Clean up memory

      // Authenticate
      const signInResult = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false, 
      });

      if (signInResult?.error) {
        throw new Error('Failed to auto-login. Please log in manually.');
      }
      
      router.push('/');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError('');
    setSuccessMsg('');
    setCanResend(false);
    setCooldown(60); // Reset cooldown

    try {
      const res = await fetch('/api/auth/otp/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: credentials.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend code');
      }
      
      setSuccessMsg('A new verification code has been dispatched.');
    } catch (err) {
      setError(err.message);
      // Re-enable button if it immediately failed due to rate limits
      setCanResend(true); 
      setCooldown(0);
    }
  };

  if (!credentials) return null; // Wait for useEffect mount

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-surface rounded-lg shadow-lg"> 
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Verify Your Email</h1>
          <p className="text-gray-400 text-sm">
            We sent a 6-digit code to <span className="text-primary font-medium">{credentials.email}</span>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              id="otp"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // Numeric only
              className="w-full px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] text-foreground bg-secondary border border-stone-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
              placeholder="000000"
              required
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center font-medium bg-red-950/20 py-2 rounded">{error}</p>}
          {successMsg && <p className="text-green-500 text-sm text-center font-medium bg-green-950/20 py-2 rounded">{successMsg}</p>}
          
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-md hover:bg-opacity-80 disabled:bg-opacity-50 transition-colors uppercase tracking-wider"
          >
            {loading ? 'Verifying...' : 'Validate Code'}
          </button>
        </form>

        <div className="pt-4 border-t border-stone-800 text-center flex flex-col items-center">
            <p className="text-sm text-gray-400 mb-3">Didn't receive the email?</p>
            <button
                type="button"
                onClick={handleResend}
                disabled={!canResend}
                className={`text-sm font-semibold transition-colors ${canResend ? 'text-primary hover:text-white' : 'text-stone-600 cursor-not-allowed'}`}
            >
                {canResend ? 'Resend Code via Email' : `Wait ${cooldown}s to resend`}
            </button>
        </div>
      </div>
    </div>
  );
}
