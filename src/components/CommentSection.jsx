'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaUserCircle, FaTrash } from 'react-icons/fa';
import Image from 'next/image';

// Sub-component for a single comment
function CommentItem({ comment, user, onDelete }) {
  const isOwner = user?.id === comment.userId;
  const username = comment.user.username || comment.user.name;

  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold overflow-hidden relative">
        {comment.user.avatarUrl ? (
          <Image src={comment.user.avatarUrl} alt={username} layout="fill" objectFit="cover" unoptimized={true} />
        ) : (
          <FaUserCircle size={24} />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <span className="font-bold text-foreground">{username}</span>
          <span className="text-xs text-foreground/70">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-foreground/90 mt-1 whitespace-pre-wrap">{comment.text}</p>
        {isOwner && (
          <button
            onClick={() => onDelete(comment.id)}
            className="text-xs text-red-500 hover:underline mt-1 flex items-center gap-1"
          >
            <FaTrash /> Delete
          </button>
        )}
      </div>
    </div>
  );
}

// Sub-component for the new comment form
function CommentForm({ tmdbId, mediaType, onCommentPosted }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdbId, mediaType, text }),
      });
      if (!res.ok) throw new Error('Failed to post comment');
      const newComment = await res.json();
      onCommentPosted(newComment); // Add to list instantly
      setText(''); // Clear textarea
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <p className="text-foreground/70">You must be logged in to comment.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold overflow-hidden relative">
        {user.avatarUrl ? (
          <Image src={user.avatarUrl} alt={user.username || user.name} layout="fill" objectFit="cover" unoptimized={true} />
        ) : (
          <FaUserCircle size={24} />
        )}
      </div>
      <div className="flex-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="w-full bg-secondary p-3 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
          rows="3"
        />
        <div className="flex justify-end items-center mt-2">
          {error && <p className="text-red-500 text-sm mr-4">{error}</p>}
          <button type="submit" disabled={loading} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-80 disabled:bg-opacity-50 transition-colors">
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  );
}

// Main Component
export default function CommentSection({ tmdbId, mediaType }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all comments on load
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/comments?tmdbId=${tmdbId}&mediaType=${mediaType}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [tmdbId, mediaType]);

  // Add new comment to the top of the list
  const handleCommentPosted = (newComment) => {
    setComments([newComment, ...comments]);
  };

  // Remove deleted comment from the list
  const handleCommentDeleted = async (commentId) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete comment');
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-foreground mb-6">Comments ({comments.length})</h2>
      <div className="bg-surface p-6 rounded-lg">
        <CommentForm tmdbId={tmdbId} mediaType={mediaType} onCommentPosted={handleCommentPosted} />
        <div className="mt-8 space-y-6">
          {loading ? (
            <p>Loading comments...</p>
          ) : comments.length > 0 ? (
            comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} user={user} onDelete={handleCommentDeleted} />
            ))
          ) : (
            <p className="text-foreground/70 text-center py-4">Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
}