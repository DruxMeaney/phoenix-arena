/** Platform commission retained from each prize pool. */
export const PLATFORM_COMMISSION = 0.1;

/** Predefined payout percentages by placement (1st, 2nd, ...). Must sum to 100. */
export const PRESET_PRIZE_SPLITS: Record<string, number[]> = {
  winner_takes_all: [100],
  top_3: [60, 25, 15],
  top_5: [40, 25, 15, 12, 8],
  top_8: [40, 22, 13, 8, 7, 5, 3, 2],
};

export const PRIZE_DISTRIBUTION_VALUES = [
  ...Object.keys(PRESET_PRIZE_SPLITS),
  "custom",
] as const;

/**
 * Resolve the payout percentages for a tournament given its `prizeDistribution`
 * preset and (for custom) the JSON-encoded `customPrizeSplits` array.
 * Falls back to winner-takes-all if invalid.
 */
export function resolvePrizeSplits(
  distribution: string | null | undefined,
  customJson: string | null | undefined,
): number[] {
  if (distribution === "custom") {
    if (!customJson) return [100];
    try {
      const parsed = JSON.parse(customJson);
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed.every((n) => typeof n === "number" && n >= 0)
      ) {
        return parsed;
      }
    } catch {
      // fall through
    }
    return [100];
  }
  return PRESET_PRIZE_SPLITS[distribution ?? "winner_takes_all"] ?? [100];
}

/**
 * Validate a custom splits array. Returns null if valid, or an error message.
 */
export function validateCustomSplits(splits: unknown): string | null {
  if (!Array.isArray(splits)) return "Debe ser un arreglo de porcentajes";
  if (splits.length === 0) return "Debe tener al menos un porcentaje";
  if (splits.length > 32) return "Maximo 32 posiciones";
  if (!splits.every((n) => typeof n === "number" && n >= 0)) {
    return "Todos los porcentajes deben ser numeros >= 0";
  }
  const total = (splits as number[]).reduce((s, n) => s + n, 0);
  if (Math.abs(total - 100) > 0.01) return "Los porcentajes deben sumar 100";
  return null;
}
