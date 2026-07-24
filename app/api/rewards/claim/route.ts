import { NextResponse } from 'next/server';
import { createClaim, getUser } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('kick_user_profile');

    if (!userCookie?.value) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión con tu cuenta de Kick para reclamar recompensas.' },
        { status: 401 }
      );
    }

    let storedProfile: any;
    try {
      storedProfile = JSON.parse(decodeURIComponent(userCookie.value));
    } catch {
      return NextResponse.json({ error: 'Sesión inválida. Por favor, vuelve a iniciar sesión.' }, { status: 401 });
    }

    const username = storedProfile.username;
    const body = await req.json();
    const { rewardId, contactInfo } = body;

    if (!rewardId) {
      return NextResponse.json({ error: 'Debes seleccionar una recompensa válida.' }, { status: 400 });
    }

    if (!contactInfo || contactInfo.trim().length < 3) {
      return NextResponse.json(
        { error: 'Por favor, proporciona un método de contacto válido (ej: usuario de Discord, WhatsApp o usuario Kick).' },
        { status: 400 }
      );
    }

    const result = createClaim({
      userId: storedProfile.id,
      username: username,
      profilePic: storedProfile.profilePic,
      rewardId,
      contactInfo: contactInfo.trim(),
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Actualizar la cookie del perfil con el nuevo saldo de puntos
    const dbUser = getUser(username);
    const updatedClientProfile = {
      ...storedProfile,
      points: dbUser ? dbUser.points : result.remainingPoints,
    };

    const response = NextResponse.json({
      success: true,
      message: '¡Recompensa reclamada con éxito! Bepucho o el equipo se contactarán contigo muy pronto.',
      claim: result.claim,
      remainingPoints: result.remainingPoints,
    });

    response.cookies.set('kick_user_profile', JSON.stringify(updatedClientProfile), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error claiming reward:', error);
    return NextResponse.json({ error: 'Error procesando la solicitud de reclamación.' }, { status: 500 });
  }
}
