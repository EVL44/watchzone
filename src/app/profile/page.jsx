'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaLock, FaEnvelope, FaCamera, FaFilm, FaBookmark } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading: authLoading, setUser } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('profile');
  const [userLists, setUserLists] = useState({ favorites: [], watchlist: [] });
  const [listLoading, setListLoading] = useState(true);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchLists = async () => {
      if (user) {
        setListLoading(true);
        try {
          const res = await fetch('/api/user/lists');
          if (res.ok) {
            const data = await res.json();
            setUserLists(data);
          }
        } catch (error) {
          console.error("Failed to fetch user lists", error);
        } finally {
          setListLoading(false);
        }
      }
    };
    fetchLists();
  }, [user]);

  const handleAvatarUpload = async () => {
    if (!avatarFile) return null;
    setIsUploading(true);

    const getSignature = async () => {
      try {
        const response = await fetch('/api/cloudinary/sign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paramsToSign: { timestamp: Math.round((new Date).getTime() / 1000) }})
        });
        if (!response.ok) throw new Error('Failed to get signature');
        const { signature } = await response.json();
        return signature;
      } catch (error) {
        console.error(error);
        return null;
      }
    };
    
    const signature = await getSignature();
    if (!signature) {
        setMessage({ type: 'error', text: 'Could not get upload signature.' });
        setIsUploading(false);
        return null;
    }
    
    const formData = new FormData();
    formData.append('file', avatarFile);
    formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
    formData.append('timestamp', Math.round((new Date().getTime() / 1000)).toString());
    formData.append('signature', signature);
    
    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    try {
        const response = await fetch(uploadUrl, { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: 'Image upload failed.' });
        return null;
    } finally {
        setIsUploading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setIsUploading(true);

    let newAvatarUrl = user.avatarUrl;
    if (avatarFile) {
        newAvatarUrl = await handleAvatarUpload();
        if (!newAvatarUrl) { // Stop if upload failed
            setIsUploading(false);
            return;
        }
    }

    try {
        const res = await fetch('/api/user/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, avatarUrl: newAvatarUrl }),
        });

        const data = await res.json();
        if (res.ok) {
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setUser(data); // Update the user in the global context
            setPassword('');
            setAvatarFile(null);
        } else {
            setMessage({ type: 'error', text: data.message || 'Failed to update profile.' });
        }
    } catch (error) {
        setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
        setIsUploading(false);
    }
  };
  
  if (authLoading || !user) {
    return <div className="flex justify-center items-center h-screen text-white">Loading...</div>;
  }

  const getAvatarInitial = () => user?.username?.charAt(0).toUpperCase() || '';

  const MovieListComponent = ({ title, movies }) => (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      {listLoading ? <p>Loading lists...</p> : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.map(movie => (
            <Link href={`/movie/${movie.tmdbId || movie.id}`} key={movie.id}>
               <div className="relative aspect-[2/3] rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                <Image src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} alt={movie.title} layout="fill" objectFit="cover" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No movies in this list yet.</p>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-1/4 flex-shrink-0">
          <div className="bg-stone-800 p-6 rounded-lg text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-4xl font-bold overflow-hidden">
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt="User Avatar" layout="fill" objectFit="cover" />
                ) : (
                  getAvatarInitial()
                )}
              </div>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-stone-700 p-2 rounded-full cursor-pointer hover:bg-stone-600 transition-colors">
                <FaCamera />
                <input id="avatar-upload" type="file" className="hidden" onChange={(e) => setAvatarFile(e.target.files[0])} accept="image/*" />
              </label>
            </div>
            <h1 className="text-2xl font-bold truncate">{user.username}</h1>
            <p className="text-gray-400 truncate">{user.email}</p>
             {avatarFile && <p className="text-xs text-green-400 mt-2">New avatar selected!</p>}
          </div>
          <nav className="bg-stone-800 p-4 rounded-lg mt-4">
            <ul className="space-y-2">
              <li><button onClick={() => setActiveTab('profile')} className={`w-full text-left p-3 rounded-md transition-colors ${activeTab === 'profile' ? 'bg-primary' : 'hover:bg-stone-700'}`}>Edit Profile</button></li>
              <li><button onClick={() => setActiveTab('favorites')} className={`w-full text-left p-3 rounded-md transition-colors ${activeTab === 'favorites' ? 'bg-primary' : 'hover:bg-stone-700'}`}>Favorites</button></li>
              <li><button onClick={() => setActiveTab('watchlist')} className={`w-full text-left p-3 rounded-md transition-colors ${activeTab === 'watchlist' ? 'bg-primary' : 'hover:bg-stone-700'}`}>Watchlist</button></li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1">
          <div className="bg-stone-800 p-6 rounded-lg">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div>
                    <label className="block mb-2 font-medium">Username</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-stone-700 p-3 rounded-md border border-stone-600 focus:ring-2 focus:ring-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-stone-700 p-3 rounded-md border border-stone-600 focus:ring-2 focus:ring-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">New Password</label>
                    <input type="password" placeholder="Leave blank to keep current password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-stone-700 p-3 rounded-md border border-stone-600 focus:ring-2 focus:ring-primary focus:outline-none" />
                  </div>
                  <button type="submit" disabled={isUploading} className="bg-primary px-6 py-3 rounded-md hover:bg-opacity-80 disabled:bg-opacity-50 transition-colors">
                    {isUploading ? 'Saving...' : 'Save Changes'}
                  </button>
                  {message.text && <p className={`mt-4 text-sm ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>{message.text}</p>}
                </form>
              </div>
            )}
            {activeTab === 'favorites' && <MovieListComponent title="My Favorites" movies={userLists.favorites} />}
            {activeTab === 'watchlist' && <MovieListComponent title="My Watchlist" movies={userLists.watchlist} />}
          </div>
        </main>
      </div>
    </div>
  );
}