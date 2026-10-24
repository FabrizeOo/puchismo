import { NextResponse } from 'next/server';
import { getAdminMetrics } from '@/lib/db';
import { checkAdminAuth } from '@/lib/admin-auth';

export async function GET() {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 401 });
  }

  try {
    const metrics = await getAdminMetrics();
    return NextResponse.json({ success: true, metrics });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener métricas' }, { status: 500 });
  }
}
