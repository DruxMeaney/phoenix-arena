/**
 * Bayesian cold start prior.
 * Blends player's average with population average using shrinkage.
 * At 0 matches → population average.
 * At k matches → 50/50 blend.
 * At 2k+ matches → player's own score dominates.
 */
export function applyColdStartPrior(
  playerAvgScore: number,
  matchCount: number,
  populationAvgScore: number,
  k: number
): { effectiveScore: number; isCalibrating: boolean } {
  if (matchCount === 0) {
    return { effectiveScore: populationAvgScore, isCalibrating: true };
  }

  const effectiveScore =
    (matchCount * playerAvgScore + k * populationAvgScore) / (matchCount + k);
  const isCalibrating = matchCount < k;

  return { effectiveScore, isCalibrating };
}
