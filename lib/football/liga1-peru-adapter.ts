// lib/football/liga1-peru-adapter.ts
// Adaptador para la Liga 1 de Perú (Torneo Apertura / Clausura).
//
// football-data.org en sus planes estándar no incluye la Primera División de Perú (Liga 1).
// Este adaptador implementa la interfaz FootballDataProvider y sirve como plantilla
// para conectar un proveedor secundario (como API-Football / RapidAPI / SofaScore scraper)
// sin modificar la lógica del frontend.

import { FootballDataProvider } from './provider';
import { MatchItem, StandingGroup, MatchDetail } from './types';

export class Liga1PeruAdapter implements FootballDataProvider {
  readonly name = 'Liga 1 Perú (Custom/API-Football Adapter)';

  /**
   * CÓMO CONFIGURAR:
   * 1. Contratar API-Football (v3.football.api-sports.io) o servicio equivalente.
   * 2. Añadir en .env.local: LIGA1_API_KEY=tu_api_key
   * 3. Liga 1 ID en API-Football: League 281 (Perú Primera División).
   */

  async getMatchesToday(): Promise<MatchItem[]> {
    // [TODO]: Implementar petición a proveedor de Liga 1 cuando se contrate la clave.
    // Ejemplo:
    // const res = await fetch(`https://v3.football.api-sports.io/fixtures?league=281&season=2026&date=${today}`, {
    //   headers: { 'x-apisports-key': process.env.LIGA1_API_KEY! }
    // });
    return [];
  }

  async getMatchesTomorrow(): Promise<MatchItem[]> {
    // [TODO]: Implementar partidos de mañana de Liga 1
    return [];
  }

  async getStandings(_competitionCode: string = 'LIGA1'): Promise<StandingGroup[]> {
    // [TODO]: Implementar tabla acumulada / Apertura / Clausura de Liga 1
    return [];
  }

  async getMatchById(_id: string | number): Promise<MatchDetail | null> {
    // [TODO]: Implementar detalle y estadísticas de partidos de Liga 1
    return null;
  }
}
