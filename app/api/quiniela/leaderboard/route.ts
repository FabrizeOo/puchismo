import { NextResponse } from 'next/server';
import { getQuinielaLeaderboard } from '@/lib/db';

export const revalidate = 60; // 1 minuto

export async function GET() {
  try {
    const [weekly, allTime] = await Promise.all([
      getQuinielaLeaderboard('weekly'),
      getQuinielaLeaderboard('all'),
    ]);

    return NextResponse.json({
      success: true,
      weekly,
      allTime,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
