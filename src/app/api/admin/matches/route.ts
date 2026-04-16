import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** GET /api/admin/matches — List all matches */
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const matches = await prisma.match.findMany({
    where,
    include: {
      creator: { select: { id: true, username: true, avatar: true, tier: true } },
      participants: {
        include: { user: { select: { id: true, username: true, avatar: true, tier: true } } },
      },
      result: true,
      dispute: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ matches });
}

/** POST /api/admin/matches — Create a match as admin */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { game, modalidad, amount, rules } = body;

  if (!game || !modalidad || amount == null || !rules) {
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
  }

  const match = await prisma.match.create({
    data: {
      creatorId: user.id,
      game,
      modalidad,
      amount: parseFloat(amount),
      rules,
    },
  });

  return NextResponse.json({ match }, { status: 201 });
}

/** PUT /api/admin/matches — Update/force-resolve a match */
export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, status: newStatus, winnerId } = body;

  if (!id) return NextResponse.json({ error: "Match ID requerido" }, { status: 400 });

  const match = await prisma.match.findUnique({
    where: { id },
    include: { participants: true },
  });

  if (!match) return NextResponse.json({ error: "Reto no encontrado" }, { status: 404 });

  // If force-resolving with a winner, handle prize distribution
  if (newStatus === "resolved" && winnerId) {
    const playerCount = match.participants.length;
    const prize = (match.amount * playerCount) * 0.9; // 10% commission

    // Release held balance for all participants
    for (const p of match.participants) {
      const wallet = await prisma.wallet.findUnique({ where: { userId: p.userId } });
      if (wallet) {
        await prisma.wallet.update({
          where: { id: wallet.id },
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
          description: `Premio por reto (admin resuelto)`,
          status: "completed",
        },
      });
    }
  }

  await prisma.match.update({
    where: { id },
    data: { status: newStatus || match.status },
  });

  return NextResponse.json({ message: "Reto actualizado" });
}
