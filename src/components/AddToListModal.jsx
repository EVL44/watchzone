'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';

export default function AddToListModal({ item, itemType, onClose, onListUpdate }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/playlists');
        if (res.ok) {
          const data = await res.json();
          setPlaylists(data);
        }
      } catch (error) {
        console.error("Failed to fetch playlists:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, []);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlaylistName }),
      });
      if (!res.ok) throw new Error('Failed to create playlist');
      const newPlaylist = await res.json();
      setPlaylists([...playlists, newPlaylist]);
      setShowNewForm(false);
      setNewPlaylistName('');
      setMessage(`Created playlist "${newPlaylist.name}"`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
       setMessage(`Error: ${error.message}`);
    }
  };

  const handleAddItemToList = async (playlistId) => {
    try {
      const res = await fetch('/api/playlists/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId, item, itemType }),
      });
      if (!res.ok) throw new Error('Failed to add item to playlist');
      
      const selectedPlaylist = playlists.find(p => p.id === playlistId);
      setMessage(`Added to ${selectedPlaylist.name}!`);
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1500);

      if (onListUpdate) onListUpdate();

    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-surface rounded-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-foreground/70 hover:text-primary"><FaTimes /></button>
        <h2 className="text-2xl font-bold mb-4">Add to a list</h2>
        {message && <p className="text-center text-primary mb-4">{message}</p>}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {loading ? <p>Loading lists...</p> : playlists.map(list => (
            <button key={list.id} onClick={() => handleAddItemToList(list.id)} className="w-full text-left bg-secondary p-3 rounded-md hover:bg-primary hover:text-white transition-colors">
              {list.name}
            </button>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-secondary">
          {showNewForm ? (
            <form onSubmit={handleCreatePlaylist} className="space-y-3">
              <input 
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="New playlist name..."
                className="w-full bg-secondary p-3 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-80">Create and Add</button>
                <button type="button" onClick={() => setShowNewForm(false)} className="flex-1 bg-secondary px-4 py-2 rounded-md hover:bg-opacity-80">Cancel</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowNewForm(true)} className="w-full flex items-center justify-center gap-2 bg-secondary p-3 rounded-md hover:bg-opacity-80 transition-colors">
              <FaPlus /> Create new list
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
