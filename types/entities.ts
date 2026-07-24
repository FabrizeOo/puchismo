export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  flag?: string;
  country?: string;
}

export interface Score {
  home: number | null;
  away: number | null;
}

export interface Match {
  id: number;
  utcDate: string;
  status: 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'SUSPENDED' | 'CANCELLED';
  matchday?: number;
  stage: string;
  group?: string;
  homeTeam: Team & { flag?: string; code?: string };
  awayTeam: Team & { flag?: string; code?: string };
  score: {
    winner?: string | null;
    duration?: string;
    fullTime: Score;
    halfTime: Score;
    extraTime?: Score;
    penalties?: Score;
  };
  minute?: number;
}

export interface Standing {
  position: number;
  team: Team;
  playedGames: number;
  form?: string;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface GroupStandings {
  stage: string;
  type: string;
  group: string;
  table: Standing[];
}

export interface Competition {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string;
}

export interface SocialPlatform {
  name: string;
  url: string;
  followers: string;
  color: string;
  description: string;
}

export interface BracketMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  round: 'ROUND_OF_16' | 'QUARTER_FINAL' | 'SEMI_FINAL' | 'FINAL';
  date?: string;
}
