'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa'; // 1. Import icons

export default function ChangePasswordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 2. Add state for each toggle
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user && !user.hasPassword) {
      router.push('/profile');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setIsUpdating(false);
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      setIsUpdating(false);
      return;
    }

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || !user || !user.hasPassword) {
     return <div className="text-center py-20 text-foreground">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Link href="/profile" className="flex items-center gap-2 text-primary hover:underline mb-4">
        <FaArrowLeft />
        Back to Settings
      </Link>
      <div className="bg-surface p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-6">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 3. Add relative wrapper and toggle button for Current Password */}
            <div className="relative">
                <label className="block mb-2 font-medium">Current Password</label>
                <input 
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword} 
                  onChange={e => setCurrentPassword(e.target.value)} 
                  className="w-full bg-secondary p-3 rounded-md focus:ring-2 focus:ring-primary focus:outline-none" 
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-[46px] text-foreground/70 hover:text-primary"
                  aria-label="Toggle current password visibility"
                >
                  {showCurrent ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>
            
            {/* 4. Add relative wrapper and toggle button for New Password */}
            <div className="relative">
                <label className="block mb-2 font-medium">New Password</label>
                <input 
                  type={showNew ? 'text' : 'password'} 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  className="w-full bg-secondary p-3 rounded-md focus:ring-2 focus:ring-primary focus:outline-none" 
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-[46px] text-foreground/70 hover:text-primary"
                  aria-label="Toggle new password visibility"
                >
                  {showNew ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>
            
            {/* 5. Add relative wrapper and toggle button for Confirm Password */}
            <div className="relative">
                <label className="block mb-2 font-medium">Confirm New Password</label>
                <input 
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.g.target.value)} 
                  className="w-full bg-secondary p-3 rounded-md focus:ring-2 focus:ring-primary focus:outline-none" 
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-[46px] text-foreground/70 hover:text-primary"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
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