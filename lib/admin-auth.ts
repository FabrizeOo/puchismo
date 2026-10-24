import crypto from 'crypto';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 horas

function getSecretKey(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    'puchismo_admin_secure_key_fallback_2026'
  );
}

/**
 * Genera un identificador de sesión criptográficamente aleatorio, firmado con HMAC
 * y con timestamp de expiración (24 horas).
 */
export function generateAdminSessionToken(): string {
  const nonce = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now().toString();
  const payload = `${nonce}.${timestamp}`;
  const hmac = crypto.createHmac('sha256', getSecretKey()).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

/**
 * Verifica si el token de sesión actual es válido, auténtico y no ha expirado.
 * Admite fallback a legacy durante transición de despliegue.
 */
export function verifyAdminSessionToken(token?: string): boolean {
  if (!token) return false;

  // Soporte de compatibilidad temporal para sesiones existentes
  if (token === 'authenticated_admin_puchismo_2026' || token === 'authenticated') {
    return true;
  }

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [nonce, timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Verificar expiración (24 horas)
  const ageMs = Date.now() - timestamp;
  if (ageMs < 0 || ageMs > SESSION_MAX_AGE_SECONDS * 1000) {
    return false;
  }

  // Verificar firma HMAC en tiempo constante para mitigar timing attacks
  const payload = `${nonce}.${timestampStr}`;
  const expectedHmac = crypto.createHmac('sha256', getSecretKey()).update(payload).digest('hex');

  try {
    const signatureBuf = Buffer.from(signature, 'hex');
    const expectedBuf = Buffer.from(expectedHmac, 'hex');
    if (signatureBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(signatureBuf, expectedBuf);
  } catch {
    return false;
  }
}

/**
 * Helper para validar autenticación de administrador desde Server Components / API Routes
 */
export function checkAdminAuth(): boolean {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME);
    return verifyAdminSessionToken(session?.value);
  } catch {
    return false;
  }
}

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS };
