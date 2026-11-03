import { NextResponse } from 'next/server';
import { getMatchesToday, getMatchesTomorrow } from '@/lib/football/service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const refresh = searchParams.get('refresh') === 'true';
    const day = searchParams.get('day') || 'today';
    const withOdds = searchParams.get('withOdds') === 'true';

    if (day === 'tomorrow') {
      const matches = await getMatchesTomorrow(refresh, withOdds);
      return NextResponse.json({
        success: true,
        day: 'tomorrow',
        matches,
        count: matches.length,
        timestamp: new Date().toISOString(),
      });
    }

    const matches = await getMatchesToday(refresh, withOdds);
    return NextResponse.json({
      success: true,
      day: 'today',
      matches,
      count: matches.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error en /api/football/matches:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error al obtener partidos' },
      { status: 500 }
    );
  }
}
