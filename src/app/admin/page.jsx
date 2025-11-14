'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { FaUserCircle, FaSearch, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import Badges from '@/components/Badges';
import { useRouter } from 'next/navigation';

// --- Confirmation Modal ---
function DeleteModal({ user, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-surface rounded-lg p-6 w-full max-w-sm">
        <div className="flex items-center gap-3">
          <FaExclamationTriangle className="text-red-500 h-10 w-10 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-foreground">Delete User?</h2>
            <p className="text-foreground/70">
              Are you sure you want to delete <span className="font-bold">{user.username}</span>? This action is permanent.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="bg-secondary text-foreground px-4 py-2 rounded-md hover:bg-opacity-80">
            Cancel
          </button>
          <button onClick={onConfirm} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
            Yes, Delete User
          </button>
        </div>
      </div>
    </div>
  );
}

// --- User Row ---
function UserRow({ user, currentUser, onRoleChange, onDelete }) {
  const [roles, setRoles] = useState(user.roles || []);
  const isSuperAdmin = user.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
  const isCurrentUser = user.id === currentUser.id;

  const handleCheckboxChange = (role, isChecked) => {
    let newRoles;
    if (isChecked) {
      newRoles = [...roles, role];
    } else {
      newRoles = roles.filter(r => r !== role);
    }
    setRoles(newRoles);
    onRoleChange(user.id, newRoles);
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-secondary rounded-lg gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary flex-shrink-0 overflow-hidden relative">
          {user.avatarUrl ? (
            <Image src={user.avatarUrl} alt={user.username} layout="fill" objectFit="cover" unoptimized={true} />
          ) : (
            <FaUserCircle className="w-full h-full text-white" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">{user.username}</span>
            <Badges user={user} />
          </div>
          <span className="text-sm text-foreground/70">{user.email}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-yellow-500 rounded bg-surface focus:ring-yellow-500"
            checked={roles.includes('ADMIN')}
            onChange={(e) => handleCheckboxChange('ADMIN', e.target.checked)}
            disabled={isSuperAdmin} // Disable for Super Admin
          />
          <span className="font-medium text-yellow-500">Admin</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-500 rounded bg-surface focus:ring-blue-500"
            checked={roles.includes('VERIFIED')}
            onChange={(e) => handleCheckboxChange('VERIFIED', e.target.checked)}
            disabled={isSuperAdmin} // Disable for Super Admin
          />
          <span className="font-medium text-blue-500">Verified</span>
        </label>
        <button
          onClick={onDelete}
          disabled={isSuperAdmin || isCurrentUser} // Disable for Super Admin or self
          className="ml-auto md:ml-2 p-2 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors disabled:text-gray-500 disabled:hover:bg-transparent"
          title={isSuperAdmin ? "Cannot delete Super Admin" : isCurrentUser ? "Cannot delete yourself" : "Delete User"}
        >
          <FaTrash className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// --- Main Page Component ---
export default function AdminPage() {
  const { user: currentUser, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [userToDelete, setUserToDelete] = useState(null); // For delete modal

  // Redirect if user is not admin
  useEffect(() => {
    if (!loading && (!currentUser || !currentUser.roles?.includes('ADMIN'))) {
      router.push('/');
    }
  }, [currentUser, loading, router]);

  // Fetch users
  const fetchUsers = useCallback(async (query) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/users?search=${query}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (currentUser?.roles?.includes('ADMIN')) {
      fetchUsers('');
    }
  }, [fetchUsers, currentUser]);

  // Handle search input
  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(searchTerm);
  };

  // Handle role change
  const handleRoleChange = async (userId, newRoles) => {
    setError('');
    try {
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === userId ? { ...u, roles: newRoles } : u)
      );

      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roles: newRoles }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
    } catch (error) {
      setError(error.message);
      fetchUsers(searchTerm); // Revert on error
    }
  };

  // Handle delete
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setError('');
    try {
      const res = await fetch('/api/admin/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userToDelete.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      setUserToDelete(null);
      fetchUsers(searchTerm); // Refetch list
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading || !currentUser || !currentUser.roles?.includes('ADMIN')) {
    return <div className="text-center py-20 text-foreground">Loading Admin Panel...</div>;
  }

  return (
    <>
      {userToDelete && (
        <DeleteModal 
          user={userToDelete} 
          onCancel={() => setUserToDelete(null)} 
          onConfirm={handleDeleteUser} 
        />
      )}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-extrabold text-foreground mb-8">Admin Panel</h1>
        
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by username or email..."
              className="w-full bg-secondary p-3 pl-10 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" />
          </div>
          <button type="submit" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-opacity-80 transition-colors">
            Search
          </button>
        </form>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="bg-surface p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-6">Manage Users ({users.length})</h2>
          {isLoading ? (
            <p>Loading users...</p>
          ) : (
            <div className="space-y-4">
              {users.length > 0 ? (
                users.map(u => (
                  <UserRow 
                    key={u.id} 
                    user={u}
                    currentUser={currentUser} 
                    onRoleChange={handleRoleChange} 
                    onDelete={() => setUserToDelete(u)} // Set user to delete on click
                  />
                ))
              ) : (
                <p className="text-foreground/70 text-center py-4">No users found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}