import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Authentication cookie not found. Please log in.' }, { status: 401 });
  }

  try {
    const decoded = await verifyToken(token);
    if (!decoded?.id) {
      return NextResponse.json({ message: 'Invalid token payload.' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return NextResponse.json({ message: 'User not found for this token.' }, { status: 404 });
    }

    const tmdbToken = process.env.TMDB_API_TOKEN;
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tmdbToken}`,
      },
    };

    const fetchDetails = async (id, type) => {
      try {
        const url = `https://api.themoviedb.org/3/${type}/${id}?language=en-US`;
        const res = await fetch(url, options);
        if (!res.ok) return null;
        const data = await res.json();
        return { ...data, media_type: type === 'tv' ? 'serie' : 'movie' };
      } catch (error) {
        console.error(`TMDB fetch failed for ${type} ID ${id}:`, error);
        return null;
      }
    };

    const favoriteMovies = await Promise.all(user.favoriteMovieIds.map(id => fetchDetails(id, 'movie')));
    const watchlistMovies = await Promise.all(user.watchlistMovieIds.map(id => fetchDetails(id, 'movie')));
    const favoriteSeries = await Promise.all(user.favoriteSeriesIds.map(id => fetchDetails(id, 'tv')));
    const watchlistSeries = await Promise.all(user.watchlistSeriesIds.map(id => fetchDetails(id, 'tv')));

    return NextResponse.json({
      favoriteMovies: favoriteMovies.filter(Boolean),
      watchlistMovies: watchlistMovies.filter(Boolean),
      favoriteSeries: favoriteSeries.filter(Boolean),
      watchlistSeries: watchlistSeries.filter(Boolean),
    });

  } catch (error) {
    // **CRITICAL FIX**: More specific error handling
    console.error('Get Lists API Route Error:', error); // Log the full error on the server

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'JWT Error: The provided token is invalid. Please log in again.' }, { status: 401 });
    }
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json({ message: 'Your session has expired. Please log in again.' }, { status: 401 });
    }
    // Check for Prisma-specific errors
    if (error.code && error.code.startsWith('P')) {
        return NextResponse.json({ message: 'A database error occurred. Please try again later.' }, { status: 500 });
    }
    
    // Fallback for any other errors
    return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
  }
}