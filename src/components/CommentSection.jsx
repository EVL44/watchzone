'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaUserCircle, FaTrash, FaHeart, FaReply } from 'react-icons/fa';
import Image from 'next/image';
import Badges from '@/components/Badges'; // No change needed here
import Link from 'next/link';

/**
 * Builds a nested comment tree from a flat list of comments.
 */
const buildCommentTree = (flatComments) => {
  const commentMap = {};
  flatComments.forEach(comment => {
    commentMap[comment.id] = { ...comment, replies: [] };
  });

  const tree = [];
  flatComments.forEach(comment => {
    if (comment.parentId) {
      commentMap[comment.parentId]?.replies.push(commentMap[comment.id]);
    } else {
      tree.push(commentMap[comment.id]);
    }
  });

  tree.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  Object.values(commentMap).forEach(comment => {
    comment.replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  });
  
  return tree;
};

/**
 * Renders the form for posting a new comment or a reply.
 */
function CommentForm({ tmdbId, mediaType, onCommentPosted, parentId = null, onCancel = null }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return <p className="text-foreground/70">You must be logged in to comment.</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdbId, mediaType, text, parentId }),
      });
      if (!res.ok) throw new Error('Failed to post comment');
      
      onCommentPosted(); 
      setText('');
      if (onCancel) onCancel();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          placeholder={parentId ? "Write a reply..." : "Add a comment..."}
          className="w-full bg-secondary p-3 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
          rows="3"
        />
        <div className="flex justify-end items-center mt-2 gap-2">
          {error && <p className="text-red-500 text-sm mr-auto">{error}</p>}
          {onCancel && (
            <button type="button" onClick={onCancel} className="bg-secondary text-foreground px-4 py-2 rounded-md hover:bg-opacity-80">
              Cancel
            </button>
          )}
          <button type="submit" disabled={loading} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-80 disabled:bg-opacity-50 transition-colors">
            {loading ? 'Posting...' : (parentId ? 'Reply' : 'Post')}
          </button>
        </div>
      </div>
    </form>
  );
}

/**
 * Renders a single comment and its replies recursively.
 */
function CommentItem({ comment, user, onDelete, onLike, onReplyPosted }) {
  const [isReplying, setIsReplying] = useState(false);
  const isOwner = user?.id === comment.user.id;
  const username = comment.user.username || comment.user.name;

  const hasLiked = user && comment.likedByIds.includes(user.id);
  const likeCount = comment.likedByIds.length;

  const formattedDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex gap-4">
      {/* Avatar */}
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold overflow-hidden relative">
        <Link href={`/user/${username}`}>
          {comment.user.avatarUrl ? (
            <Image src={comment.user.avatarUrl} alt={username} layout="fill" objectFit="cover" unoptimized={true} />
          ) : (
            <FaUserCircle size={24} />
          )}
        </Link>   
      </div>

      {/* Comment Body */}
      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-1.5">
            <Link href={`/user/${username}`}> <span className="font-bold text-foreground">{username}</span> </Link>
            {/* The user object from the comment now contains roles/isSuperAdmin */}
            <Badges user={comment.user} />
          </div>
          <span className="text-xs text-foreground/70">
            {formattedDate}
          </span>
        </div>
        <p className="text-foreground/90 mt-1 whitespace-pre-wrap">{comment.text}</p>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-2">
          {user && (
            <>
              <button 
                onClick={() => onLike(comment.id)} 
                className={`flex items-center gap-1.5 text-xs font-medium ${hasLiked ? 'text-primary' : 'text-foreground/70 hover:text-primary'}`}
              >
                <FaHeart />
                <span>{likeCount > 0 ? likeCount : ''}</span>
              </button>
              <button 
                onClick={() => setIsReplying(!isReplying)} 
                className="flex items-center gap-1.5 text-xs font-medium text-foreground/70 hover:text-primary"
              >
                <FaReply />
                <span>Reply</span>
              </button>
            </>
          )}
          {isOwner && ( 
            <button
              onClick={() => onDelete(comment.id)}
              className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:underline"
            >
              <FaTrash />
              <span>Delete</span>
            </button>
          )}
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div className="mt-4">
            <CommentForm
              tmdbId={comment.tmdbId}
              mediaType={comment.mediaType}
              parentId={comment.id}
              onCommentPosted={() => {
                setIsReplying(false);
                onReplyPosted();
              }}
              onCancel={() => setIsReplying(false)}
            />
          </div>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 pl-6 border-l-2 border-secondary space-y-6">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                user={user}
                onDelete={onDelete}
                onLike={onLike}
                onReplyPosted={onReplyPosted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Main Comment Section Component
 */
export default function CommentSection({ tmdbId, mediaType }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]); // Will hold the nested tree
  const [totalComments, setTotalComments] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comments?tmdbId=${tmdbId}&mediaType=${mediaType}`);
      if (res.ok) {
        let data = await res.json();
        setTotalComments(data.length);
        const nestedComments = buildCommentTree(data);
        setComments(nestedComments);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  }, [tmdbId, mediaType]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);
  
  // Re-fetch comments if the user logs in or out
  useEffect(() => {
     fetchComments();
  }, [user, fetchComments]);

  const handleCommentUpdate = () => {
    fetchComments(); 
  };

  const handleLikeToggle = async (commentId) => {
    if (!user) return; 
    
    try {
      const res = await fetch('/api/comments/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      });
      if (!res.ok) throw new Error('Failed to update like');
      fetchComments(); 
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentDeleted = async (commentId) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete comment');
      fetchComments(); 
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-foreground mb-6">Comments ({totalComments})</h2>
      <div className="bg-surface p-6 rounded-lg">
        <CommentForm 
          tmdbId={tmdbId} 
          mediaType={mediaType} 
          onCommentPosted={handleCommentUpdate} 
        />
        
        <div className="mt-8 space-y-6">
          {loading ? (
            <p className="text-foreground/70 text-center py-4">Loading comments...</p>
          ) : comments.length > 0 ? (
            comments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                user={user}
                onDelete={handleCommentDeleted}
                onLike={handleLikeToggle}
                onReplyPosted={handleCommentUpdate}
              />
            ))
          ) : (
            <p className="text-foreground/70 text-center py-4">Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
}