'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaMagnet } from 'react-icons/fa';

export default function DownloadModal({ imdbId, title, year, onClose }) {
  const [torrents, setTorrents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTorrents = async () => {
      if (!imdbId && !title) {
        setError("No identifiers provided.");
        setLoading(false);
        return;
      }

      try {
        // Pass ID, Title and Year to allow the API to fallback intelligently
        const queryParams = new URLSearchParams({
            imdbId: imdbId || '',
            title: title || '',
            year: year || ''
        });

        const res = await fetch(`/api/torrents?${queryParams}`);
        
        if (!res.ok) throw new Error('Failed to fetch torrent data');

        const data = await res.json();

        if (data.status === 'ok' && data.data.movie_count > 0) {
          // YTS returns a list, we take the first/best match
          const movie = data.data.movies[0];
          let movieTorrents = movie.torrents || [];
          
          // Sort by seeds (descending) to show best options first
          movieTorrents.sort((a, b) => b.seeds - a.seeds);
          
          setTorrents(movieTorrents);
        } else {
          setError("No download links found for this title.");
        }
      } catch (err) {
        console.error("Error in DownloadModal:", err);
        setError("Failed to load download links. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTorrents();
  }, [imdbId, title, year]);

  const getMagnetLink = (hash, movieTitle) => {
    return `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(movieTitle)}&tr=udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.leechers-paradise.org:6969`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface rounded-lg w-full max-w-lg p-6 relative shadow-2xl border border-secondary" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-foreground/70 hover:text-primary transition-colors"
        >
          <FaTimes size={20} />
        </button>
        
        <h2 className="text-2xl font-bold mb-2 text-foreground flex items-center gap-2">
          <FaDownload className="text-primary" />
          Download: {title}
        </h2>
        <p className="text-sm text-foreground/60 mb-6">Select a quality to open in your torrent client.</p>

        {loading && (
            <div className="text-center py-8 text-foreground/70 flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span>Searching for links...</span>
            </div>
        )}
        
        {error && (
          <div className="text-center py-8">
            <p className="text-red-500 mb-2">{error}</p>
            <p className="text-xs text-foreground/50">Downloads might not be available for less popular or very new titles.</p>
          </div>
        )}

        {!loading && !error && torrents.length > 0 && (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {torrents.map((torrent, index) => (
              <div key={index} className="flex items-center justify-between bg-secondary p-4 rounded-lg hover:bg-secondary/80 transition-colors group">
                <div className="flex flex-col">
                  <span className="font-bold text-foreground text-lg">{torrent.quality}</span>
                  <div className="flex gap-2 text-xs text-foreground/60 uppercase items-center">
                    <span className="bg-surface/50 px-1 rounded">{torrent.type}</span>
                    <span>•</span>
                    <span>{torrent.size}</span>
                    {torrent.seeds !== undefined && (
                        <>
                            <span>•</span>
                            <span className="text-green-500 font-bold">{torrent.seeds} seeds</span>
                        </>
                    )}
                  </div>
                </div>
                
                <a 
                  href={getMagnetLink(torrent.hash, title)}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md font-semibold hover:bg-opacity-80 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaMagnet />
                  <span>Get Link</span>
                </a>
              </div>
            ))}
          </div>
        )}
        
        {!loading && !error && torrents.length === 0 && (
           <div className="text-center py-8 text-foreground/70">No torrents found for this movie.</div>
        )}

        <div className="mt-6 pt-4 border-t border-secondary text-center">
            <p className="text-xs text-foreground/40">
                Warning: Downloading copyrighted material may be illegal in your country. Use at your own risk.
            </p>
        </div>
      </div>
    </div>
  );
}