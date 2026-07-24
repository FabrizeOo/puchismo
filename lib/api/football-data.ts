// lib/api/football-data.ts
// Cliente para Football-Data.org API
// Requiere FOOTBALL_DATA_API_KEY en .env.local

const BASE_URL = 'https://api.football-data.org/v4';

async function apiFetch(endpoint: string) {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  if (!apiKey) {
    throw new Error('FOOTBALL_DATA_API_KEY no está configurada en .env.local');
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'X-Auth-Token': apiKey,
    },
    next: { revalidate: 300 }, // Cache de 5 minutos
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API Error ${res.status}: ${error}`);
  }

  return res.json();
}

export async function getCompetitions() {
  const data = await apiFetch('/competitions');
  return data.competitions;
}

export async function getStandings(competitionId: string = 'WC') {
  const data = await apiFetch(`/competitions/${competitionId}/standings`);
  return data.standings;
}

export async function getMatches(
  competitionId: string = 'WC',
  filters?: {
    status?: 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED';
    dateFrom?: string;
    dateTo?: string;
  }
) {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);

  const query = params.toString() ? `?${params.toString()}` : '';
  const data = await apiFetch(`/competitions/${competitionId}/matches${query}`);
  return data.matches;
}

export async function getTeam(teamId: string) {
  return apiFetch(`/teams/${teamId}`);
}

// In-memory cache simple (se resetea con cada deploy)
const cache = new Map<string, { data: unknown; expiresAt: number }>();

export function setCache(key: string, data: unknown, ttlSeconds: number) {
  cache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export function getCache(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}
