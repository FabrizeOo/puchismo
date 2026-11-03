import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSessionToken, SESSION_COOKIE_NAME } from '@/lib/admin-auth';
import { getAllQuinielaBets, evaluateMatchQuinielaBets } from '@/lib/db';

export const dynamic = 'force-dynamic';

function checkAdminAuth(): boolean {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return Boolean(token && verifyAdminSessionToken(token));
}

export async function GET() {
  if (!checkAdminAuth()) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const bets = await getAllQuinielaBets(200);
    return NextResponse.json({ success: true, bets });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!checkAdminAuth()) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { matchId, homeScore, awayScore } = body;

    if (matchId === undefined || homeScore === undefined || awayScore === undefined) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros matchId, homeScore o awayScore' },
        { status: 400 }
      );
    }

    const result = await evaluateMatchQuinielaBets(
      Number(matchId),
      parseInt(homeScore, 10),
      parseInt(awayScore, 10)
    );

    return NextResponse.json({
      success: true,
      ...result,
      message: `Partido #${matchId} evaluado: ${result.evaluatedCount} apuestas procesadas, ${result.wonCount} ganadoras, ${result.totalPayoutAwarded} puntos repartidos.`,
    });
  } catch (err: any) {
    console.error('Error evaluando apuestas desde admin:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
