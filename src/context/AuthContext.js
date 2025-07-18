'use client';

import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const router = useRouter();

  // Function to fetch the current user's data from the backend
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Not authenticated');
      }
      const userData = await res.json();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user data on initial load
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      throw new Error(data.message || 'Login failed');
    }

    // After successful login, fetch user data to update the context
    await fetchUser();
    setLoading(false);
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  // Function to update user lists locally without a full re-fetch
  const updateUserContext = (updatedUserData) => {
    setUser(updatedUserData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchUser, updateUserContext }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};