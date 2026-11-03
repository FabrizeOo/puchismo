import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { placeQuinielaBet, getUserQuinielaBets } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('kick_user_profile')?.value;
    if (!userCookie) {
      return NextResponse.json({ success: true, bets: [] });
    }

    const user = JSON.parse(userCookie);
    const bets = await getUserQuinielaBets(user.id);
    return NextResponse.json({ success: true, bets });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('kick_user_profile')?.value;

    if (!userCookie) {
      return NextResponse.json(
        { success: false, error: 'Debes iniciar sesión con Kick para apostar tus puntos.' },
        { status: 401 }
      );
    }

    const user = JSON.parse(userCookie);
    const body = await req.json();

    const {
      matchId,
      matchDate,
      homeTeam,
      awayTeam,
      competition,
      betType,
      selection,
      predictedHomeScore,
      predictedAwayScore,
      pointsBet,
      odds,
    } = body;

    if (!matchId || !matchDate || !homeTeam || !awayTeam || !selection || !pointsBet) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios para registrar la apuesta.' },
        { status: 400 }
      );
    }

    const result = await placeQuinielaBet({
      userId: user.id,
      username: user.username,
      profilePic: user.profilePic,
      matchId: Number(matchId),
      matchDate,
      homeTeam,
      awayTeam,
      competition: competition || 'Fútbol',
      betType: betType === 'SCORE' ? 'SCORE' : '1X2',
      selection: String(selection),
      predictedHomeScore: predictedHomeScore !== undefined ? Number(predictedHomeScore) : undefined,
      predictedAwayScore: predictedAwayScore !== undefined ? Number(predictedAwayScore) : undefined,
      pointsBet: Number(pointsBet),
      odds: odds !== undefined && Number(odds) > 1.05 ? Number(odds) : undefined,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    // Actualizar la cookie con el nuevo saldo de puntos para mantener el cliente sincronizado
    if (result.remainingPoints !== undefined) {
      user.points = result.remainingPoints;
      cookieStore.set('kick_user_profile', JSON.stringify(user), {
        maxAge: 60 * 60 * 24 * 30, // 30 días
        path: '/',
      });
    }

    return NextResponse.json({
      success: true,
      bet: result.bet,
      remainingPoints: result.remainingPoints,
    });
  } catch (err: any) {
    console.error('Quiniela bet API error:', err);
    return NextResponse.json({ success: false, error: 'Error interno al registrar la apuesta.' }, { status: 500 });
  }
}
