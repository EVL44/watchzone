'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  
  const loading = status === 'loading';
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    if (status === "authenticated") {
      const fetchFullUser = async () => {
         try {
            // Use username if it exists, otherwise fall back to name (for profile/complete)
            const identifier = session.user.username || session.user.name;
            if (!identifier) return; // Wait for session update

            // Use /api/user/[username] to get full user data
            const res = await fetch(`/api/user/${identifier}`); 
            if(!res.ok) {
              // This can happen if username was just set, we just need the session user
              if(session.user.needsUsername) {
                setUser(session.user);
                return;
              }
              throw new Error("Failed to fetch user");
            }
            const fullUserData = await res.json();
            setUser(fullUserData);
         } catch (e) {
            console.error("Failed to fetch full user", e);
            signOut(); 
         }
      };
      
      if (session.user.username) {
         fetchFullUser();
      } else if (session.user.needsUsername) {
         setUser(session.user);
      }
      
    } else if (status === "unauthenticated") {
      setUser(null);
    }
  }, [session, status]);


  const login = async (email, password) => {
    const result = await signIn('credentials', {
      redirect: false, 
      email,
      password,
    });

    if (result.error) {
      throw new Error(result.error || 'Login failed');
    }
    // The redirect is handled in LoginForm.jsx
  };

  const logout = async () => {
    await signOut({ callbackUrl: '/login' });
  };
  
  // --- THIS IS THE FIX for Delete Account ---
  const deleteAccount = async () => {
    // 1. Call the (now fixed) API route
    const res = await fetch('/api/user/delete', {
      method: 'DELETE',
    });

    // 2. Check if the API call was successful
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Account deletion failed');
    }

    // 3. If successful, use next-auth's signOut to clear the session
    // and redirect with a success message.
    await signOut({
      callbackUrl: '/signup?message=Your account has been successfully deleted.'
    });
  };
  // --- END OF FIX ---

  const updateUserContext = (updatedUserData) => {
    setUser(updatedUserData); 
    
    // This is the function from useSession to update the token
    updateSession({ username: updatedUserData.username });
  };
  
  const contextValue = useMemo(() => ({
    user,
    loading: loading || (status === 'authenticated' && !user), 
    login,
    logout,
    deleteAccount,
    updateUserContext,
  }), [user, loading, status]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};