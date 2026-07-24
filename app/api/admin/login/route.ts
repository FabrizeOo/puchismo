import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD || 'PuchismoAdmin2026Secure';

    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Contraseña de administrador incorrecta.' }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Autenticado correctamente como Administrador.',
    });

    response.cookies.set('admin_session', 'authenticated_admin_puchismo_2026', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Error procesando login de admin.' }, { status: 500 });
  }
}
