import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    
    const userId = token.id;
    const body = await request.json();

    // --- Logic for Username/Avatar Updates ---
    if (body.username || body.avatarUrl || body.bio !== undefined || body.bannerUrl) {
      const { username, avatarUrl, bio, bannerUrl } = body;
      const updateData = {};
      if (username) updateData.username = username;
      if (avatarUrl) updateData.avatarUrl = avatarUrl;
      if (bio !== undefined) updateData.bio = bio;
      if (bannerUrl) updateData.bannerUrl = bannerUrl;

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: { favoriteMovies: true, watchlistMovies: true, watchedMovies: true, favoriteSeries: true, watchlistSeries: true, watchedSeries: true }
      });
      
      const { password: _, ...userToReturn } = user;
      userToReturn.hasPassword = !!user.password;
      return NextResponse.json(userToReturn);
    }
    
    // --- THIS IS THE RE-ADDED AND FIXED LOGIC FOR LISTS ---
    const { itemId, itemType, listType, action } = body;
    if (itemId && itemType && listType && action) {
        const numericItemId = parseInt(itemId, 10);
        
        // 1. Determine which model and field to update
        const modelName = itemType === 'movie' ? 'movie' : 'series';
        const fieldToUpdate = {
          movie: { favorites: 'favoriteMovieIds', watchlist: 'watchlistMovieIds', watched: 'watchedMovieIds' },
          series: { favorites: 'favoriteSeriesIds', watchlist: 'watchlistSeriesIds', watched: 'watchedSeriesIds' },
        }[itemType][listType];

        // 1.5. (THE FIX) Fetch the user's current list first
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { [fieldToUpdate]: true }
        });

        if (!user) {
          throw new Error('User not found during list update');
        }
        
        // 2. Fetch item details from TMDB to save in our DB
        const tmdbToken = process.env.TMDB_API_TOKEN;
        const tmdbRes = await fetch(`https://api.themoviedb.org/3/${itemType === 'series' ? 'tv' : 'movie'}/${numericItemId}`, { 
            headers: { Authorization: `Bearer ${tmdbToken}` } 
        });
        if (!tmdbRes.ok) throw new Error('Could not fetch item details from TMDB');
        const tmdbData = await tmdbRes.json();
        
        // 3. Create or find the item in our local Movie/Series table
        const createPayload = itemType === 'movie'
            ? { tmdbId: numericItemId, title: tmdbData.title, posterPath: tmdbData.poster_path, releaseDate: tmdbData.release_date }
            : { tmdbId: numericItemId, name: tmdbData.name, posterPath: tmdbData.poster_path, firstAirDate: tmdbData.first_air_date };
        
        const mediaItem = await prisma[modelName].upsert({
          where: { tmdbId: numericItemId },
          update: createPayload,
          create: createPayload,
        });

        // 4. Atomically add or remove using a Set to prevent duplicates
        const currentList = user[fieldToUpdate] || [];
        const idSet = new Set(currentList.map(String));
        const mediaIdString = mediaItem.id.toString();

        if (action === 'add') {
          idSet.add(mediaIdString);
        } else { // action === 'remove'
          idSet.delete(mediaIdString);
        }
        
        const newList = Array.from(idSet);
        
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { 
            [fieldToUpdate]: {
              set: newList
            }
          },
          include: { favoriteMovies: true, watchlistMovies: true, watchedMovies: true, favoriteSeries: true, watchlistSeries: true, watchedSeries: true }
        });
        
        // 5. Return the updated user object to the client
        const { password: _, ...userToReturn } = updatedUser;
        userToReturn.hasPassword = !!updatedUser.password;
        return NextResponse.json(userToReturn);
    }
    // --- END OF RE-ADDED LOGIC ---

    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });

  } catch (error) {
    console.error('Update API Error:', error);
    // Handle username conflict
    if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
      return NextResponse.json({ message: 'Username is already taken' }, { status: 409 });
    }
    return NextResponse.json({ message: error.message || 'An unexpected server error occurred.' }, { status: 500 });
  }
}