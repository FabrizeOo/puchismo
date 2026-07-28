import { NextResponse } from 'next/server';
import { getAllProofs, updateProofStatus } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function checkAdminAuth(): boolean {
  const cookieStore = cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated_admin_puchismo_2026' || session?.value === 'authenticated';
}

export async function GET() {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const proofs = await getAllProofs();
    return NextResponse.json({ success: true, proofs });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener pruebas' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { proofId, status } = await req.json();

    if (!proofId || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    const result = await updateProofStatus(proofId, status as 'APPROVED' | 'REJECTED', 50);

    if (result.success) {
      const msg =
        status === 'APPROVED'
          ? 'Prueba aprobada con éxito. Se otorgaron +50 puntos al usuario.'
          : 'Prueba marcada como rechazada.';
      return NextResponse.json({ success: true, message: msg, proof: result.proof });
    } else {
      return NextResponse.json({ error: result.error || 'Error al actualizar la prueba' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor al actualizar estado' }, { status: 500 });
  }
}
