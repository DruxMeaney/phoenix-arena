import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** POST /api/matches/[id]/accept — Accept a challenge */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;

  const match = await prisma.match.findUnique({
    where: { id },
    include: { participants: true },
  });

  if (!match) return NextResponse.json({ error: "Reto no encontrado" }, { status: 404 });
  if (match.status !== "open") return NextResponse.json({ error: "Este reto ya no esta disponible" }, { status: 400 });
  if (match.creatorId === user.id) return NextResponse.json({ error: "No puedes aceptar tu propio reto" }, { status: 400 });

  // Check wallet
  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet || wallet.balance < match.amount) {
    return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
  }

  // Hold funds
  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { balance: { decrement: match.amount }, heldBalance: { increment: match.amount } },
  });

  await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      type: "challenge_entry",
      amount: -match.amount,
      description: `Aceptar reto vs ${match.creatorId}`,
      status: "completed",
    },
  });

  // Add participant and update status
  await prisma.matchParticipant.create({
    data: { matchId: match.id, userId: user.id },
  });

  const playersNeeded = match.modalidad === "1v1" ? 2 : match.modalidad === "Duo" ? 4 : 6;
  const currentPlayers = match.participants.length + 1;

  await prisma.match.update({
    where: { id: match.id },
    data: { status: currentPlayers >= playersNeeded ? "in_progress" : "open" },
  });

  return NextResponse.json({ message: "Reto aceptado" });
}
