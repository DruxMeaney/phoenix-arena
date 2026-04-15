/**
 * Weighted recency for consistency scoring.
 * Recent matches weigh more than older ones using exponential decay.
 * Returns a 0-100 score where higher = more consistent.
 */
export function computeWeightedConsistency(
  matchScores: number[], // ordered oldest-first
  recencyFactor: number // e.g. 0.9
): number {
  if (matchScores.length === 0) return 0;
  if (matchScores.length === 1) return 50; // neutral for single match

  const total = matchScores.length;

  // Assign exponential weights: most recent = 1.0, previous = 0.9, etc.
  const weights = matchScores.map(
    (_, i) => Math.pow(recencyFactor, total - 1 - i)
  );
  const weightSum = weights.reduce((a, b) => a + b, 0);

  // Weighted mean
  const weightedMean =
    matchScores.reduce((sum, score, i) => sum + score * weights[i], 0) /
    weightSum;

  // Weighted variance
  const weightedVariance =
    matchScores.reduce(
      (sum, score, i) =>
        sum + weights[i] * Math.pow(score - weightedMean, 2),
      0
    ) / weightSum;

  const weightedStdDev = Math.sqrt(weightedVariance);

  // Invert to 0-100: low deviation = high consistency
  return Math.max(0, Math.min(100, 100 - weightedStdDev));
}
