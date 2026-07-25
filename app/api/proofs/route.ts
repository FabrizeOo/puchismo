import { NextResponse } from 'next/server';
import { createProof, getUserProofs } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('kick_user_profile');

    if (!userCookie?.value) {
      return NextResponse.json({ success: true, proofs: [] });
    }

    let user: any;
    try {
      user = JSON.parse(decodeURIComponent(userCookie.value));
    } catch {
      try {
        user = JSON.parse(userCookie.value);
      } catch {
        return NextResponse.json({ success: true, proofs: [] });
      }
    }

    if (!user?.username) {
      return NextResponse.json({ success: true, proofs: [] });
    }

    const proofs = await getUserProofs(user.username);
    return NextResponse.json({ success: true, proofs });
  } catch (error) {
    console.error('Error fetching user proofs:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('kick_user_profile');

    if (!userCookie?.value) {
      return NextResponse.json({ error: 'Debes iniciar sesión con Kick para subir pruebas.' }, { status: 401 });
    }

    let user: any;
    try {
      user = JSON.parse(decodeURIComponent(userCookie.value));
    } catch {
      try {
        user = JSON.parse(userCookie.value);
      } catch {
        return NextResponse.json({ error: 'Sesión inválida.' }, { status: 400 });
      }
    }

    const body = await req.json();
    const { imageUrl, notes } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Se requiere adjuntar la captura de pantalla.' }, { status: 400 });
    }

    const result = await createProof({
      userId: user.id || user.username.toLowerCase(),
      username: user.username,
      profilePic: user.profilePic || '',
      imageUrl,
      notes: notes || '',
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '¡Prueba enviada con éxito! El administrador la revisará para otorgar tus +50 puntos.',
        proof: result.proof,
      });
    } else {
      return NextResponse.json({ error: result.error || 'Error al guardar la prueba.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error enviando prueba:', error);
    return NextResponse.json({ error: 'Error en el servidor al procesar la imagen.' }, { status: 500 });
  }
}
