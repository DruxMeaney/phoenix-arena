import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** POST /api/tournaments/[id]/join — Join a tournament */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: { entries: true },
  });

  if (!tournament) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
  if (tournament.status !== "registration") return NextResponse.json({ error: "El registro esta cerrado" }, { status: 400 });
  if (tournament.filledSlots >= tournament.maxSlots) return NextResponse.json({ error: "Torneo lleno" }, { status: 400 });

  const alreadyJoined = tournament.entries.some((e) => e.userId === user.id);
  if (alreadyJoined) return NextResponse.json({ error: "Ya estas inscrito" }, { status: 400 });

  // Charge entry fee
  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet || wallet.balance < tournament.entryFee) {
    return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
  }

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { balance: { decrement: tournament.entryFee } },
  });

  await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      type: "tournament_entry",
      amount: -tournament.entryFee,
      description: `Inscripcion a ${tournament.name}`,
      status: "completed",
    },
  });

  await prisma.tournamentEntry.create({
    data: { tournamentId: tournament.id, userId: user.id },
  });

  await prisma.tournament.update({
    where: { id: tournament.id },
    data: {
      filledSlots: { increment: 1 },
      prizePool: { increment: tournament.entryFee },
    },
  });

  return NextResponse.json({ message: "Inscripcion exitosa" });
}
