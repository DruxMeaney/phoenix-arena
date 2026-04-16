import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { recalculateAllRankings } from "@/lib/scoring/recalculate";

const PLACEMENT_POINTS: Record<number, number> = {
  1: 100, 2: 80, 3: 70, 4: 60, 5: 50,
  6: 40, 7: 30, 8: 20, 9: 10, 10: 10,
  11: 10, 12: 10, 13: 10, 14: 10, 15: 10, 16: 10,
};

function getPlacementPoints(position: number): number {
  return PLACEMENT_POINTS[position] ?? 10;
}

/** GET /api/admin/tournaments/[id]/results — Get tournament results */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      entries: {
        include: { user: { select: { id: true, username: true, avatar: true, tier: true, region: true } } },
      },
      results: {
        include: { user: { select: { id: true, username: true, avatar: true } } },
      },
    },
  });

  if (!tournament) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });

  return NextResponse.json({ tournament });
}

/** POST /api/admin/tournaments/[id]/results — Capture tournament results and recalculate rankings */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { results, totalTeams, evidenceUrl } = body as {
    results: Array<{
      userId: string;
      kills: number;
      deaths: number;
      placement: number;
      evidenceUrl?: string;
      notes?: string;
    }>;
    totalTeams: number;
    evidenceUrl?: string;
  };

  if (!results || results.length === 0) {
    return NextResponse.json({ error: "Se requieren resultados" }, { status: 400 });
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: { entries: true },
  });

  if (!tournament) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });

  // Compute derived fields
  const bestKillsInTournament = Math.max(...results.map((r) => r.kills), 0);
  const allTeamPoints = results.map((r) => (r.kills * 10) + getPlacementPoints(r.placement));
  const bestTeamPointsInTournament = Math.max(...allTeamPoints, 0);
  const totalKills = results.reduce((sum, r) => sum + r.kills, 0);
  const effectiveTotalTeams = totalTeams || tournament.filledSlots || results.length;

  // Delete old RankingMatchRecords for this tournament (for re-submission)
  await prisma.rankingMatchRecord.deleteMany({
    where: { tournamentId: id },
  });

  // Process each player result
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const playerTeamPoints = (r.kills * 10) + getPlacementPoints(r.placement);

    // Upsert TournamentResult
    await prisma.tournamentResult.upsert({
      where: { tournamentId_userId: { tournamentId: id, userId: r.userId } },
      update: {
        kills: r.kills,
        deaths: r.deaths,
        placement: r.placement,
        teamKills: totalKills,
        teamPoints: playerTeamPoints,
        evidenceUrl: r.evidenceUrl || null,
        notes: r.notes || null,
      },
      create: {
        tournamentId: id,
        userId: r.userId,
        kills: r.kills,
        deaths: r.deaths,
        placement: r.placement,
        teamKills: totalKills,
        teamPoints: playerTeamPoints,
        evidenceUrl: r.evidenceUrl || null,
        notes: r.notes || null,
      },
    });

    // Create RankingMatchRecord (feeds the scoring engine)
    await prisma.rankingMatchRecord.create({
      data: {
        playerId: r.userId,
        tournamentId: id,
        tournamentType: tournament.tournamentType,
        kills: r.kills,
        deaths: r.deaths,
        position: r.placement,
        totalTeams: effectiveTotalTeams,
        teamKills: totalKills,
        teamPoints: playerTeamPoints,
        bestKillsInTournament,
        bestTeamPointsInTournament,
      },
    });

    // Update tournament entry placement
    await prisma.tournamentEntry.updateMany({
      where: { tournamentId: id, userId: r.userId },
      data: { placement: r.placement },
    });

    // Award XP based on placement
    const xpReward = r.placement === 1 ? 100 : r.placement <= 3 ? 50 : 25;
    await prisma.user.update({
      where: { id: r.userId },
      data: {
        xp: { increment: xpReward },
        seasonXp: { increment: xpReward },
        lastSeen: new Date(),
      },
    });

    // Create feed event per player
    await prisma.feedEvent.create({
      data: {
        userId: r.userId,
        type: r.placement === 1 ? "tournament_win" : "tournament_join",
        title: r.placement === 1 ? "Victoria en Torneo" : `Posicion #${r.placement}`,
        description: `Termino #${r.placement} en ${tournament.name} con ${r.kills} kills`,
        metadata: JSON.stringify({ tournamentId: id, kills: r.kills, placement: r.placement }),
      },
    });
  }

  // Update tournament status
  await prisma.tournament.update({
    where: { id },
    data: {
      status: "finished",
      completedAt: new Date(),
      evidenceUrl: evidenceUrl || null,
    },
  });

  // Prize distribution for winner (1st place gets 90% of prize pool)
  if (tournament.prizePool > 0) {
    const winner = results.find((r) => r.placement === 1);
    if (winner) {
      const prize = tournament.prizePool * 0.9; // 10% commission
      const wallet = await prisma.wallet.findUnique({ where: { userId: winner.userId } });
      if (wallet) {
        await prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: prize } },
        });
        await prisma.transaction.create({
          data: {
            walletId: wallet.id,
            type: "tournament_win",
            amount: prize,
            description: `Premio: 1er lugar en ${tournament.name}`,
            status: "completed",
          },
        });
      }
    }
  }

  // Recalculate all rankings
  const rankingResult = await recalculateAllRankings();

  return NextResponse.json({
    message: `Resultados guardados para ${results.length} jugadores. Rankings recalculados.`,
    playersProcessed: results.length,
    rankingStats: rankingResult.stats,
  });
}

/** PUT /api/admin/tournaments/[id]/results — Update individual result (correction) */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { userId, kills, deaths, placement, evidenceUrl, notes } = body;

  if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 });

  // Update tournament result
  await prisma.tournamentResult.update({
    where: { tournamentId_userId: { tournamentId: id, userId } },
    data: {
      ...(kills !== undefined && { kills }),
      ...(deaths !== undefined && { deaths }),
      ...(placement !== undefined && { placement }),
      ...(evidenceUrl !== undefined && { evidenceUrl }),
      ...(notes !== undefined && { notes }),
    },
  });

  // Re-process all results for this tournament to recalculate derived fields
  const allResults = await prisma.tournamentResult.findMany({ where: { tournamentId: id } });
  const tournament = await prisma.tournament.findUnique({ where: { id } });
  if (!tournament) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });

  const bestKills = Math.max(...allResults.map((r) => r.kills), 0);
  const allTP = allResults.map((r) => (r.kills * 10) + getPlacementPoints(r.placement));
  const bestTP = Math.max(...allTP, 0);
  const totalK = allResults.reduce((sum, r) => sum + r.kills, 0);

  // Delete and recreate all ranking records for this tournament
  await prisma.rankingMatchRecord.deleteMany({ where: { tournamentId: id } });

  for (const r of allResults) {
    const tp = (r.kills * 10) + getPlacementPoints(r.placement);
    await prisma.rankingMatchRecord.create({
      data: {
        playerId: r.userId,
        tournamentId: id,
        tournamentType: tournament.tournamentType,
        kills: r.kills,
        deaths: r.deaths,
        position: r.placement,
        totalTeams: tournament.filledSlots || allResults.length,
        teamKills: totalK,
        teamPoints: tp,
        bestKillsInTournament: bestKills,
        bestTeamPointsInTournament: bestTP,
      },
    });
  }

  // Recalculate rankings
  await recalculateAllRankings();

  return NextResponse.json({ message: "Resultado actualizado y rankings recalculados" });
}
