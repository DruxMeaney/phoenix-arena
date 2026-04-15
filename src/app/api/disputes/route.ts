import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** GET /api/disputes — List disputes (admin) or user's disputes */
export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const where = user.role === "admin" ? {} : { reporterId: user.id };

  const disputes = await prisma.dispute.findMany({
    where,
    include: {
      match: {
        include: {
          creator: { select: { username: true } },
          participants: { include: { user: { select: { username: true } } } },
        },
      },
      reporter: { select: { username: true } },
      resolver: { select: { username: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ disputes });
}

/** PUT /api/disputes — Resolve a dispute (admin only) */
export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const { disputeId, winnerId, resolution } = body as {
    disputeId: string; winnerId: string; resolution: string;
  };

  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: { match: { include: { participants: true } } },
  });

  if (!dispute) return NextResponse.json({ error: "Disputa no encontrada" }, { status: 404 });

  // Resolve dispute
  await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: "resolved",
      resolverId: user.id,
      resolution,
      resolvedAt: new Date(),
    },
  });

  // Pay the winner
  const match = dispute.match;
  const playersCount = match.participants.length;
  const totalPool = match.amount * playersCount;
  const commission = totalPool * 0.10;
  const prize = totalPool - commission;

  // Release held funds
  for (const p of match.participants) {
    const w = await prisma.wallet.findUnique({ where: { userId: p.userId } });
    if (w) {
      await prisma.wallet.update({
        where: { id: w.id },
        data: { heldBalance: { decrement: match.amount } },
      });
    }
  }

  // Pay winner
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
        description: `Premio por disputa resuelta - ${match.game}`,
        status: "completed",
      },
    });
  }

  await prisma.result.update({
    where: { matchId: match.id },
    data: { status: "resolved", winnerId },
  });

  await prisma.match.update({
    where: { id: match.id },
    data: { status: "resolved" },
  });

  return NextResponse.json({ message: "Disputa resuelta", prize });
}
