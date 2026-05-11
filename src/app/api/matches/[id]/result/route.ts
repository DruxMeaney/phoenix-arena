import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rebuildAndPersistPsrRankings } from "@/lib/ranking/psr-service";
import { PSR_MODEL_VERSION } from "@/lib/scoring";

/** POST /api/matches/[id]/result — Report match result */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { winnerId, evidenceUrl } = body as { winnerId: string; evidenceUrl?: string };

  const match = await prisma.match.findUnique({
    where: { id },
    include: { participants: true, result: true },
  });

  if (!match) return NextResponse.json({ error: "Reto no encontrado" }, { status: 404 });
  if (match.result) return NextResponse.json({ error: "Ya se reporto un resultado" }, { status: 400 });

  const isParticipant = match.participants.some((p) => p.userId === user.id);
  if (!isParticipant) return NextResponse.json({ error: "No eres participante de este reto" }, { status: 403 });

  const result = await prisma.result.create({
    data: {
      matchId: match.id,
      reporterId: user.id,
      winnerId,
      evidenceUrl,
      status: "pending",
    },
  });

  await prisma.match.update({
    where: { id: match.id },
    data: { status: "pending_result" },
  });

  return NextResponse.json({ result }, { status: 201 });
}

/** PUT /api/matches/[id]/result — Confirm or dispute result */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { action, reason } = body as { action: "confirm" | "dispute"; reason?: string };

  const match = await prisma.match.findUnique({
    where: { id },
    include: { result: true, participants: true },
  });

  if (!match?.result) return NextResponse.json({ error: "No hay resultado para confirmar" }, { status: 404 });
  if (match.result.status !== "pending") {
    return NextResponse.json({ error: "El resultado ya fue procesado" }, { status: 400 });
  }
  if (match.result.reporterId === user.id) return NextResponse.json({ error: "No puedes confirmar tu propio reporte" }, { status: 400 });

  if (action === "confirm") {
    // Pay winner, deduct commission
    const winnerId = match.result.winnerId;
    if (!winnerId) return NextResponse.json({ error: "No hay ganador definido" }, { status: 400 });

    const playersCount = match.participants.length;
    const totalPool = match.amount * playersCount;
    const commission = totalPool * 0.10;
    const prize = totalPool - commission;

    // Release held funds for all participants and pay winner
    for (const p of match.participants) {
      await prisma.wallet.update({
        where: { userId: p.userId },
        data: { heldBalance: { decrement: match.amount } },
      });
    }

    const winnerWallet = await prisma.wallet.findUnique({ where: { userId: winnerId } });
    if (winnerWallet) {
      await prisma.wallet.update({
        where: { id: winnerWallet.id },
        data: { balance: { increment: prize } },
      });

      await prisma.transaction.create({
        data: {
          walletId: winnerWallet.id,
          type: "challenge_win",
          amount: prize,
          description: `Premio del reto - ${match.game} ${match.modalidad}`,
          status: "completed",
        },
      });
    }

    await prisma.result.update({ where: { id: match.result.id }, data: { status: "confirmed" } });
    await prisma.match.update({ where: { id: match.id }, data: { status: "confirmed" } });

    try {
      await prisma.rankingMatchRecord.createMany({
        data: match.participants.map((participant) => {
          const isWinner = participant.userId === winnerId;
          return {
            playerId: participant.userId,
            eventId: match.id,
            seasonId: "global",
            sourceType: "quickmatch",
            sourceId: match.result!.id,
            evidenceUrl: match.result!.evidenceUrl,
            verified: true,
            modelVersion: PSR_MODEL_VERSION,
            tournamentType: "detri",
            date: new Date(),
            kills: 0,
            deaths: 0,
            position: isWinner ? 1 : playersCount,
            totalTeams: playersCount,
            teamKills: 0,
            teamPoints: isWinner ? 1 : 0,
            bestKillsInTournament: 0,
            bestTeamPointsInTournament: 1,
          };
        }),
      });

      await rebuildAndPersistPsrRankings();
    } catch (error) {
      console.error("Unable to persist PSR event for confirmed match", error);
    }

    return NextResponse.json({ message: "Resultado confirmado. Premio pagado.", prize });
  }

  if (action === "dispute") {
    await prisma.result.update({ where: { id: match.result.id }, data: { status: "disputed" } });
    await prisma.match.update({ where: { id: match.id }, data: { status: "disputed" } });

    await prisma.dispute.create({
      data: {
        matchId: match.id,
        reporterId: user.id,
        reason: reason || "Desacuerdo con el resultado reportado",
      },
    });

    return NextResponse.json({ message: "Disputa abierta. Un administrador revisara el caso." });
  }

  return NextResponse.json({ error: "Accion invalida" }, { status: 400 });
}
