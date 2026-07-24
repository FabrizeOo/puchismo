import { NextResponse } from 'next/server';

const BASE_URL = 'https://api.football-data.org/v4';

async function fetchAPI(endpoint: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY ?? '' },
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

const FALLBACK_MATCHES = [
  { id: 1001, utcDate: '2026-06-20T18:00:00Z', status: 'SCHEDULED', homeTeam: { name: 'Argentina', tla: 'ARG', crest: '' }, awayTeam: { name: 'España', tla: 'ESP', crest: '' }, score: { fullTime: { home: null, away: null } }, competition: { name: 'FIFA World Cup 2026' }, group: 'Grupo A' },
  { id: 1002, utcDate: '2026-06-20T21:00:00Z', status: 'SCHEDULED', homeTeam: { name: 'Brasil', tla: 'BRA', crest: '' }, awayTeam: { name: 'Francia', tla: 'FRA', crest: '' }, score: { fullTime: { home: null, away: null } }, competition: { name: 'FIFA World Cup 2026' }, group: 'Grupo B' },
  { id: 1003, utcDate: '2026-06-19T18:00:00Z', status: 'FINISHED', homeTeam: { name: 'México', tla: 'MEX', crest: '' }, awayTeam: { name: 'Alemania', tla: 'GER', crest: '' }, score: { fullTime: { home: 2, away: 1 } }, competition: { name: 'FIFA World Cup 2026' }, group: 'Grupo C' },
  { id: 1004, utcDate: '2026-06-19T21:00:00Z', status: 'FINISHED', homeTeam: { name: 'Portugal', tla: 'POR', crest: '' }, awayTeam: { name: 'Uruguay', tla: 'URU', crest: '' }, score: { fullTime: { home: 3, away: 1 } }, competition: { name: 'FIFA World Cup 2026' }, group: 'Grupo D' },
  { id: 1005, utcDate: '2026-06-21T18:00:00Z', status: 'SCHEDULED', homeTeam: { name: 'Colombia', tla: 'COL', crest: '' }, awayTeam: { name: 'Inglaterra', tla: 'ENG', crest: '' }, score: { fullTime: { home: null, away: null } }, competition: { name: 'FIFA World Cup 2026' }, group: 'Grupo E' },
  { id: 1006, utcDate: '2026-06-21T21:00:00Z', status: 'SCHEDULED', homeTeam: { name: 'Estados Unidos', tla: 'USA', crest: '' }, awayTeam: { name: 'Italia', tla: 'ITA', crest: '' }, score: { fullTime: { home: null, away: null } }, competition: { name: 'FIFA World Cup 2026' }, group: 'Grupo F' },
];

export async function GET() {
  try {
    const [liveData, scheduledData, finishedData] = await Promise.allSettled([
      fetchAPI('/competitions/WC/matches?status=LIVE'),
      fetchAPI('/competitions/WC/matches?status=SCHEDULED'),
      fetchAPI('/competitions/WC/matches?status=FINISHED'),
    ]);

    const live = liveData.status === 'fulfilled' ? liveData.value.matches || [] : [];
    const scheduled = scheduledData.status === 'fulfilled' ? scheduledData.value.matches || [] : [];
    const finished = finishedData.status === 'fulfilled' ? finishedData.value.matches?.slice(-8) || [] : [];
    const allMatches = [...live, ...scheduled.slice(0, 12), ...finished];

    if (allMatches.length === 0) {
      return NextResponse.json({ matches: FALLBACK_MATCHES, isFallback: true });
    }
    return NextResponse.json({ matches: allMatches, isFallback: false });
  } catch (error) {
    console.error('Matches API error:', error);
    return NextResponse.json({ matches: FALLBACK_MATCHES, isFallback: true });
  }
}
