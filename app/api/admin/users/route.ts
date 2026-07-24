import { NextResponse } from 'next/server';
import { readDb, saveUser } from '@/lib/db';
import { cookies } from 'next/headers';

function checkAdminAuth() {
  const cookieStore = cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated_admin_puchismo_2026';
}

function maskId(id: string): string {
  if (!id || id.length <= 4) return '****';
  return `${id.substring(0, 3)}****${id.substring(id.length - 2)}`;
}

export async function GET() {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 401 });
  }

  try {
    const db = readDb();
    const rawUsers = Object.values(db.users);

    // Sanitizar lista de usuarios sin revelar datos sensibles
    const sanitizedUsers = rawUsers.map((u) => ({
      idMasked: maskId(u.id),
      username: u.username,
      profilePic: u.profilePic,
      points: u.points,
      watchTimeMinutes: u.watchTimeMinutes,
      chatMessagesCount: u.chatMessagesCount,
      lastUpdated: u.lastUpdated,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ success: true, users: sanitizedUsers });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}
