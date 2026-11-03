import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createPrediction, getUserPredictions } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('kick_user_profile')?.value;
    if (!userCookie) {
      return NextResponse.json({ success: true, predictions: [] });
    }

    const user = JSON.parse(userCookie);
    const predictions = await getUserPredictions(user.id);
    return NextResponse.json({ success: true, predictions });
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
        { success: false, error: 'Debes iniciar sesión con Kick para pronosticar.' },
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
      predictedHomeScore,
      predictedAwayScore,
    } = body;

    if (
      matchId === undefined ||
      !matchDate ||
      !homeTeam ||
      !awayTeam ||
      predictedHomeScore === undefined ||
      predictedAwayScore === undefined
    ) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios para registrar la predicción.' },
        { status: 400 }
      );
    }

    const result = await createPrediction({
      userId: user.id,
      username: user.username,
      profilePic: user.profilePic,
      matchId: Number(matchId),
      matchDate,
      homeTeam,
      awayTeam,
      competition: competition || 'Fútbol',
      predictedHomeScore: parseInt(predictedHomeScore, 10),
      predictedAwayScore: parseInt(predictedAwayScore, 10),
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, prediction: result.prediction });
  } catch (err: any) {
    console.error('Quiniela predict API error:', err);
    return NextResponse.json({ success: false, error: 'Error interno al guardar pronóstico.' }, { status: 500 });
  }
}
