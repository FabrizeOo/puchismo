// lib/football/football-data-org.ts
// Implementación del proveedor football-data.org con caché en memoria y revalidación

import { FootballDataProvider } from './provider';
import { MatchItem, StandingGroup, MatchDetail } from './types';

const BASE_URL = 'https://api.football-data.org/v4';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string): T | null {
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return item.data;
}

function setCached<T>(key: string, data: T, ttlSeconds: number) {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

function getLimaDateString(offsetDays: number = 0): string {
  try {
    const now = new Date();
    // Obtener fecha en zona horaria America/Lima (UTC-5)
    const limaDateStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Lima' }); // YYYY-MM-DD
    const [y, m, d] = limaDateStr.split('-').map(Number);
    const target = new Date(Date.UTC(y, m - 1, d));
    target.setUTCDate(target.getUTCDate() + offsetDays);
    return target.toISOString().split('T')[0];
  } catch {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  }
}

export class FootballDataOrgProvider implements FootballDataProvider {
  readonly name = 'football-data.org';

  async fetchApi<T>(endpoint: string, cacheTtlSeconds: number = 300, bypassCache: boolean = false): Promise<T> {
    const cacheKey = `fd_${endpoint}`;
    if (!bypassCache) {
      const cached = getCached<T>(cacheKey);
      if (cached) return cached;
    }

    const apiKey = process.env.FOOTBALL_DATA_API_KEY;
    if (!apiKey) {
      throw new Error('FOOTBALL_DATA_API_KEY no configurada');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'X-Auth-Token': apiKey,
        },
        next: { revalidate: bypassCache ? 0 : cacheTtlSeconds },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        if (res.status === 429) {
          console.warn('[FootballDataOrg] Rate limit alcanzado (429). Intentando usar caché previa.');
          const fallbackCached = memoryCache.get(cacheKey)?.data;
          if (fallbackCached) return fallbackCached;
        }
        throw new Error(`Error API football-data.org: ${res.status} ${res.statusText}`);
      }

      const json = await res.json();
      setCached(cacheKey, json, cacheTtlSeconds);
      return json;
    } catch (err) {
      clearTimeout(timeout);
      // Si falló pero tenemos una versión previa en caché (incluso vencida), úsala
      const stale = memoryCache.get(cacheKey)?.data;
      if (stale) {
        console.warn(`[FootballDataOrg] Servidor usando fallback stale para ${endpoint}`);
        return stale;
      }
      throw err;
    }
  }

  async getMatchesToday(bypassCache: boolean = false): Promise<MatchItem[]> {
    // Para no perder ningún partido por desfase UTC/Lima, consultamos desde hoy Lima hasta mañana Lima
    const todayLima = getLimaDateString(0);
    const tomorrowLima = getLimaDateString(1);
    try {
      const data = await this.fetchApi<{ matches: MatchItem[] }>(
        `/matches?dateFrom=${todayLima}&dateTo=${tomorrowLima}&competitions=PL,PD,CL,BL1,SA,FL1,BSA,DED,PPL,ELC`,
        60, // 60 segundos de caché para monitoreo ágil
        bypassCache
      );

      const allMatches = data.matches || [];
      // Filtrar aquellos cuya fecha en hora Lima corresponda a hoy
      const filtered = allMatches.filter((m) => {
        try {
          const matchLimaDate = new Date(m.utcDate).toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
          return matchLimaDate === todayLima;
        } catch {
          return true;
        }
      });

      return filtered.length > 0 ? filtered : allMatches.slice(0, 15);
    } catch (e) {
      console.error('[FootballDataOrg] Error getMatchesToday:', e);
      return [];
    }
  }

  async getMatchesTomorrow(bypassCache: boolean = false): Promise<MatchItem[]> {
    const tomorrowLima = getLimaDateString(1);
    const dayAfterTomorrowLima = getLimaDateString(2);
    try {
      const data = await this.fetchApi<{ matches: MatchItem[] }>(
        `/matches?dateFrom=${tomorrowLima}&dateTo=${dayAfterTomorrowLima}&competitions=PL,PD,CL,BL1,SA,FL1,BSA,DED,PPL,ELC`,
        300, // 5 min cache
        bypassCache
      );

      const allMatches = data.matches || [];
      const filtered = allMatches.filter((m) => {
        try {
          const matchLimaDate = new Date(m.utcDate).toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
          return matchLimaDate === tomorrowLima;
        } catch {
          return true;
        }
      });

      return filtered.length > 0 ? filtered : allMatches.slice(0, 15);
    } catch (e) {
      console.error('[FootballDataOrg] Error getMatchesTomorrow:', e);
      return [];
    }
  }

  async getStandings(competitionCode: string): Promise<StandingGroup[]> {
    try {
      const data = await this.fetchApi<{ standings: StandingGroup[] }>(
        `/competitions/${competitionCode}/standings`,
        900 // 15 min cache
      );
      return data.standings || [];
    } catch (e) {
      console.error(`[FootballDataOrg] Error getStandings for ${competitionCode}:`, e);
      return [];
    }
  }

  async getMatchById(id: string | number): Promise<MatchDetail | null> {
    try {
      const match = await this.fetchApi<MatchDetail>(`/matches/${id}`, 60);
      return match;
    } catch (e) {
      console.error(`[FootballDataOrg] Error getMatchById for ${id}:`, e);
      return null;
    }
  }
}
