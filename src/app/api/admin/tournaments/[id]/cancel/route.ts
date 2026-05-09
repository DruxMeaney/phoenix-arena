import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

const CANCELLABLE_STATUSES = new Set(["draft", "registration", "check_in", "in_progress", "paused"]);

/** POST /api/admin/tournaments/[id]/cancel — Cancel a tournament and refund all entries */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const reason: string | undefined = body?.reason;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: { entries: true },
  });

  if (!tournament) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });

  if (tournament.status === "cancelled") {
    return NextResponse.json({ error: "El torneo ya esta cancelado" }, { status: 400 });
  }
  if (tournament.status === "finished") {
    return NextResponse.json({ error: "No se puede cancelar un torneo finalizado" }, { status: 400 });
  }
  if (!CANCELLABLE_STATUSES.has(tournament.status)) {
    return NextResponse.json({ error: `Estado no cancelable: ${tournament.status}` }, { status: 400 });
  }

  let refundedCount = 0;
  let refundedTotal = 0;

  for (const entry of tournament.entries) {
    const refund = entry.paidAmount ?? tournament.entryFee;
    if (refund <= 0) continue;
    const wallet = await prisma.wallet.findUnique({ where: { userId: entry.userId } });
    if (!wallet) continue;
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: refund } },
    });
    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: "tournament_refund",
        amount: refund,
        description: `Reembolso: ${tournament.name} cancelado${reason ? ` (${reason})` : ""}`,
        status: "completed",
        reference: tournament.id,
      },
    });
    refundedCount += 1;
    refundedTotal += refund;
  }

  await prisma.tournament.update({
    where: { id },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
      prizePool: 0,
    },
  });

  return NextResponse.json({
    message: `Torneo cancelado. ${refundedCount} reembolsos por $${refundedTotal.toFixed(2)}.`,
    refundedCount,
    refundedTotal,
  });
}
