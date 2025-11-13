import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import UserProfileClient from '@/components/UserProfileClient';
import { notFound } from 'next/navigation';

async function getUserProfile(username, currentUserId) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      favoriteMovies: { select: { id: true, tmdbId: true, title: true, posterPath: true } },
      watchlistMovies: { select: { id: true, tmdbId: true, title: true, posterPath: true } },
      favoriteSeries: { select: { id: true, tmdbId: true, name: true, posterPath: true } },
      watchlistSeries: { select: { id: true, tmdbId: true, name: true, posterPath: true } },
      playlists: {
        select: {
          id: true, name: true, description: true,
          movies: { take: 4, select: { posterPath: true, id: true } },
          series: { take: 4, select: { posterPath: true, id: true } },
          _count: { select: { movies: true, series: true } }
        }
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

  if (!userProfile.isCurrentUser) {
    delete userProfile.email;
  }

  return userProfile;
}

export default async function UserProfilePage({ params }) {
  // FIX: Access 'username' from params at the very top
  const { username } = params;

  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  let currentUserId = null;
  if (token) {
    try {
      const decoded = await verifyToken(token);
      currentUserId = decoded.id;
    } catch (e) { /* Invalid token */ }
  }

  // FIX: Use the 'username' variable here
  const profile = await getUserProfile(username, currentUserId);

  if (!profile) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <UserProfileClient profile={profile} />
    </div>
  );
}