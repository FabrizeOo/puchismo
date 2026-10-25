import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/admin-auth';
import { getAnalyticsDashboardData, pruneOldAnalytics } from '@/lib/analytics-db';

export async function GET(req: Request) {
  try {
    const isAuthed = checkAdminAuth();
    if (!isAuthed) {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = (searchParams.get('range') || '7d') as 'today' | 'yesterday' | '7d' | '30d' | 'custom';
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const data = await getAnalyticsDashboardData(range, startDate, endDate);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error al obtener datos analíticos:', error);
    return NextResponse.json({ error: 'Error procesando analíticas' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const isAuthed = checkAdminAuth();
    if (!isAuthed) {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || '';

    if (action === 'prune') {
      const days = typeof body.days === 'number' ? body.days : 90;
      const result = await pruneOldAnalytics(days);
      return NextResponse.json({
        success: true,
        message: `Depuración completada: se purgaron ${result.prunedPageviews} visitas y ${result.prunedEvents} eventos de más de ${days} días.`,
        result,
      });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error en mantenimiento de analíticas:', error);
    return NextResponse.json({ error: 'Error interno en analíticas' }, { status: 500 });
  }
}
