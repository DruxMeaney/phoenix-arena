/* ── Phoenix Arena Scoring System — Types ─────────────────────── */

export type TournamentType = "detri" | "skills" | "evento" | "mixto" | "novice";
export type Tier = "PRO" | "AM" | "Detri";
export type ScoringPhase = "simple" | "full";

/** A single match/tournament participation record. */
export interface MatchRecord {
  matchId: string;
  playerId: string;
  tournamentType: TournamentType;
  date: string; // ISO date
  kills: number;
  deaths: number;
  position: number; // 1-based placement
  totalTeams: number; // lobby size
  teamKills: number;
  teamPoints: number;
  bestKillsInTournament: number;
  bestTeamPointsInTournament: number;
  lobbyParticipantScores: number[]; // scores of all participants for lobby strength
}

/** Aggregated player state. */
export interface PlayerProfile {
  playerId: string;
  nombre: string;
  matches: MatchRecord[];
  lastActiveDate: string; // ISO date
  peakScore: number;
}

/** Tunable scoring configuration. All magic numbers in one place. */
export interface ScoringConfig {
  weights: {
    impacto: number;
    placement: number;
    consistencia: number;
    teamSuccess: number;
  };
  decayRate: number; // monthly decay percentage (0.05 = 5%)
  decayFloor: number; // minimum multiplier relative to peak (0.60 = 60%)
  inactivityThresholdDays: number; // days before decay starts
  coldStartK: number; // Bayesian confidence parameter
  recencyDecayFactor: number; // exponential weight for recent matches (0.9)
  lsfFactors: Record<TournamentType, number>;
  phase: ScoringPhase;
}

/** Default scoring configuration. */
export const DEFAULT_CONFIG: ScoringConfig = {
  weights: {
    impacto: 0.50,
    placement: 0.25,
    consistencia: 0.15,
    teamSuccess: 0.10,
  },
  decayRate: 0.05,
  decayFloor: 0.60,
  inactivityThresholdDays: 30,
  coldStartK: 4,
  recencyDecayFactor: 0.9,
  lsfFactors: {
    detri: 1.0,
    skills: 1.5,
    evento: 1.5,
    mixto: 1.3,
    novice: 0.9,
  },
  phase: "simple",
};

/** Computed score output for a player. */
export interface PlayerScore {
  rank: number;
  playerId: string;
  nombre: string;
  tier: Tier;
  participaciones: number;
  impacto: number;
  placement: number;
  consistencia: number;
  teamSuccess: number;
  scoreFinal: number;
  percentil: number;
  isCalibrating: boolean; // < coldStartK matches
  isDecaying: boolean; // inactive > threshold
  decayMultiplier: number;
  peakScore: number;
  phase: ScoringPhase;
}

/** Population-level statistics needed for scoring context. */
export interface PopulationData {
  averageScore: number;
  globalMeanScore: number; // mean score across all eligible players
  totalEligible: number;
}
