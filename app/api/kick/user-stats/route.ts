import { NextResponse } from 'next/server';
import { getUserPoints } from '@/lib/points-db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const profileCookie = cookieStore.get('kick_user_profile');

    if (!profileCookie?.value) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    let storedProfile: any;
    try {
      storedProfile = JSON.parse(decodeURIComponent(profileCookie.value));
    } catch {
      return NextResponse.json({ error: 'Cookie inválida' }, { status: 400 });
    }

    const username = storedProfile.username;
    const dbUser = getUserPoints(username);

    if (!dbUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const updatedProfile = {
      ...storedProfile,
      points: dbUser.points,
      watchTimeMinutes: dbUser.watchTimeMinutes,
      chatMessagesCount: dbUser.chatMessagesCount,
    };

    const response = NextResponse.json({
      success: true,
      user: dbUser,
    });

    // Update cookie so the client UI and any other page loads always see the fresh value
    response.cookies.set('kick_user_profile', JSON.stringify(updatedProfile), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
