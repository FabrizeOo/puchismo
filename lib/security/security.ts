// lib/security-utils.ts

import { z } from 'zod';

/* ============================================
   VALIDADORES ZOD
   ============================================ */

export const messageSchema = z.object({
  content: z.string()
    .min(1, 'El mensaje no puede estar vacío')
    .max(500, 'El mensaje no puede exceder 500 caracteres')
    .trim(),
  userId: z.string().uuid('ID de usuario inválido'),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const userSchema = z.object({
  username: z.string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(20, 'El nombre de usuario no puede exceder 20 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos'),
  email: z.string().email('Email inválido'),
});

export const streamConfigSchema = z.object({
  provider: z.enum(['twitch', 'kick', 'youtube', 'facebook']),
  channelId: z.string().min(1),
});

/* ============================================
   SANITIZACIÓN HTML/XSS
   ============================================ */

/**
 * Sanitiza texto para prevenir XSS
 * Escapa caracteres HTML especiales
 */
export function sanitizeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Sanitiza entrada de usuario
 * Elimina caracteres peligrosos y valida longitud
 */
export function sanitizeUserInput(input: string, maxLength: number = 500): string {
  return sanitizeHtml(input.trim().slice(0, maxLength));
}

/**
 * Valida y sanitiza URL
 */
export function validateUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Solo permitir protocolos seguros
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Valida direcciones de email de forma estricta
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/* ============================================
   VALIDACIÓN DE ENTRADA
   ============================================ */

/**
 * Valida que el objeto sea un UUID válido
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Valida que el string sea un JSON válido
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtiene información segura del error sin exponer detalles internos
 */
export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // En desarrollo, mostrar el error real
    if (process.env.NODE_ENV === 'development') {
      return error.message;
    }
    // En producción, mensaje genérico
    return 'Ocurrió un error procesando tu solicitud';
  }
  return 'Error desconocido';
}

/* ============================================
   VERIFICACIÓN DE RATE LIMITING
   ============================================ */

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutos
): boolean {
  const now = Date.now();
  const store = rateLimitStore[identifier];

  if (!store || now > store.resetTime) {
    rateLimitStore[identifier] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return true;
  }

  if (store.count >= maxRequests) {
    return false;
  }

  store.count++;
  return true;
}

export function getRateLimitStatus(identifier: string) {
  const store = rateLimitStore[identifier];
  if (!store) {
    return { remaining: 100, resetTime: Date.now() + 15 * 60 * 1000 };
  }
  return {
    remaining: Math.max(0, 100 - store.count),
    resetTime: store.resetTime,
  };
}

/* ============================================
   VALIDACIÓN DE JWT
   ============================================ */

export function isValidJwtFormat(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3 && parts.every((part) => part.length > 0);
}

/* ============================================
   VALIDACIÓN CONDICIONAL
   ============================================ */

/**
 * Valida múltiples campos con esquemas Zod
 */
export async function validateMultiple<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ valid: boolean; data?: T; errors?: z.ZodError }> {
  try {
    const parsed = await schema.parseAsync(data);
    return { valid: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error };
    }
    return { valid: false };
  }
}

/* ============================================
   PROTECCIÓN CONTRA ATAQUES
   ============================================ */

/**
 * Detecta posible inyección SQL en strings
 * (Primera línea de defensa - usar prepared statements siempre)
 */
export function hasSQLInjectionIndicators(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|WHERE)\b)/i,
    /['";]/,
    /(--|\/\*|\*\/|;)/,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Detecta posible inyección NoSQL
 */
export function hasNoSQLInjectionIndicators(input: string): boolean {
  const noSqlPatterns = [/[{}$\[\]]/];
  return noSqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Valida que la entrada sea segura antes de usar
 * ADVERTENCIA: Esta es una validación adicional, NO reemplaza prepared statements
 */
export function isInputSafe(
  input: string,
  allowSpecialChars: boolean = false
): boolean {
  if (hasSQLInjectionIndicators(input) || hasNoSQLInjectionIndicators(input)) {
    return false;
  }

  if (!allowSpecialChars) {
    return /^[a-zA-Z0-9\s\-_.,!?¿¡áéíóúñü@.]*$/.test(input);
  }

  return true;
}

/* ============================================
   HELPER FUNCTIONS
   ============================================ */

/**
 * Genera un hash simple para cacheo
 */
export function generateHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convertir a entero de 32-bit
  }
  return Math.abs(hash).toString(36);
}

/**
 * Crea un nonce seguro para CSRF
 */
export function generateNonce(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('hex');
}

/* ============================================
   LOGGING SEGURO
   ============================================ */

/**
 * Registra errores sin exponer información sensible
 */
export function logError(error: unknown, context: Record<string, unknown> = {}) {
  const timestamp = new Date().toISOString();
  const safeContext = { ...context };

  // Remover datos sensibles
  delete safeContext.password;
  delete safeContext.token;
  delete safeContext.apiKey;

  if (process.env.NODE_ENV === 'development') {
    console.error(`[${timestamp}]`, error, safeContext);
  } else {
    // En producción, enviar a servicio de logging
    // Example: Sentry, LogRocket, etc.
    console.error(`[${timestamp}] Error:`, getSafeErrorMessage(error));
  }
}

export function logSecurityEvent(
  eventType: string,
  details: Record<string, unknown> = {}
) {
  const timestamp = new Date().toISOString();
  console.warn(`[SECURITY] [${timestamp}] ${eventType}`, details);
}
