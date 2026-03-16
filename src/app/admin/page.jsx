'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { FaUserCircle, FaSearch, FaTrash, FaExclamationTriangle, FaUndo } from 'react-icons/fa';
import Badges from '@/components/Badges';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- Confirmation Modal ---
function DeleteModal({ user, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 border-[10px] border-red-900/30">
      <div className="bg-black border-2 border-red-600 p-8 w-full max-w-md shadow-[0_0_40px_rgba(255,0,0,0.4)]">
        <div className="flex items-start gap-4 mb-6">
          <FaExclamationTriangle className="text-red-500 h-10 w-10 flex-shrink-0 animate-ping opacity-75" />
          <div>
            <h2 className="text-2xl font-black tracking-widest text-red-500 mb-2 uppercase">TERMINATE ENTITY?</h2>
            <p className="text-red-800/80 font-mono text-sm leading-relaxed">
              WARNING: YOU ARE ABOUT TO INITIATE TERMINATION PROTOCOL ON ASSET DESIGNATION <span className="text-red-400 font-bold bg-red-950/50 px-1 border border-red-900 block mt-2 text-base">{user.username}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
          <button onClick={onCancel} className="bg-black border border-green-800 text-green-600 px-6 py-3 hover:bg-green-900/30 hover:text-green-400 transition-colors uppercase font-bold tracking-widest text-sm">
            ABORT
          </button>
          <button onClick={onConfirm} className="bg-red-900/40 border border-red-500 text-red-500 px-6 py-3 hover:bg-red-600 hover:text-black transition-colors uppercase font-bold tracking-widest text-sm shadow-[0_0_15px_rgba(255,0,0,0.5)]">
            AUTHORIZE PURGE
          </button>
        </div>
      </div>
    </div>
  );
}

// --- User Row ---
function UserRow({ user, currentUser, onRoleChange, onDelete, onReactivate }) {
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
    <div className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-green-900/50 bg-black hover:bg-green-950/20 transition-colors gap-4 group relative overflow-hidden ${user.isDeactivated ? 'opacity-60 grayscale' : ''}`}>
      {/* Decorative side accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${user.isDeactivated ? 'bg-red-900' : 'bg-green-800 group-hover:bg-green-500'}`}></div>

      <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
        <div className="w-10 h-10 border border-green-800 bg-gray-900 flex-shrink-0 relative overflow-hidden flex items-center justify-center">
          {user.avatarUrl ? (
            <Image src={user.avatarUrl} alt={user.username} layout="fill" objectFit="cover" unoptimized={true} className="opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all" />
          ) : (
             <span className="text-green-800 text-xs tracking-tighter">IMG_NULL</span>
          )}
          {/* Faux scanning line over image */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-green-500/50 animate-[scan_3s_linear_infinite]"></div>
        </div>
        <div className="flex-grow">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] text-green-700 font-bold uppercase tracking-widest border border-green-900 px-1">ID: {user.id.slice(-6)}</span>
            <Link href={`/user/${user.username}`} className={`font-bold tracking-widest text-sm md:text-base hover:text-white hover:underline ${user.isDeactivated ? 'text-red-500 line-through' : 'text-green-400'}`}>
              {user.username}
            </Link>
            <Badges user={user} />
            {user.isDeactivated && (
              <span className="text-[10px] bg-red-900/30 border border-red-500 text-red-400 px-2 py-[2px] tracking-widest uppercase animate-pulse">
                ERR: DEACTIVATED
              </span>
            )}
            {isSuperAdmin && (
               <span className="text-[10px] bg-yellow-900/30 border border-yellow-500 text-yellow-500 px-2 py-[2px] tracking-widest uppercase animate-pulse">
                 ROOT_SYS_OP
               </span>
            )}
          </div>
          <span className="text-xs text-green-700 tracking-wider break-all">COM-LINK: {user.email}</span>
        </div>
      </div>
      
      <div className="flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-6 w-full md:w-auto relative z-10 mt-2 md:mt-0 justify-end md:justify-start">
        <label className="flex items-center gap-2 cursor-pointer group/label">
          <div className="relative">
             <input
               type="checkbox"
               className="peer sr-only"
               checked={roles.includes('ADMIN')}
               onChange={(e) => handleCheckboxChange('ADMIN', e.target.checked)}
               disabled={isSuperAdmin}
             />
             <div className={`w-4 h-4 border ${isSuperAdmin ? 'border-gray-800 bg-gray-900' : 'border-yellow-700 bg-black peer-checked:bg-yellow-600 peer-checked:border-yellow-400 peer-focus:ring-1 peer-focus:ring-yellow-500'} transition-all`}></div>
          </div>
          <span className={`text-xs tracking-widest uppercase ${roles.includes('ADMIN') ? 'text-yellow-500 font-bold' : 'text-green-800'}`}>SYS-OP</span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer group/label">
          <div className="relative">
             <input
               type="checkbox"
               className="peer sr-only"
               checked={roles.includes('VERIFIED')}
               onChange={(e) => handleCheckboxChange('VERIFIED', e.target.checked)}
               disabled={isSuperAdmin}
             />
             <div className={`w-4 h-4 border ${isSuperAdmin ? 'border-gray-800 bg-gray-900' : 'border-blue-800 bg-black peer-checked:bg-blue-600 peer-checked:border-blue-400 peer-focus:ring-1 peer-focus:ring-blue-500'} transition-all`}></div>
          </div>
          <span className={`text-xs tracking-widest uppercase ${roles.includes('VERIFIED') ? 'text-blue-500 font-bold' : 'text-green-800'}`}>TRUST-L1</span>
        </label>

        <div className="flex items-center gap-2 ml-auto">
          <Link
            href={`/admin/user/${user.id}`}
            className="border border-green-800 bg-green-950/30 text-green-500 hover:bg-green-900 hover:text-green-400 hover:border-green-500 px-3 py-1 text-xs tracking-widest uppercase font-bold transition-all shadow-[0_0_10px_rgba(0,255,0,0)] hover:shadow-[0_0_10px_rgba(0,255,0,0.5)]"
          >
            [INSPECT]
          </Link>
          
          <button
            onClick={user.isDeactivated ? onReactivate : onDelete}
            disabled={isSuperAdmin || isCurrentUser}
            className={`border p-2 flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed
               ${user.isDeactivated 
                  ? 'border-green-800 text-green-600 hover:bg-green-900 hover:text-green-400 hover:border-green-500 shadow-[0_0_10px_rgba(0,255,0,0)] hover:shadow-[0_0_10px_rgba(0,255,0,0.5)]' 
                  : 'border-red-900 text-red-700 hover:bg-red-950 hover:text-red-400 hover:border-red-500 shadow-[0_0_10px_rgba(255,0,0,0)] hover:shadow-[0_0_10px_rgba(255,0,0,0.5)]'
               }`}
            title={isSuperAdmin ? "ROOT_ERR: CANNOT MODIFY ORIGIN" : isCurrentUser ? "ROOT_ERR: SELF_MODIFICATION_LOCKED" : user.isDeactivated ? "EXEC: RESTORE_ASSET" : "EXEC: TERMINATE_ASSET"}
          >
            {user.isDeactivated ? <FaUndo className="h-4 w-4" /> : <FaTrash className="h-4 w-4" />}
          </button>
        </div>
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
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
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

  // Handle reactivate
  const handleReactivateUser = async (userId) => {
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reactivate' }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      fetchUsers(searchTerm); // Refetch list
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading || !currentUser || !currentUser.roles?.includes('ADMIN')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-green-500 font-mono">
        <div className="flex flex-col items-center gap-4">
          <FaSearch className="animate-spin h-8 w-8" />
          <p className="tracking-widest">AUTHENTICATING WZ-SYS ROOT...</p>
        </div>
      </div>
    );
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
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Faux Header / Telemetry */}
          <header className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-green-900 pb-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-green-400 mb-2">WZ-SYS // ROOT TERMINAL</h1>
              <p className="text-green-700 text-sm md:text-base tracking-widest">AUTHORIZED PERSONNEL ONLY. ALL ACTIONS LOGGED.</p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <p className="text-xs text-green-800">CONNECT SECURE: <span className="text-green-500 animate-pulse">ACTIVE</span></p>
              <p className="text-xs text-green-800">SYS-OP: <span className="text-green-400">{currentUser.username}</span></p>
              <p className="text-xs text-green-800">LATENCY: <span className="text-green-500">{Math.floor(Math.random() * 20) + 12}ms</span></p>
            </div>
          </header>
          
          {/* Query Interface */}
          <div className="bg-gray-900 border border-green-900 p-6 rounded-sm shadow-[0_0_15px_rgba(0,255,0,0.05)] mb-8">
            <h2 className="text-green-500 text-sm tracking-widest uppercase mb-4 shrink-0 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 inline-block animate-ping"></span> QUERY ENTITY DIRECTORY
            </h2>
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="INPUT UUID, DESIGNATION, OR COM-LINK..."
                  className="w-full bg-black border border-green-800 text-green-400 p-3 pl-10 focus:ring-1 focus:ring-green-500 focus:border-green-500 focus:outline-none placeholder-green-900 transition-all font-mono"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-green-700" />
              </div>
              <button type="submit" className="bg-green-900/30 border border-green-700 text-green-400 px-6 py-3 hover:bg-green-800 hover:text-black transition-all font-bold tracking-widest">
                EXECUTE
              </button>
            </form>
            {error && <p className="text-red-500 mt-4 text-sm bg-red-900/20 p-2 border border-red-900">ERR: {error}</p>}
          </div>

          {/* Results Grid */}
          <div className="bg-gray-900 border border-green-900 p-6 rounded-sm shadow-[0_0_15px_rgba(0,255,0,0.05)] relative overflow-hidden">
             {/* Fake background scanline */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,0,0.025)_50%)] bg-[length:100%_4px] pointer-events-none"></div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-green-500 text-sm tracking-widest uppercase relative z-10">ACTIVE ENTITIES [{users.length}]</h2>
              {isLoading && <span className="text-xs text-green-600 animate-pulse relative z-10">SCANNING SECTORS...</span>}
            </div>

            {isLoading ? (
              <div className="h-40 flex items-center justify-center">
                 <div className="w-full bg-green-950/30 h-1 relative overflow-hidden">
                    <div className="absolute left-0 top-0 h-full bg-green-500 w-1/4 animate-[scan_2s_ease-in-out_infinite]"></div>
                 </div>
              </div>
            ) : (
              <div className="space-y-3 relative z-10">
                {users.length > 0 ? (
                  users.map(u => (
                    <UserRow 
                      key={u.id} 
                      user={u}
                      currentUser={currentUser} 
                      onRoleChange={handleRoleChange} 
                      onDelete={() => setUserToDelete(u)} 
                      onReactivate={() => handleReactivateUser(u.id)}
                    />
                  ))
                ) : (
                  <p className="text-green-800 text-center py-8 border border-dashed border-green-900 uppercase">0 ENTITIES MATCH SPECIFIED PARAMETERS</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}