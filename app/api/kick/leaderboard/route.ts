import { NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/points-db';

export async function GET() {
  try {
    const list = getLeaderboard();
    return NextResponse.json({ success: true, leaderboard: list });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Fallo al obtener tabla de clasificación' }, { status: 500 });
  }
}
