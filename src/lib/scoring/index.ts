/* ── Phoenix Arena Scoring Engine — Public API ───────────────── */

export type {
  MatchRecord,
  PlayerProfile,
  PlayerScore,
  PopulationData,
  ScoringConfig,
  ScoringPhase,
  Tier,
  TournamentType,
} from "./types";

export { DEFAULT_CONFIG } from "./types";

export {
  computeSimpleScore,
  computeFullScore,
  computePlayerScore,
  computeAllRankings,
} from "./engine";

export { computeDecay, applyDecay } from "./decay";
export { computeLobbyStrength, adjustPlacementByLobbyStrength } from "./lobby";
export { applyColdStartPrior } from "./coldstart";
export { computeWeightedConsistency } from "./recency";
export { computePercentiles, assignTier } from "./percentile";
