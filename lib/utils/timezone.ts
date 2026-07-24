// lib/timezone-utils.ts

import { formatDistanceToNow, format, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

/* ============================================
   DETECCIÓN Y CONVERSIÓN DE ZONAS HORARIAS
   ============================================ */

/**
 * Obtiene la zona horaria del navegador del usuario
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

/**
 * Obtiene el offset de UTC del navegador (en milisegundos)
 */
export function getUtcOffset(): number {
  return new Date().getTimezoneOffset() * -60000; // Convertir a ms
}

/**
 * Obtiene el nombre mostrable de la zona horaria
 */
export function getTimezoneDisplayName(timezone: string): string {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('es-ES', {
      timeZone: timezone,
      timeZoneName: 'long',
    });
    const parts = formatter.formatToParts(date);
    return parts.find((p) => p.type === 'timeZoneName')?.value || timezone;
  } catch {
    return timezone;
  }
}

/**
 * Convierte una fecha UTC a la zona horaria local del usuario
 */
export function convertToLocalTimezone(utcDate: string | Date): Date {
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
  return new Date(date.getTime() + getUtcOffset());
}

/**
 * Convierte una fecha de zona horaria específica a UTC
 */
export function convertToUTC(
  date: Date,
  timezone: string = getUserTimezone()
): Date {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const partsMap = Object.fromEntries(
    parts.map((p) => [p.type, p.value])
  );

  const localDate = new Date(
    `${partsMap.year}-${partsMap.month}-${partsMap.day}T${partsMap.hour}:${partsMap.minute}:${partsMap.second}`
  );

  return new Date(localDate.getTime() - (date.getTime() - localDate.getTime()));
}

/**
 * Formatea una fecha UTC mostrando la hora local
 * Ejemplo: "Hoy a las 15:30"
 */
export function formatMatchTime(utcDate: string | Date): string {
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
  const localDate = convertToLocalTimezone(date);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (isSameDay(localDate, today)) {
    return `Hoy a las ${format(localDate, 'HH:mm', { locale: es })}`;
  } else if (isSameDay(localDate, tomorrow)) {
    return `Mañana a las ${format(localDate, 'HH:mm', { locale: es })}`;
  } else {
    return format(localDate, "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es });
  }
}

/**
 * Formatea una fecha en formato extendido
 * Ejemplo: "Miércoles, 15 de enero de 2026 a las 15:30"
 */
export function formatMatchDateTime(utcDate: string | Date): string {
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
  const localDate = convertToLocalTimezone(date);
  return format(localDate, "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
    locale: es,
  });
}

/**
 * Obtiene tiempo relativo hasta un partido
 * Ejemplo: "en 2 horas" o "hace 30 minutos"
 */
export function getTimeUntilMatch(utcDate: string | Date): string {
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
  const localDate = convertToLocalTimezone(date);
  return formatDistanceToNow(localDate, { addSuffix: true, locale: es });
}

/**
 * Verifica si un partido está cerca (dentro de X minutos)
 */
export function isMatchSoon(utcDate: string | Date, minutesBefore: number = 15): boolean {
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
  const localDate = convertToLocalTimezone(date);
  const now = new Date();
  const timeUntilMatch = localDate.getTime() - now.getTime();
  return timeUntilMatch > 0 && timeUntilMatch < minutesBefore * 60 * 1000;
}

/**
 * Verifica si un partido está en vivo (dentro de ±2 horas)
 */
export function isMatchLiveWindow(
  utcDate: string | Date,
  hoursWindow: number = 2
): boolean {
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
  const localDate = convertToLocalTimezone(date);
  const now = new Date();
  const timeDiff = Math.abs(localDate.getTime() - now.getTime());
  return timeDiff < hoursWindow * 60 * 60 * 1000;
}

/* ============================================
   GROUPING Y SORTING DE PARTIDOS
   ============================================ */

export interface GroupedMatches {
  today: Array<{ date: string; matches: any[] }>;
  upcoming: Array<{ date: string; matches: any[] }>;
  past: Array<{ date: string; matches: any[] }>;
}

/**
 * Agrupa partidos por fecha (hoy, próximos, pasados)
 */
export function groupMatchesByDate(matches: any[]): GroupedMatches {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const grouped: GroupedMatches = {
    today: [],
    upcoming: [],
    past: [],
  };

  const dateMap = new Map<string, any[]>();

  matches.forEach((match) => {
    const matchDate = convertToLocalTimezone(match.utcDate);
    const dateKey = format(matchDate, 'yyyy-MM-dd');
    const dateGroup = dateMap.get(dateKey) || [];
    dateGroup.push(match);
    dateMap.set(dateKey, dateGroup);
  });

  dateMap.forEach((matchesForDate, dateKey) => {
    const date = parseISO(dateKey);
    const formatted = format(date, "EEEE, d 'de' MMMM", { locale: es });

    const groupedMatch = { date: formatted, matches: matchesForDate };

    if (isSameDay(date, today)) {
      grouped.today.push(groupedMatch);
    } else if (date > today) {
      grouped.upcoming.push(groupedMatch);
    } else {
      grouped.past.push(groupedMatch);
    }
  });

  // Ordenar
  grouped.upcoming.sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
  );
  grouped.past.sort(
    (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
  );

  return grouped;
}

/* ============================================
   TIMEZONES ESPECÍFICAS (MUNDIAL 2026)
   ============================================ */

export const MUNDIAL_2026_TIMEZONES = {
  'México': 'America/Mexico_City',
  'Canadá': 'America/Toronto',
  'USA': 'America/New_York',
  'Argentina': 'America/Argentina/Buenos_Aires',
  'Brasil': 'America/Sao_Paulo',
  'Europa': 'Europe/London',
  'Asia': 'Asia/Shanghai',
  'Australia': 'Australia/Sydney',
} as const;

export type MundialLocation = keyof typeof MUNDIAL_2026_TIMEZONES;

/**
 * Obtiene la zona horaria más cercana a la ubicación del usuario
 */
export function getNearestMundialTimezone(userTimezone: string): MundialLocation {
  const userDate = new Date();

  // Encontrar la ubicación con horario más cercano
  let nearestLocation: MundialLocation = 'México';
  let minDiff = Math.abs(
    userDate.getTimezoneOffset() -
      new Date().toLocaleString('en-US', { timeZone: MUNDIAL_2026_TIMEZONES['México'] }).length
  );

  (Object.entries(MUNDIAL_2026_TIMEZONES) as [MundialLocation, string][]).forEach(
    ([location, tz]) => {
      const locationDate = new Date(
        userDate.toLocaleString('en-US', { timeZone: tz })
      );
      const diff = Math.abs(userDate.getTime() - locationDate.getTime());

      if (diff < minDiff) {
        minDiff = diff;
        nearestLocation = location;
      }
    }
  );

  return nearestLocation;
}

/* ============================================
   ALMACENAMIENTO Y RECUPERACIÓN
   ============================================ */

const TIMEZONE_STORAGE_KEY = 'mundial-user-timezone';

export function saveUserTimezone(timezone: string): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TIMEZONE_STORAGE_KEY, timezone);
    } catch (e) {
      console.error('Error al guardar zona horaria:', e);
    }
  }
}

export function getUserSavedTimezone(): string | null {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem(TIMEZONE_STORAGE_KEY);
    } catch (e) {
      console.error('Error al obtener zona horaria guardada:', e);
      return null;
    }
  }
  return null;
}

/**
 * Obtiene la zona horaria del usuario (preferencia guardada o detectada)
 */
export function getUserPreferredTimezone(): string {
  const saved = getUserSavedTimezone();
  return saved || getUserTimezone();
}

/* ============================================
   HELPERS PARA COMPONENTES
   ============================================ */

export function getMatchStatusBadgeColor(
  status: string,
  minute?: number
): string {
  if (status === 'LIVE' || status === 'IN_PLAY') {
    return 'bg-red-500/20 text-red-400';
  }
  if (status === 'FINISHED') {
    return 'bg-green-500/20 text-green-400';
  }
  if (status === 'SCHEDULED') {
    return 'bg-blue-500/20 text-blue-400';
  }
  if (status === 'POSTPONED' || status === 'SUSPENDED') {
    return 'bg-yellow-500/20 text-yellow-400';
  }
  return 'bg-gray-500/20 text-gray-400';
}

export function getMatchStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'LIVE': '🔴 EN VIVO',
    'IN_PLAY': '🔴 EN VIVO',
    'FINISHED': '✅ Finalizado',
    'SCHEDULED': '⏰ Programado',
    'POSTPONED': '⏸️ Aplazado',
    'SUSPENDED': '⏸️ Suspendido',
    'CANCELLED': '❌ Cancelado',
  };
  return statusMap[status] || status;
}
