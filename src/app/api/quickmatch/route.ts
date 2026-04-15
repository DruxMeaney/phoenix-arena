import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** POST /api/quickmatch — Find or create an auto-matched challenge */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { amount, game } = body as { amount: number; game: string };

  if (!amount || amount < 1) {
    return NextResponse.json({ error: "Monto invalido" }, { status: 400 });
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet || wallet.balance < amount) {
    return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
  }

  // Try to find an existing open match with similar amount and tier
  const tierOrder = { Detri: 0, AM: 1, PRO: 2 };
  const userTierLevel = tierOrder[user.tier as keyof typeof tierOrder] ?? 0;

  const candidates = await prisma.match.findMany({
    where: {
      status: "open",
      modalidad: "1v1",
      game: game || "Warzone",
      amount: { gte: amount * 0.8, lte: amount * 1.2 }, // within 20% range
      creatorId: { not: user.id },
    },
    include: {
      creator: { select: { tier: true, username: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Filter by tier compatibility (within 1 tier level)
  const compatible = candidates.filter((m) => {
    const creatorTier = tierOrder[m.creator.tier as keyof typeof tierOrder] ?? 0;
    return Math.abs(creatorTier - userTierLevel) <= 1;
  });

  if (compatible.length > 0) {
    // Found a match — accept it
    const match = compatible[0];

    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: match.amount }, heldBalance: { increment: match.amount } },
    });

    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: "challenge_entry",
        amount: -match.amount,
        description: `QuickMatch vs ${match.creator.username}`,
        status: "completed",
      },
    });

    await prisma.matchParticipant.create({
      data: { matchId: match.id, userId: user.id },
    });

    await prisma.match.update({
      where: { id: match.id },
      data: { status: "in_progress" },
    });

    // XP for both players
    await prisma.user.update({ where: { id: user.id }, data: { xp: { increment: 5 }, seasonXp: { increment: 5 } } });
    await prisma.user.update({ where: { id: match.creatorId }, data: { xp: { increment: 5 }, seasonXp: { increment: 5 } } });

    // Feed
    await prisma.feedEvent.create({
      data: {
        userId: user.id,
        type: "quickmatch",
        title: "QuickMatch encontrado",
        description: `${user.username} vs ${match.creator.username} — $${match.amount} en ${match.game}`,
      },
    });

    return NextResponse.json({
      matched: true,
      matchId: match.id,
      opponent: match.creator.username,
      amount: match.amount,
      message: `Emparejado con ${match.creator.username}`,
    });
  }

  // No match found — create one and queue
  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { balance: { decrement: amount }, heldBalance: { increment: amount } },
  });

  await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      type: "challenge_entry",
      amount: -amount,
      description: `QuickMatch - Buscando oponente`,
      status: "completed",
    },
  });

  const newMatch = await prisma.match.create({
    data: {
      creatorId: user.id,
      game: game || "Warzone",
      modalidad: "1v1",
      amount,
      rules: "QuickMatch: Kills cuenta, sin vehiculos",
      status: "open",
      participants: { create: { userId: user.id } },
    },
  });

  return NextResponse.json({
    matched: false,
    matchId: newMatch.id,
    message: "Buscando oponente... Tu reto quedo abierto para emparejamiento automatico.",
  });
}
