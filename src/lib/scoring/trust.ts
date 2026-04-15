/**
 * Trust Score — Anti-smurf system.
 * Detects and prevents: identity spoofing, account sharing, smurfing.
 *
 * Formula:
 *   trust_score = weighted_sum([
 *     account_age * 0.20,
 *     tournaments_played * 0.25,
 *     historical_consistency * 0.25,
 *     linked_accounts * 0.15,
 *     clean_history * 0.15
 *   ])
 *
 * Access rules:
 *   Trust < 30  → Solo Amateur
 *   Trust 30-60 → Amateur + Detri con monitoreo
 *   Trust > 60  → Acceso completo
 *   Trust > 80  → Badge "Verified Player"
 */

export interface TrustInput {
  accountAgeDays: number;
  tournamentsPlayed: number;
  historicalConsistency: number; // 0-100 from recency module
  hasDiscordLinked: boolean;
  hasActivisionLinked: boolean;
  hasTwitchLinked: boolean;
  disputesLost: number;
  disputesTotal: number;
  flaggedForReview: boolean;
}

export interface TrustResult {
  score: number; // 0-100
  level: "restricted" | "monitored" | "full" | "verified";
  canPlayPro: boolean;
  canPlayAm: boolean;
  isFlagged: boolean;
  reasons: string[];
}

export function computeTrustScore(input: TrustInput): TrustResult {
  const reasons: string[] = [];

  // Account age: 0-100, maxes at 180 days (6 months)
  const ageScore = Math.min(100, (input.accountAgeDays / 180) * 100);

  // Tournaments played: 0-100, maxes at 20 tournaments
  const volumeScore = Math.min(100, (input.tournamentsPlayed / 20) * 100);

  // Historical consistency: direct from recency module (0-100)
  const consistencyScore = input.historicalConsistency;

  // Linked accounts: each one adds 33.3 points, max 100
  const linkedCount =
    (input.hasDiscordLinked ? 1 : 0) +
    (input.hasActivisionLinked ? 1 : 0) +
    (input.hasTwitchLinked ? 1 : 0);
  const linkedScore = Math.min(100, (linkedCount / 3) * 100);

  // Clean history: starts at 100, loses points per dispute lost
  const disputePenalty = input.disputesTotal > 0
    ? (input.disputesLost / input.disputesTotal) * 50
    : 0;
  const cleanScore = Math.max(0, 100 - disputePenalty - (input.flaggedForReview ? 30 : 0));

  // Weighted sum
  const score = Math.round(
    ageScore * 0.20 +
    volumeScore * 0.25 +
    consistencyScore * 0.25 +
    linkedScore * 0.15 +
    cleanScore * 0.15
  );

  // Determine level and access
  let level: TrustResult["level"];
  if (score > 80) {
    level = "verified";
  } else if (score > 60) {
    level = "full";
  } else if (score >= 30) {
    level = "monitored";
    reasons.push("Cuenta en periodo de monitoreo");
  } else {
    level = "restricted";
    reasons.push("Trust Score bajo — acceso limitado a torneos Amateur");
  }

  if (input.flaggedForReview) {
    reasons.push("Cuenta marcada para revision por actividad inusual");
  }

  if (input.disputesLost > 2) {
    reasons.push(`${input.disputesLost} disputas perdidas afectan tu Trust Score`);
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    level,
    canPlayPro: level === "verified" || level === "full",
    canPlayAm: level !== "restricted",
    isFlagged: input.flaggedForReview,
    reasons,
  };
}

/**
 * Anomaly detection — flags suspicious new accounts.
 * If a new player's score is > 2.5 standard deviations above their cohort mean
 * and their trust score is low, flag for review.
 */
export function detectAnomaly(
  playerScore: number,
  cohortMean: number,
  cohortStdDev: number,
  trustScore: number
): { isSuspicious: boolean; zScore: number } {
  if (cohortStdDev === 0) return { isSuspicious: false, zScore: 0 };

  const zScore = (playerScore - cohortMean) / cohortStdDev;
  const isSuspicious = zScore > 2.5 && trustScore < 50;

  return { isSuspicious, zScore: Math.round(zScore * 100) / 100 };
}

/**
 * Estimate custom KD from public KD for new players.
 * Public lobbies have inflated stats — custom KD is roughly 25% of public KD.
 */
export function estimateCustomKD(publicKD: number): number {
  return publicKD * 0.25;
}
