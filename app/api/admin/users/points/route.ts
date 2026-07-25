import { NextResponse } from 'next/server';
import { updateUserPoints } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function checkAdminAuth(): boolean {
  const cookieStore = cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

export async function POST(req: Request) {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { username, points } = await req.json();

    if (!username || typeof points !== 'number' || isNaN(points)) {
      return NextResponse.json({ error: 'Usuario y puntos numéricos son requeridos' }, { status: 400 });
    }

    const updatedUser = await updateUserPoints(username, points);

    if (updatedUser) {
      return NextResponse.json({
        success: true,
        message: `Puntos de @${username} actualizados a ${updatedUser.points} pts con éxito.`,
        user: updatedUser,
      });
    } else {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error modificando puntos:', error);
    return NextResponse.json({ error: 'Error al modificar puntos en el servidor' }, { status: 500 });
  }
}
