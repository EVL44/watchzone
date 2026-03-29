// src/app/user/[username]/page.jsx

import { getAuthSession } from "@/lib/session";
import prisma from '@/lib/prisma';
import UserProfileClient from '@/components/UserProfileClient';
import { notFound } from 'next/navigation';

async function getUserProfile(username, currentUserId) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      favoriteMovies: { select: { id: true, tmdbId: true, title: true, posterPath: true } },
      watchlistMovies: { select: { id: true, tmdbId: true, title: true, posterPath: true } },
      watchedMovies: { select: { id: true, tmdbId: true, title: true, posterPath: true } },
      favoriteSeries: { select: { id: true, tmdbId: true, name: true, posterPath: true } },
      watchlistSeries: { select: { id: true, tmdbId: true, name: true, posterPath: true } },
      watchedSeries: { select: { id: true, tmdbId: true, name: true, posterPath: true } },
      playlists: {
        select: {
          id: true, name: true, description: true,
          movies: { take: 4, select: { posterPath: true, id: true } },
          series: { take: 4, select: { posterPath: true, id: true } },
          _count: { select: { movies: true, series: true } }
        }
      },
      ratings: {
        orderBy: { updatedAt: 'desc' },
        take: 20,
      },
      followers: { select: { follower: { select: { id: true, username: true, avatarUrl: true } } } },
      following: { select: { following: { select: { id: true, username: true, avatarUrl: true } } } },
    },
  });

  if (!user) {
    return null;
  }

  const { password, ...userProfile } = user;
  userProfile.followers = user.followers.map(f => f.follower);
  userProfile.following = user.following.map(f => f.following);
  userProfile.isFollowing = user.followers.some(f => f.follower.id === currentUserId);
  
  userProfile.isCurrentUser = user.id === currentUserId;

  // Compute stats
  const totalRatings = await prisma.rating.count({ where: { userId: user.id } });
  userProfile.stats = {
    moviesWatched: user.watchedMovies.length,
    seriesWatched: user.watchedSeries.length,
    totalRatings,
    playlists: user.playlists.length,
    followers: userProfile.followers.length,
    following: userProfile.following.length,
  };

  if (!userProfile.isCurrentUser) {
    delete userProfile.email;
  }

  return userProfile;
}

export default async function UserProfilePage({ params }) {
  const { username } = params;

  const session = await getAuthSession();
  const currentUserId = session?.user?.id || null;

  const profile = await getUserProfile(username, currentUserId);

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <UserProfileClient profile={profile} />
    </div>
  );
}