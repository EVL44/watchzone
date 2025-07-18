import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    
    const decoded = await verifyToken(token);
    const userId = decoded.id;
    const body = await request.json();

    // --- Logic for Profile Info & Avatar Updates ---
    if (body.username || body.email || body.password || body.avatarUrl) {
      const { username, email, password, avatarUrl } = body;
      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (avatarUrl) updateData.avatarUrl = avatarUrl;
      if (password) {
        if (password.length < 6) return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
        updateData.password = await bcrypt.hash(password, 10);
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: { favoriteMovies: true, watchlistMovies: true, favoriteSeries: true, watchlistSeries: true }
      });
      const { password: _, ...userToReturn } = user;
      return NextResponse.json(userToReturn);
    }
    
    // --- Logic for List Management ---
    const { itemId, itemType, listType, action } = body;
    if (itemId && itemType && listType && action) {
        const numericItemId = parseInt(itemId, 10);
        const modelName = itemType === 'movie' ? 'movie' : 'series';
        const fieldToUpdate = {
          movie: { favorites: 'favoriteMovieIds', watchlist: 'watchlistMovieIds' },
          series: { favorites: 'favoriteSeriesIds', watchlist: 'watchlistSeriesIds' },
        }[itemType][listType];

        const tmdbToken = process.env.TMDB_API_TOKEN;
        const tmdbRes = await fetch(`https://api.themoviedb.org/3/${itemType === 'series' ? 'tv' : 'movie'}/${numericItemId}`, { headers: { Authorization: `Bearer ${tmdbToken}` } });
        if (!tmdbRes.ok) throw new Error('Could not fetch item details from TMDB');
        const tmdbData = await tmdbRes.json();
        
        const createPayload = itemType === 'movie'
            ? { tmdbId: numericItemId, title: tmdbData.title, posterPath: tmdbData.poster_path, releaseDate: tmdbData.release_date }
            : { tmdbId: numericItemId, name: tmdbData.name, posterPath: tmdbData.poster_path, firstAirDate: tmdbData.first_air_date };
        
        const mediaItem = await prisma[modelName].upsert({
          where: { tmdbId: numericItemId },
          update: createPayload,
          create: createPayload,
        });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        const currentList = user[fieldToUpdate] || [];
        const newList = action === 'add' ? [...currentList, mediaItem.id] : currentList.filter(id => id !== mediaItem.id);

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { [fieldToUpdate]: newList },
          include: { favoriteMovies: true, watchlistMovies: true, favoriteSeries: true, watchlistSeries: true }
        });
        
        const { password: _, ...userToReturn } = updatedUser;
        return NextResponse.json(userToReturn);
    }

    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });

  } catch (error) {
    console.error('Update API Error:', error);
    return NextResponse.json({ message: error.message || 'An unexpected server error occurred.' }, { status: 500 });
  }
}