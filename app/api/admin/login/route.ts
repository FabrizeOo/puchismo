import { NextResponse } from 'next/server';
import { generateAdminSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/lib/admin-auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`login_${ip}`, 5, 15 * 60 * 1000); // 5 intentos cada 15 min

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Demasiados intentos fallidos. Por favor, espera 15 minutos.' },
        { status: 429 }
      );
    }

    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD || 'PuchismoAdmin2026$SecureK9!';

    if (!password || password !== adminPassword) {
      return NextResponse.json({ error: 'Contraseña de administrador incorrecta.' }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Autenticado correctamente como Administrador.',
    });

    // Generar identificador de sesión criptográfico y aleatorio (regenerado en cada login)
    const sessionToken = generateAdminSessionToken();

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Error procesando login de admin.' }, { status: 500 });
  }
}
