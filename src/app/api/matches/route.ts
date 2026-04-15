import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** GET /api/matches — List open and in-progress matches */
export async function GET() {
  const matches = await prisma.match.findMany({
    where: { status: { in: ["open", "in_progress"] } },
    include: {
      creator: { select: { id: true, username: true, avatar: true, tier: true } },
      participants: {
        include: { user: { select: { id: true, username: true, avatar: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ matches });
}

/** POST /api/matches — Create a new challenge */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { game, modalidad, amount, rules } = body as {
    game: string; modalidad: string; amount: number; rules: string;
  };

  if (!game || !modalidad || !amount || !rules) {
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
  }

  if (amount < 1) {
    return NextResponse.json({ error: "El monto minimo es $1" }, { status: 400 });
  }

  // Check wallet balance
  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet || wallet.balance < amount) {
    return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
  }

  // Hold funds
  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { balance: { decrement: amount }, heldBalance: { increment: amount } },
  });

  await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      type: "challenge_entry",
      amount: -amount,
      description: `Entrada a reto ${modalidad} - ${game}`,
      status: "completed",
    },
  });

  // Create match + add creator as participant
  const match = await prisma.match.create({
    data: {
      creatorId: user.id,
      game,
      modalidad,
      amount,
      rules,
      participants: { create: { userId: user.id } },
    },
    include: {
      creator: { select: { id: true, username: true, avatar: true, tier: true } },
      participants: true,
    },
  });

  return NextResponse.json({ match }, { status: 201 });
}
