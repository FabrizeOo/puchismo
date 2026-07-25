import { NextResponse } from 'next/server';
import { getRewards, getUserClaims } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const allRewards = await getRewards();
    const rewards = allRewards.filter((r) => r.active);

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

    return NextResponse.json(
      {
        success: true,
        rewards,
        userClaims,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json({ error: 'Error al obtener las recompensas' }, { status: 500 });
  }
}
