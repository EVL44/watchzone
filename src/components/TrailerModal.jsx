'use client';

import { FaTimes } from 'react-icons/fa';

export default function TrailerModal({ trailerKey, onClose }) {
  if (!trailerKey) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="relative w-full max-w-3xl aspect-video bg-black">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white text-3xl z-10 hover:text-primary transition-colors"
        >
          <FaTimes />
        </button>
        <iframe
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
    </div>
  );
}