import { NextResponse } from 'next/server';
import { getAllClaims, updateClaimStatus } from '@/lib/db';
import { cookies } from 'next/headers';

function checkAdminAuth() {
  const cookieStore = cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated_admin_puchismo_2026';
}

export async function GET() {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 401 });
  }

  try {
    const claims = getAllClaims();
    return NextResponse.json({ success: true, claims });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener reclamaciones' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { claimId, status, adminNotes } = body;

    if (!claimId || !status) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos (claimId, status)' }, { status: 400 });
    }

    if (!['PENDING', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Estado no válido' }, { status: 400 });
    }

    const result = updateClaimStatus(claimId, status, adminNotes);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Reclamación actualizada a ${status}${status === 'CANCELLED' ? ' (Puntos reembolsados al usuario)' : ''}.`,
      claim: result.claim,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error actualizando reclamación' }, { status: 500 });
  }
}
