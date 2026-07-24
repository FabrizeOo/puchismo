import { NextResponse } from 'next/server';
import { getRewards, getUserClaims } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rewards = getRewards().filter((r) => r.active);
    
    // Leer cookie de usuario si está logueado para enviarle su historial de reclamaciones
    const cookieStore = cookies();
    const userCookie = cookieStore.get('kick_user_profile');
    let userClaims: any[] = [];

    if (userCookie?.value) {
      try {
        const user = JSON.parse(decodeURIComponent(userCookie.value));
        if (user?.username) {
          userClaims = getUserClaims(user.username);
        }
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      rewards,
      userClaims,
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json({ error: 'Error al obtener las recompensas' }, { status: 500 });
  }
}
