'use client';

import { FaTimes, FaUserCircle } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

export default function UserListModal({ isOpen, title, users, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="relative w-full max-w-sm bg-surface rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-secondary">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-foreground/70 hover:text-primary transition-colors">
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {users.length > 0 ? (
            <ul className="space-y-4">
              {users.map(user => (
                <li key={user.id}>
                  <Link href={`/user/${user.username}`} onClick={onClose} className="flex items-center gap-4 p-2 rounded-md hover:bg-secondary">
                    <div className="w-12 h-12 rounded-full bg-primary flex-shrink-0 overflow-hidden relative">
                      {user.avatarUrl ? (
                        <Image src={user.avatarUrl} alt={user.username} layout="fill" objectFit="cover" unoptimized={true} />
                      ) : (
                        <FaUserCircle className="w-full h-full text-white" />
                      )}
                    </div>
                    <span className="font-semibold">{user.username}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-foreground/70 py-4">No users to show.</p>
          )}
        </div>
      </div>
    </div>
  );
}
