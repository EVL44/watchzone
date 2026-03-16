'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { FaArrowLeft, FaExclamationTriangle, FaLock, FaUserCircle, FaSave, FaBan, FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';
import Badges from '@/components/Badges';

// --- Ban Modal ---
function BanModal({ user, onCancel, onConfirm }) {
  const [duration, setDuration] = useState('24h');
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4 border-[10px] border-red-900/30">
      <div className="bg-black border-2 border-red-600 p-8 w-full max-w-lg shadow-[0_0_40px_rgba(255,0,0,0.4)]">
        <div className="flex items-start gap-4 mb-6">
          <FaBan className="text-red-500 h-10 w-10 flex-shrink-0 animate-ping opacity-75" />
          <div>
            <h2 className="text-2xl font-black tracking-widest text-red-500 mb-2 uppercase">INITIATE EXILE PROTOCOL</h2>
            <p className="text-red-800/80 font-mono text-sm leading-relaxed">
              SUSPEND ACCESS FOR ASSET: <span className="text-red-400 font-bold bg-red-950/50 px-1 border border-red-900">{user.username}</span>
            </p>
          </div>
        </div>
        
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-red-500 text-xs tracking-widest uppercase mb-2">PUNISHMENT DURATION</label>
            <select 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-black border border-red-800 text-red-400 p-3 outline-none focus:border-red-500 font-mono uppercase"
            >
              <option value="24h">24 HOURS</option>
              <option value="7d">1 WEEK</option>
              <option value="30d">1 MONTH</option>
              <option value="permanent">PERMANENT DELETION</option>
            </select>
          </div>
          <div>
            <label className="block text-red-500 text-xs tracking-widest uppercase mb-2">SANCTION REASON (VISIBLE TO TARGET)</label>
            <input 
              type="text" 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g., Violating community guidelines"
              className="w-full bg-black border border-red-800 text-red-400 p-3 outline-none focus:border-red-500 font-mono placeholder-red-900/50"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <button onClick={onCancel} className="bg-black border border-green-800 text-green-600 px-6 py-3 hover:bg-green-900/30 hover:text-green-400 transition-colors uppercase font-bold tracking-widest text-sm">
            ABORT
          </button>
          <button 
            onClick={() => onConfirm(duration, reason)} 
            disabled={!reason.trim()}
            className="bg-red-900/40 border border-red-500 text-red-500 px-6 py-3 hover:bg-red-600 hover:text-black transition-colors uppercase font-bold tracking-widest text-sm shadow-[0_0_15px_rgba(255,0,0,0.5)] disabled:opacity-50"
          >
            EXECUTE SANCTION
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdvancedUserPage() {
  const { user: currentUser, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Edit state
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRoles, setEditRoles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Ban state
  const [showBanModal, setShowBanModal] = useState(false);

  const isSuperAdmin = currentUser?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
  const isTargetSuperAdmin = user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
  const isSelf = currentUser?.id === user?.id;

  // Protect route
  useEffect(() => {
    if (!loading && (!currentUser || !currentUser.roles?.includes('ADMIN'))) {
      router.push('/');
    }
  }, [currentUser, loading, router]);


  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch entity data');
      const data = await res.json();
      setUser(data);
      setEditUsername(data.username);
      setEditEmail(data.email);
      setEditRoles(data.roles || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (currentUser?.roles?.includes('ADMIN') && userId) {
      fetchUser();
    }
  }, [fetchUser, currentUser, userId]);

  const handleUpdateInfo = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'updateInfo', 
          username: editUsername, 
          email: editEmail, 
          roles: editRoles 
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      setSuccess('ENTITY PARAMETERS UPDATED SUCCESSFULLY');
      fetchUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  };

  const handleBan = async (duration, reason) => {
    setError('');
    setShowBanModal(false);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ban', duration, reason }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      setSuccess('ENTITY SUCCESSFULLY BANISHED');
      fetchUser();
    } catch (err) {
      setError(err.message);
    }
  };
  
  const handleUnban = async () => {
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unban' }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      setSuccess('ENTITY PARDONED');
      fetchUser();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleRole = (role) => {
    setEditRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  if (loading || !currentUser || !currentUser.roles?.includes('ADMIN')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-green-500 font-mono">
        <div className="flex flex-col items-center gap-4">
          <p className="tracking-widest animate-pulse">ESTABLISHING SECURE CONNECTION...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-green-500 font-mono">
        <p className="tracking-widest">DECRYPTING ENTITY DATA...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-red-500 font-mono p-8 text-center flex flex-col items-center justify-center">
        <FaExclamationTriangle className="h-16 w-16 mb-4 opacity-50" />
        <h1 className="text-2xl uppercase tracking-widest">ERR: ENTITY NOT FOUND</h1>
        <Link href="/admin" className="mt-8 text-green-500 hover:text-green-400 underline">RETURN TO ROOT TERMINAL</Link>
      </div>
    );
  }

  const isBanned = user.banExpires && new Date(user.banExpires) > new Date();

  return (
    <>
      {showBanModal && (
        <BanModal 
          user={user} 
          onCancel={() => setShowBanModal(false)} 
          onConfirm={handleBan} 
        />
      )}
      
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/admin" className="border border-green-900 p-2 hover:bg-green-900 hover:text-white transition-colors">
              <FaArrowLeft />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tighter text-green-400">ENTITY INSPECTOR</h1>
              <p className="text-green-700 text-xs tracking-widest">TARGET_ID: {user.id}</p>
            </div>
          </div>

          {/* Global Alerts */}
          {error && <div className="bg-red-900/20 border border-red-900 text-red-400 p-4 mb-6 text-sm uppercase flex items-center gap-2"><FaExclamationTriangle className="shrink-0" /> ERR: {error}</div>}
          {success && <div className="bg-green-900/20 border border-green-500 text-green-400 p-4 mb-6 text-sm uppercase flex items-center gap-2"><FaCheckCircle className="shrink-0" /> SYS: {success}</div>}
          {isBanned && (
            <div className="bg-red-950/50 border-l-4 border-red-600 text-red-500 p-4 mb-6 animate-pulse">
              <h3 className="font-bold uppercase tracking-widest mb-1 flex items-center gap-2"><FaLock /> ACTIVE SANCTION IN EFFECT</h3>
              <p className="text-xs text-red-400">EXPIRES: {new Date(user.banExpires).toLocaleString()}</p>
              <p className="text-xs text-red-400 mt-1">REASON: {user.banReason}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Avatar & Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-900 border border-green-900 p-6 relative overflow-hidden flex flex-col items-center shadow-[0_0_15px_rgba(0,255,0,0.05)]">
                 <div className="absolute top-0 w-full h-1 bg-green-500/20"></div>
                 <div className="w-32 h-32 border-2 border-green-800 bg-black overflow-hidden relative mb-4">
                   {user.avatarUrl ? (
                     <Image src={user.avatarUrl} alt={user.username} layout="fill" objectFit="cover" unoptimized={true} className="mix-blend-luminosity" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center">
                        <FaUserCircle className="text-green-900 h-20 w-20" />
                     </div>
                   )}
                   <div className="absolute top-0 left-0 w-full h-[2px] bg-green-500/50 animate-[scan_3s_linear_infinite]"></div>
                 </div>
                 
                 <h2 className="text-xl font-bold text-green-400 mb-1">{user.username}</h2>
                 <Badges user={user} />
              </div>

              {/* Advanced Actions Module */}
              <div className="bg-gray-900 border border-red-900/50 p-6 relative">
                 <h3 className="text-red-600 text-xs tracking-widest uppercase mb-4 border-b border-red-900/50 pb-2">CRITICAL ACTIONS</h3>
                 
                 {isBanned ? (
                    <button 
                      onClick={handleUnban}
                      disabled={isTargetSuperAdmin || isSelf}
                      className="w-full bg-green-900/20 border border-green-700 text-green-500 p-3 hover:bg-green-800 hover:text-black uppercase tracking-widest text-sm font-bold transition-all disabled:opacity-20"
                    >
                      REVOKE BAN (PARDON)
                    </button>
                 ) : (
                    <button 
                      onClick={() => setShowBanModal(true)}
                      disabled={isTargetSuperAdmin || isSelf || user.isDeactivated}
                      className="w-full bg-red-950/40 border border-red-800 text-red-500 p-3 hover:bg-red-800 hover:text-black uppercase tracking-widest text-sm font-bold transition-all disabled:opacity-20 flex items-center justify-center gap-2"
                    >
                      <FaBan /> INITIATE BAN
                    </button>
                 )}
                 {(isTargetSuperAdmin || isSelf) && <p className="text-[10px] text-red-800 text-center mt-2 uppercase">LOCKED_TARGET</p>}
              </div>
            </div>

            {/* Right Column: Deep Data Editor */}
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-gray-900 border border-green-900 p-6 shadow-[0_0_15px_rgba(0,255,0,0.05)]">
                 <h3 className="text-green-500 text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
                   <span className="w-2 h-2 bg-green-500 inline-block"></span> BASE PARAMETER OVERRIDES
                 </h3>

                 <div className="space-y-4">
                    <div>
                      <label className="block text-green-700 text-xs tracking-widest mb-1">DESIGNATION (USERNAME)</label>
                      <input 
                        type="text" 
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        disabled={isTargetSuperAdmin && !isSelf}
                        className="w-full bg-black border border-green-900 text-green-400 p-3 focus:border-green-500 outline-none font-mono disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-green-700 text-xs tracking-widest mb-1">COM-LINK (EMAIL)</label>
                      <input 
                        type="email" 
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        disabled={isTargetSuperAdmin && !isSelf}
                        className="w-full bg-black border border-green-900 text-green-400 p-3 focus:border-green-500 outline-none font-mono disabled:opacity-50"
                      />
                    </div>
                 </div>

                 <h3 className="text-green-500 text-sm tracking-widest uppercase mt-8 mb-4 border-b border-green-900/50 pb-2">ACCESS CLEARANCE LEVELS</h3>
                 <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                         <input
                           type="checkbox"
                           className="peer sr-only"
                           checked={editRoles.includes('ADMIN')}
                           onChange={() => toggleRole('ADMIN')}
                           disabled={isTargetSuperAdmin || isSelf} // Prevent removing own admin
                         />
                         <div className={`w-5 h-5 border border-green-800 bg-black peer-checked:bg-yellow-600 peer-checked:border-yellow-400 transition-all ${isTargetSuperAdmin || isSelf ? 'opacity-30' : ''}`}></div>
                      </div>
                      <span className={`tracking-widest uppercase text-sm ${editRoles.includes('ADMIN') ? 'text-yellow-500 font-bold' : 'text-green-700'}`}>SYS-OP (ADMIN)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                         <input
                           type="checkbox"
                           className="peer sr-only"
                           checked={editRoles.includes('VERIFIED')}
                           onChange={() => toggleRole('VERIFIED')}
                           disabled={isTargetSuperAdmin}
                         />
                         <div className={`w-5 h-5 border border-green-800 bg-black peer-checked:bg-blue-600 peer-checked:border-blue-400 transition-all ${isTargetSuperAdmin ? 'opacity-30' : ''}`}></div>
                      </div>
                      <span className={`tracking-widest uppercase text-sm ${editRoles.includes('VERIFIED') ? 'text-blue-500 font-bold' : 'text-green-700'}`}>TRUST-L1 (VERIFIED)</span>
                    </label>
                 </div>

                 <div className="mt-8 pt-6 border-t border-green-900/50 flex justify-end">
                    <button 
                      onClick={handleUpdateInfo}
                      disabled={isSaving || (isTargetSuperAdmin && !isSelf)}
                      className="bg-green-900/30 border border-green-600 text-green-400 px-8 py-3 hover:bg-green-700 hover:text-black uppercase tracking-widest font-bold transition-all disabled:opacity-30 flex items-center gap-2"
                    >
                      {isSaving ? 'UPLOADING...' : <><FaSave /> OVERWRITE DATA</>}
                    </button>
                 </div>
               </div>

               {/* Meta Info Readonly */}
               <div className="bg-gray-900/50 border border-green-900/30 p-4 text-xs tracking-widest text-green-800 uppercase flex flex-col gap-2">
                  <p>SYS_CREATION_SYNC: {new Date(user.createdAt).toISOString()}</p>
                  <p>DEACTIVATION_STATE: {user.isDeactivated ? 'TRUE [TERMINATED]' : 'FALSE [NOMINAL]'}</p>
                  <p>FAVORITE_MEDIA_COUNT: {user.favoriteMovieIds?.length + user.favoriteSeriesIds?.length || 0}</p>
               </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
