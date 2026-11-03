// lib/football/service.ts
// Servicio unificado de datos deportivos con soporte para zona horaria de Lima (America/Lima)

import { FootballDataOrgProvider } from './football-data-org';
import { FootballDataProvider } from './provider';
import { MatchItem, StandingGroup, MatchDetail } from './types';
import { attachOddsToMatches, getMatchOdds } from './odds-service';

export const SUPPORTED_LEAGUES: Record<
  string,
  { code: string; name: string; country: string; flag: string }
> = {
  'champions-league': {
    code: 'CL',
    name: 'UEFA Champions League',
    country: 'Europa',
    flag: 'UEFA',
  },
  'premier-league': {
    code: 'PL',
    name: 'Premier League',
    country: 'Inglaterra',
    flag: 'ENG',
  },
  'la-liga': {
    code: 'PD',
    name: 'LaLiga EA Sports',
    country: 'España',
    flag: 'ESP',
  },
  'serie-a': {
    code: 'SA',
    name: 'Serie A',
    country: 'Italia',
    flag: 'ITA',
  },
  'bundesliga': {
    code: 'BL1',
    name: 'Bundesliga',
    country: 'Alemania',
    flag: 'GER',
  },
};

// Instancia por defecto del proveedor principal
const primaryProvider: FootballDataProvider = new FootballDataOrgProvider();

/**
 * Convierte una fecha UTC a hora legible en zona horaria America/Lima (UTC-5)
 */
export function formatLimaTime(utcIsoString: string): {
  time: string;
  dateStr: string;
  fullLimaStr: string;
} {
  try {
    const d = new Date(utcIsoString);
    const timeFormatter = new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const dateFormatter = new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const time = timeFormatter.format(d);
    const dateStr = dateFormatter.format(d);

    return {
      time,
      dateStr,
      fullLimaStr: `${dateStr} - ${time} (Hora Lima)`,
    };
  } catch {
    return {
      time: 'Por definir',
      dateStr: '',
      fullLimaStr: 'Hora de Lima',
    };
  }
}

/**
 * Partidos de Hoy
 * @param bypassCache Forzar llamada sin usar caché
 * @param withOdds Si es true, añade cuotas reales de apuestas (utilizado en la Quiniela)
 */
export async function getMatchesToday(
  bypassCache: boolean = false,
  withOdds: boolean = false
): Promise<MatchItem[]> {
  try {
    const matches = await (primaryProvider as any).getMatchesToday(bypassCache);
    if (!matches || matches.length === 0) return [];
    if (!withOdds) return matches;
    return await attachOddsToMatches(matches);
  } catch (err) {
    console.error('Error al obtener partidos de hoy:', err);
    return [];
  }
}

/**
 * Partidos de Mañana
 * @param bypassCache Forzar llamada sin usar caché
 * @param withOdds Si es true, añade cuotas reales de apuestas (utilizado en la Quiniela)
 */
export async function getMatchesTomorrow(
  bypassCache: boolean = false,
  withOdds: boolean = false
): Promise<MatchItem[]> {
  try {
    const matches = await (primaryProvider as any).getMatchesTomorrow(bypassCache);
    if (!matches || matches.length === 0) return [];
    if (!withOdds) return matches;
    return await attachOddsToMatches(matches);
  } catch (err) {
    console.error('Error al obtener partidos de mañana:', err);
    return [];
  }
}

/**
 * Tabla de posiciones para una liga admitida
 */
export async function getLeagueStandings(leagueSlug: string): Promise<{
  league: { code: string; name: string; country: string; flag: string };
  groups: StandingGroup[];
} | null> {
  const league = SUPPORTED_LEAGUES[leagueSlug];
  if (!league) return null;

  try {
    const groups = await primaryProvider.getStandings(league.code);
    return { league, groups };
  } catch (err) {
    console.error(`Error al obtener tabla para ${leagueSlug}:`, err);
    return { league, groups: [] };
  }
}

/**
 * Ficha de partido y texto SEO autogenerado
 */
export async function getMatchDetails(matchId: string | number): Promise<{
  match: MatchDetail | null;
  seoAnalysis: string;
}> {
  try {
    const match = await primaryProvider.getMatchById(matchId);
    if (!match) {
      return { match: null, seoAnalysis: '' };
    }

    const { fullLimaStr } = formatLimaTime(match.utcDate);
    const home = match.homeTeam.name;
    const away = match.awayTeam.name;
    const comp = match.competition.name;

    // Obtener cuotas reales de mercado
    try {
      const odds = await getMatchOdds(home, away, match.competition.code, match.id);
      match.odds = odds;
    } catch {
      // Ignorar si falla
    }

    // Bloque SEO de análisis deportivo autogenerado
    const seoAnalysis = `El encuentro entre ${home} y ${away} corresponde a una nueva jornada de ${comp}, programado para el ${fullLimaStr}. Ambos planteles llegan con la consigna de sumar puntos determinantes en la tabla de clasificación. En Puchismo vivimos el análisis previo, formaciones probables, seguimiento minuto a minuto y debate en caliente con la comunidad de Bepucho. ¡Conéctate a nuestro Discord y transmisiones en Kick para reaccionar juntos a cada jugada!`;

    return { match, seoAnalysis };
  } catch (err) {
    console.error(`Error al obtener detalle del partido ${matchId}:`, err);
    return { match: null, seoAnalysis: '' };
  }
}
