/** Compute lobby strength factor from participant scores. */
export function computeLobbyStrength(
  lobbyParticipantScores: number[],
  globalMeanScore: number
): number {
  if (lobbyParticipantScores.length === 0 || globalMeanScore === 0) {
    return 1.0;
  }

  const lobbyMean =
    lobbyParticipantScores.reduce((a, b) => a + b, 0) /
    lobbyParticipantScores.length;

  const strengthFactor = lobbyMean / globalMeanScore;

  // Clamp between 0.5 and 2.0 to prevent extreme values
  return Math.max(0.5, Math.min(2.0, strengthFactor));
}

/** Adjust raw placement score by lobby strength factor. */
export function adjustPlacementByLobbyStrength(
  rawPlacement: number,
  strengthFactor: number
): number {
  return Math.max(0, Math.min(100, rawPlacement * strengthFactor));
}
