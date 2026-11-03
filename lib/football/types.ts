// lib/football/types.ts
// Modelos de datos para partidos, ligas y clasificaciones

export interface TeamInfo {
  id: number;
  name: string;
  shortName?: string;
  tla?: string;
  crest?: string;
}

export interface MatchScore {
  fullTime: {
    home: number | null;
    away: number | null;
  };
  halfTime?: {
    home: number | null;
    away: number | null;
  };
}

export interface CompetitionSummary {
  id: number;
  name: string;
  code: string;
  emblem?: string;
}

export type MatchStatus = 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';

export interface MatchOdds {
  home: number;
  draw: number;
  away: number;
  exactScore?: number;
  bookmaker: string;
  isReal: boolean;
  lastUpdated?: string;
}

export interface MatchItem {
  id: number;
  utcDate: string; // ISO string UTC
  status: MatchStatus;
  matchday?: number;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  score: MatchScore;
  competition: CompetitionSummary;
  group?: string | null;
  odds?: MatchOdds;
}

export interface StandingTableEntry {
  position: number;
  team: TeamInfo;
  playedGames: number;
  form?: string | null;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface StandingGroup {
  stage: string;
  type: string;
  group?: string | null;
  table: StandingTableEntry[];
}

export interface MatchDetail extends MatchItem {
  head2head?: {
    numberOfMatches: number;
    totalGoals: number;
    homeTeamWins: number;
    awayTeamWins: number;
    draws: number;
  };
  recentForm?: {
    home?: string;
    away?: string;
  };
  homePosition?: number;
  awayPosition?: number;
}
