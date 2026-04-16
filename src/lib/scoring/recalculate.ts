import { prisma } from "@/lib/db";
import { computeAllRankings, DEFAULT_CONFIG } from "./index";
import type { PlayerProfile, PlayerScore } from "./types";

/**
 * Recalculate rankings for all active players.
 * Loads data from DB, runs scoring engine, updates peakScore & tier.
 * Shared between the public /api/ranking route and admin result capture.
 */
export async function recalculateAllRankings(): Promise<{
  rankings: PlayerScore[];
  stats: { totalPlayers: number; eligible: number; pro: number; am: number; detri: number };
}> {
  const users = await prisma.user.findMany({
    where: { status: "active" },
    include: {
      matchRecords: { orderBy: { date: "asc" } },
    },
  });

  const profiles: PlayerProfile[] = users
    .filter((u) => u.matchRecords.length > 0)
    .map((u) => ({
      playerId: u.id,
      nombre: u.username,
      peakScore: u.peakScore,
      lastActiveDate:
        u.matchRecords.length > 0
          ? u.matchRecords[u.matchRecords.length - 1].date.toISOString()
          : u.createdAt.toISOString(),
      matches: u.matchRecords.map((r) => ({
        matchId: r.id,
        playerId: r.playerId,
        tournamentType: r.tournamentType as "detri" | "skills" | "evento" | "mixto" | "novice",
        date: r.date.toISOString(),
        kills: r.kills,
        deaths: r.deaths,
        position: r.position,
        totalTeams: r.totalTeams,
        teamKills: r.teamKills,
        teamPoints: r.teamPoints,
        bestKillsInTournament: r.bestKillsInTournament,
        bestTeamPointsInTournament: r.bestTeamPointsInTournament,
        lobbyParticipantScores: [],
      })),
    }));

  if (profiles.length === 0) {
    return {
      rankings: [],
      stats: { totalPlayers: users.length, eligible: 0, pro: 0, am: 0, detri: 0 },
    };
  }

  const rankings = computeAllRankings(profiles, DEFAULT_CONFIG);

  // Update peak scores and tiers for improved players
  for (const r of rankings) {
    const user = users.find((u) => u.id === r.playerId);
    if (user && r.scoreFinal > user.peakScore) {
      await prisma.user.update({
        where: { id: r.playerId },
        data: { peakScore: r.scoreFinal, tier: r.tier },
      });
    }
  }

  const eligible = rankings.filter((r) => !r.isCalibrating);

  return {
    rankings,
    stats: {
      totalPlayers: users.length,
      eligible: eligible.length,
      pro: eligible.filter((r) => r.tier === "PRO").length,
      am: eligible.filter((r) => r.tier === "AM").length,
      detri: eligible.filter((r) => r.tier === "Detri").length,
    },
  };
}
