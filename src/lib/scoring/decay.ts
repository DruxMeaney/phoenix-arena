import type { ScoringConfig } from "./types";

/** Compute temporal decay multiplier based on inactivity. */
export function computeDecay(
  lastActiveDate: string,
  currentDate: Date,
  config: ScoringConfig
): { decayMultiplier: number; isDecaying: boolean } {
  const last = new Date(lastActiveDate);
  const daysSince = Math.floor(
    (currentDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince < config.inactivityThresholdDays) {
    return { decayMultiplier: 1.0, isDecaying: false };
  }

  const monthsInactive =
    (daysSince - config.inactivityThresholdDays) / 30;
  const rawMultiplier = Math.pow(1 - config.decayRate, monthsInactive);
  const decayMultiplier = Math.max(rawMultiplier, config.decayFloor);

  return { decayMultiplier, isDecaying: true };
}

/** Apply decay to a score, respecting the floor relative to peak. */
export function applyDecay(
  score: number,
  peakScore: number,
  decayMultiplier: number,
  decayFloor: number
): number {
  const decayedScore = score * decayMultiplier;
  const floor = peakScore * decayFloor;
  return Math.max(decayedScore, floor);
}
