import type {
  MatchRecord,
  PlayerProfile,
  PlayerScore,
  PopulationData,
  ScoringConfig,
} from "./types";
import { computeDecay, applyDecay } from "./decay";
import { computeLobbyStrength, adjustPlacementByLobbyStrength } from "./lobby";
import { applyColdStartPrior } from "./coldstart";
import { computeWeightedConsistency } from "./recency";
import { computePercentiles } from "./percentile";

/* ── Phase 1: Simple Score ─────────────────────────────────────── */

/** Simple scoring formula for MVP validation (Week 1-2). */
export function computeSimpleScore(match: MatchRecord): number {
  const killsScore = match.kills * 10;
  const placementScore =
    match.totalTeams > 1
      ? (1 - (match.position - 1) / match.totalTeams) * 100
      : 50;
  return killsScore + placementScore;
}

/* ── Phase 2: Full Component Scores ────────────────────────────── */

/** Compute impacto score for a single match. */
function computeMatchImpacto(match: MatchRecord): number {
  const bestKills = match.bestKillsInTournament || 1;
  const teamKills = match.teamKills || match.kills || 1;

  const globalShare = (match.kills / bestKills) * 100;
  const teamShare = (match.kills / teamKills) * 100;

  return 0.7 * Math.min(globalShare, 100) + 0.3 * Math.min(teamShare, 100);
}

/** Compute raw placement score for a single match. */
function computeMatchPlacement(match: MatchRecord): number {
  if (match.totalTeams <= 1) return 50;
  return (1 - (match.position - 1) / match.totalTeams) * 100;
}

/** Compute team success score for a single match. */
function computeMatchTeamSuccess(match: MatchRecord): number {
  const bestPts = match.bestTeamPointsInTournament || 1;
  return Math.min((match.teamPoints / bestPts) * 100, 100);
}

/** Average a numeric array. Returns 0 for empty arrays. */
function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/** Compute full scoring components for a player's match history. */
export function computeFullScore(
  matches: MatchRecord[],
  config: ScoringConfig,
  globalMeanScore: number
): {
  impacto: number;
  placement: number;
  consistencia: number;
  teamSuccess: number;
  baseScore: number;
} {
  if (matches.length === 0) {
    return { impacto: 0, placement: 0, consistencia: 0, teamSuccess: 0, baseScore: 0 };
  }

  // Filter out novice matches from main ranking
  const rankableMatches = matches.filter((m) => m.tournamentType !== "novice");
  if (rankableMatches.length === 0) {
    return { impacto: 0, placement: 0, consistencia: 0, teamSuccess: 0, baseScore: 0 };
  }

  // Per-match scores
  const impactoScores = rankableMatches.map(computeMatchImpacto);
  const placementScores = rankableMatches.map((m) => {
    const raw = computeMatchPlacement(m);
    const lobbyStrength = computeLobbyStrength(
      m.lobbyParticipantScores,
      globalMeanScore
    );
    return adjustPlacementByLobbyStrength(raw, lobbyStrength);
  });
  const teamSuccessScores = rankableMatches.map(computeMatchTeamSuccess);

  // Aggregates
  const impacto = mean(impactoScores);
  const placement = mean(placementScores);
  const teamSuccess = mean(teamSuccessScores);

  // Consistency via weighted recency (oldest-first order)
  const matchScoresForConsistency = rankableMatches.map(
    (m) => computeSimpleScore(m) // use simple score as per-match performance metric
  );
  const consistencia = computeWeightedConsistency(
    matchScoresForConsistency,
    config.recencyDecayFactor
  );

  // Apply LSF: weighted average of LSF factors across match types
  const lsfWeighted = mean(
    rankableMatches.map((m) => config.lsfFactors[m.tournamentType] ?? 1.0)
  );

  const w = config.weights;
  const rawBase =
    w.impacto * impacto +
    w.placement * placement +
    w.consistencia * consistencia +
    w.teamSuccess * teamSuccess;

  const baseScore = rawBase * lsfWeighted;

  return { impacto, placement, consistencia, teamSuccess, baseScore };
}

/* ── Orchestrator ──────────────────────────────────────────────── */

/** Compute complete score for a single player. */
export function computePlayerScore(
  player: PlayerProfile,
  config: ScoringConfig,
  populationData: PopulationData,
  currentDate: Date
): Omit<PlayerScore, "rank" | "percentil" | "tier"> {
  const rankableMatches = player.matches.filter(
    (m) => m.tournamentType !== "novice"
  );
  const matchCount = rankableMatches.length;

  let impacto = 0;
  let placement = 0;
  let consistencia = 0;
  let teamSuccess = 0;
  let rawScore = 0;

  if (config.phase === "simple") {
    // Phase 1: average simple scores
    const simpleScores = rankableMatches.map(computeSimpleScore);
    rawScore = mean(simpleScores);
    impacto = rawScore; // simplified: all weight on kills+placement
    placement = rawScore;
    consistencia = 50;
    teamSuccess = 50;
  } else {
    // Phase 2: full scoring
    const full = computeFullScore(
      rankableMatches,
      config,
      populationData.globalMeanScore
    );
    impacto = full.impacto;
    placement = full.placement;
    consistencia = full.consistencia;
    teamSuccess = full.teamSuccess;
    rawScore = full.baseScore;
  }

  // Cold start prior
  const { effectiveScore, isCalibrating } = applyColdStartPrior(
    rawScore,
    matchCount,
    populationData.averageScore,
    config.coldStartK
  );

  // Temporal decay
  const { decayMultiplier, isDecaying } = computeDecay(
    player.lastActiveDate,
    currentDate,
    config
  );

  const scoreFinal = applyDecay(
    effectiveScore,
    player.peakScore,
    decayMultiplier,
    config.decayFloor
  );

  return {
    playerId: player.playerId,
    nombre: player.nombre,
    participaciones: matchCount,
    impacto: Math.round(impacto * 10) / 10,
    placement: Math.round(placement * 10) / 10,
    consistencia: Math.round(consistencia * 10) / 10,
    teamSuccess: Math.round(teamSuccess * 10) / 10,
    scoreFinal: Math.round(scoreFinal * 10) / 10,
    isCalibrating,
    isDecaying,
    decayMultiplier: Math.round(decayMultiplier * 100) / 100,
    peakScore: Math.max(player.peakScore, scoreFinal),
    phase: config.phase,
  };
}

/** Compute rankings for all players. Returns sorted by scoreFinal desc. */
export function computeAllRankings(
  players: PlayerProfile[],
  config: ScoringConfig,
  currentDate: Date = new Date()
): PlayerScore[] {
  // First pass: compute individual scores
  const populationData: PopulationData = {
    averageScore: 50, // default prior
    globalMeanScore: 50,
    totalEligible: 0,
  };

  // Compute raw scores to establish population stats
  const rawScores = players.map((p) =>
    computePlayerScore(p, config, populationData, currentDate)
  );

  // Update population data from first pass
  const eligible = rawScores.filter(
    (s) => s.participaciones >= config.coldStartK
  );
  if (eligible.length > 0) {
    populationData.averageScore = mean(eligible.map((s) => s.scoreFinal));
    populationData.globalMeanScore = populationData.averageScore;
    populationData.totalEligible = eligible.length;
  }

  // Second pass: recompute with real population data
  const finalScores = players.map((p) =>
    computePlayerScore(p, config, populationData, currentDate)
  );

  // Assign percentiles and tiers
  const percentiles = computePercentiles(
    finalScores.map((s) => ({
      playerId: s.playerId,
      scoreFinal: s.scoreFinal,
      participaciones: s.participaciones,
    })),
    config.coldStartK
  );

  // Merge percentiles into scores
  const scored: PlayerScore[] = finalScores.map((s) => {
    const p = percentiles.find((pc) => pc.playerId === s.playerId);
    return {
      ...s,
      rank: 0, // assigned below
      percentil: p?.percentil ?? 0,
      tier: p?.tier ?? "Detri",
    };
  });

  // Sort by scoreFinal descending, assign ranks
  scored.sort((a, b) => b.scoreFinal - a.scoreFinal);
  scored.forEach((s, i) => {
    s.rank = i + 1;
  });

  return scored;
}
