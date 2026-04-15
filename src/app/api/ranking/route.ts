import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeAllRankings, DEFAULT_CONFIG } from "@/lib/scoring";
import type { PlayerProfile } from "@/lib/scoring";

/** GET /api/ranking — Compute and return full rankings */
export async function GET() {
  // Fetch all users with their ranking match records
  const users = await prisma.user.findMany({
    where: { status: "active" },
    include: {
      matchRecords: { orderBy: { date: "asc" } },
    },
  });

  // Transform to PlayerProfile format
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
        lobbyParticipantScores: [], // populated when lobby data is available
      })),
    }));

  if (profiles.length === 0) {
    return NextResponse.json({
      rankings: [],
      stats: { totalPlayers: users.length, eligible: 0, pro: 0, am: 0, detri: 0 },
    });
  }

  const rankings = computeAllRankings(profiles, DEFAULT_CONFIG);

  // Update peak scores in DB for players that improved
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

  return NextResponse.json({
    rankings,
    stats: {
      totalPlayers: users.length,
      eligible: eligible.length,
      pro: eligible.filter((r) => r.tier === "PRO").length,
      am: eligible.filter((r) => r.tier === "AM").length,
      detri: eligible.filter((r) => r.tier === "Detri").length,
    },
  });
}
