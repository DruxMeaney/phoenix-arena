import type { Tier } from "./types";

interface ScoreEntry {
  playerId: string;
  scoreFinal: number;
  participaciones: number;
}

interface PercentileResult {
  playerId: string;
  percentil: number;
  tier: Tier;
}

/** Compute percentiles and assign tiers. Only eligible players (4+ matches) count. */
export function computePercentiles(
  scores: ScoreEntry[],
  minParticipations: number = 4
): PercentileResult[] {
  // Separate eligible from calibrating
  const eligible = scores.filter(
    (s) => s.participaciones >= minParticipations
  );
  const calibrating = scores.filter(
    (s) => s.participaciones < minParticipations
  );

  // Sort eligible by scoreFinal ascending for percentile calculation
  const sorted = [...eligible].sort(
    (a, b) => a.scoreFinal - b.scoreFinal
  );

  const eligibleCount = sorted.length;

  const eligibleResults: PercentileResult[] = sorted.map((s, i) => {
    const percentil =
      eligibleCount <= 1 ? 50 : (i / (eligibleCount - 1)) * 100;
    return {
      playerId: s.playerId,
      percentil: Math.round(percentil * 10) / 10,
      tier: assignTier(percentil),
    };
  });

  // Calibrating players get 0 percentile and Detri tier
  const calibratingResults: PercentileResult[] = calibrating.map((s) => ({
    playerId: s.playerId,
    percentil: 0,
    tier: "Detri" as Tier,
  }));

  return [...eligibleResults, ...calibratingResults];
}

/** Assign tier based on percentile thresholds. */
export function assignTier(percentil: number): Tier {
  if (percentil >= 80) return "PRO";
  if (percentil >= 40) return "AM";
  return "Detri";
}
