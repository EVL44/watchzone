'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

export default function StarRating({ tmdbId, mediaType, initialUserRating, initialAverage, initialTotal }) {
  const { user } = useAuth();
  const router = useRouter();

  const [userScore, setUserScore] = useState(initialUserRating?.score || 0);
  const [hoverScore, setHoverScore] = useState(0);
  const [averageScore, setAverageScore] = useState(initialAverage || 0);
  const [totalRatings, setTotalRatings] = useState(initialTotal || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const getScoreFromEvent = useCallback((e, starIndex) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    return isLeftHalf ? starIndex + 0.5 : starIndex + 1;
  }, []);

  const handleClick = async (score) => {
    if (!user) return router.push('/login');
    if (isSubmitting) return;

    // If clicking same score, remove rating
    const isRemovingRating = score === userScore;
    const newScore = isRemovingRating ? 0 : score;

    const prevScore = userScore;
    const prevAverage = averageScore;
    const prevTotal = totalRatings;
    setUserScore(newScore);

    setIsSubmitting(true);
    try {
      if (isRemovingRating) {
        const res = await fetch('/api/ratings', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tmdbId, mediaType }),
        });
        if (!res.ok) throw new Error('Failed to delete rating');
        // Update community stats
        if (prevTotal > 1) {
          setAverageScore(Math.round(((prevAverage * prevTotal) - prevScore) / (prevTotal - 1) * 10) / 10);
        } else {
          setAverageScore(0);
        }
        setTotalRatings(prev => Math.max(0, prev - 1));
      } else {
        const res = await fetch('/api/ratings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tmdbId, mediaType, score: newScore }),
        });
        if (!res.ok) throw new Error('Failed to save rating');
        // Update community stats optimistically
        if (prevScore > 0) {
          // Updating existing rating
          setAverageScore(Math.round(((prevAverage * prevTotal) - prevScore + newScore) / prevTotal * 10) / 10);
        } else {
          // New rating
          setAverageScore(Math.round(((prevAverage * prevTotal) + newScore) / (prevTotal + 1) * 10) / 10);
          setTotalRatings(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error(err);
      setUserScore(prevScore);
      setAverageScore(prevAverage);
      setTotalRatings(prevTotal);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayScore = hoverScore || userScore;
  const scoreLabel = hoverScore > 0 ? hoverScore.toFixed(1) : userScore > 0 ? `Your rating: ${userScore.toFixed(1)}` : 'Rate this';

  const renderStar = (index) => {
    const filled = displayScore >= index + 1;
    const halfFilled = displayScore >= index + 0.5 && displayScore < index + 1;

    return (
      <button
        key={index}
        className={`text-xl transition-all duration-150 cursor-pointer ${
          filled || halfFilled ? 'text-yellow-400' : 'text-gray-500'
        } hover:scale-125 disabled:cursor-wait`}
        onMouseMove={(e) => setHoverScore(getScoreFromEvent(e, index))}
        onMouseLeave={() => setHoverScore(0)}
        onClick={(e) => handleClick(getScoreFromEvent(e, index))}
        disabled={isSubmitting}
        type="button"
        aria-label={`Rate ${index + 1} stars`}
      >
        {filled ? <FaStar /> : halfFilled ? <FaStarHalfAlt /> : <FaRegStar />}
      </button>
    );
  };

  return (
    <div className="mt-4">
      <div 
        className="relative inline-block"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="flex items-center gap-0.5">
          {[0, 1, 2, 3, 4].map(renderStar)}
        </div>
        
        {/* Tooltip showing score */}
        {showTooltip && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
            {scoreLabel}
          </div>
        )}
      </div>

      {/* Community stats */}
      <div className="flex items-center gap-3 mt-1.5 text-sm text-foreground/60">
        {totalRatings > 0 && (
          <>
            <span className="flex items-center gap-1">
              <FaStar className="text-yellow-400 text-xs" />
              <span className="font-semibold text-foreground/80">{averageScore.toFixed(1)}</span>
            </span>
            <span>·</span>
            <span>{totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}</span>
          </>
        )}
        {userScore > 0 && (
          <>
            {totalRatings > 0 && <span>·</span>}
            <span className="text-primary font-medium">You: {userScore.toFixed(1)} ★</span>
          </>
        )}
      </div>
    </div>
  );
}
