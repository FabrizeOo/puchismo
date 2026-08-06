import { NextResponse } from 'next/server';
import { addWatchTime, addChatMessage } from '@/lib/points-db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, username } = body;

    if (!username || !action) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    // Auth verification: Read cookie using Next.js cookies() helper & raw header fallback
    const cookieStore = cookies();
    let cookieVal = cookieStore.get('kick_user_profile')?.value;

    if (!cookieVal) {
      const rawCookies = req.headers.get('cookie') || '';
      const match = rawCookies.match(/(?:^|; )kick_user_profile=([^;]*)/);
      if (match) {
        cookieVal = match[1];
      }
    }

    if (!cookieVal) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    let storedProfile: any;
    try {
      storedProfile = JSON.parse(decodeURIComponent(cookieVal));
    } catch {
      try {
        storedProfile = JSON.parse(cookieVal);
      } catch {
        return NextResponse.json({ error: 'Cookie de perfil inválida' }, { status: 401 });
      }
    }

    // Ensure the requested username matches the authenticated username
    if (!storedProfile?.username || storedProfile.username.toLowerCase() !== username.toLowerCase()) {
      return NextResponse.json({ error: 'Acción no autorizada para este usuario' }, { status: 403 });
    }

    let updatedUser = null;
    if (action === 'watch') {
      // Award points for 1 minute of watch time (+0.4 points)
      updatedUser = await addWatchTime(username, 1);
    } else if (action === 'chat') {
      // Award points for 1 chat message (+0.2 points)
      updatedUser = await addChatMessage(username);
    } else {
      return NextResponse.json({ error: 'Acción no soportada' }, { status: 400 });
    }

    if (!updatedUser) {
      return NextResponse.json({ error: 'Usuario no encontrado en la base de datos' }, { status: 404 });
    }

    // Return the updated points and details
    const response = NextResponse.json({
      success: true,
      points: updatedUser.points,
      watchTimeMinutes: updatedUser.watchTimeMinutes,
      chatMessagesCount: updatedUser.chatMessagesCount,
    });

    // Update cookie so client UI receives updated stats immediately
    const updatedClientProfile = {
      ...storedProfile,
      points: updatedUser.points,
      watchTimeMinutes: updatedUser.watchTimeMinutes,
      chatMessagesCount: updatedUser.chatMessagesCount,
    };

    response.cookies.set('kick_user_profile', JSON.stringify(updatedClientProfile), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json({ error: 'Error procesando los puntos del usuario' }, { status: 500 });
  }
}
