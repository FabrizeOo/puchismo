import { NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/points-db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const list = await getLeaderboard();
    return NextResponse.json(
      { success: true, leaderboard: list },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fallo al obtener tabla de clasificación' }, { status: 500 });
  }
}
