import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** POST /api/tournaments/[id]/leave — Leave a tournament during registration and refund the entry fee */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;

  const tournament = await prisma.tournament.findUnique({ where: { id } });
  if (!tournament) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });

  // Refunds only allowed while registration is open. Once the tournament starts,
  // the entry is locked in.
  if (tournament.status !== "registration") {
    return NextResponse.json(
      { error: "Ya no se puede salir del torneo (registro cerrado)" },
      { status: 400 },
    );
  }

  const entry = await prisma.tournamentEntry.findUnique({
    where: { tournamentId_userId: { tournamentId: id, userId: user.id } },
  });
  if (!entry) return NextResponse.json({ error: "No estas inscrito" }, { status: 400 });

  const refund = entry.paidAmount ?? tournament.entryFee;

  if (refund > 0) {
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (wallet) {
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: refund } },
      });
      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: "tournament_refund",
          amount: refund,
          description: `Reembolso: salida de ${tournament.name}`,
          status: "completed",
          reference: tournament.id,
        },
      });
    }
  }

  await prisma.tournamentEntry.delete({ where: { id: entry.id } });

  await prisma.tournament.update({
    where: { id },
    data: {
      filledSlots: { decrement: 1 },
      prizePool: { decrement: refund },
    },
  });

  return NextResponse.json({ message: "Salida exitosa, reembolso aplicado", refund });
}
