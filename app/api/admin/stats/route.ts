import { NextResponse } from 'next/server';
import { getAdminMetrics } from '@/lib/db';
import { cookies } from 'next/headers';

function checkAdminAuth(): boolean {
  const cookieStore = cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated_admin_puchismo_2026' || session?.value === 'authenticated';
}

export async function GET() {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 401 });
  }

  try {
    const metrics = getAdminMetrics();
    return NextResponse.json({ success: true, metrics });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener métricas' }, { status: 500 });
  }
}
