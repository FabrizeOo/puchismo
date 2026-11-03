// lib/football/provider.ts
// Capa abstracta para proveedores de datos deportivos (football-data.org, API-Football, etc.)

import { MatchItem, StandingGroup, MatchDetail } from './types';

export interface FootballDataProvider {
  readonly name: string;

  /**
   * Obtiene los partidos programados o jugados para la fecha actual (UTC/Local)
   */
  getMatchesToday(): Promise<MatchItem[]>;

  /**
   * Obtiene los partidos programados para el día siguiente
   */
  getMatchesTomorrow(): Promise<MatchItem[]>;

  /**
   * Obtiene la tabla de posiciones de una competición (ej. 'CL', 'PL', 'PD', 'SA', 'BL1')
   */
  getStandings(competitionCode: string): Promise<StandingGroup[]>;

  /**
   * Obtiene el detalle de un partido por su ID, incluyendo forma y datos del cruce
   */
  getMatchById(id: string | number): Promise<MatchDetail | null>;
}
