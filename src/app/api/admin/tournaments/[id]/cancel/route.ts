import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { HttpError, httpErrorResponse } from "@/lib/http-error";

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

  try {
    const result = await prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.findUnique({
        where: { id },
        include: { entries: true },
      });

      if (!tournament) throw new HttpError(404, "Torneo no encontrado");
      if (tournament.status === "cancelled") throw new HttpError(400, "El torneo ya esta cancelado");
      if (tournament.status === "finished") throw new HttpError(400, "No se puede cancelar un torneo finalizado");
      if (!CANCELLABLE_STATUSES.has(tournament.status)) {
        throw new HttpError(400, `Estado no cancelable: ${tournament.status}`);
      }

      let refundedCount = 0;
      let refundedTotal = 0;

      for (const entry of tournament.entries) {
        const refund = entry.paidAmount ?? tournament.entryFee;
        if (refund <= 0) continue;
        const wallet = await tx.wallet.findUnique({ where: { userId: entry.userId } });
        if (!wallet) continue;
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: refund } },
        });
        await tx.transaction.create({
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

      await tx.tournament.update({
        where: { id },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
          prizePool: 0,
        },
      });

      return { refundedCount, refundedTotal, name: tournament.name };
    }, {
      // Refund loops can be slow if there are many entries — bump the
      // default 5s transaction timeout to a more forgiving value.
      timeout: 15_000,
    });

    return NextResponse.json({
      message: `Torneo cancelado. ${result.refundedCount} reembolsos por $${result.refundedTotal.toFixed(2)}.`,
      refundedCount: result.refundedCount,
      refundedTotal: result.refundedTotal,
    });
  } catch (err) {
    if (err instanceof HttpError) return httpErrorResponse(err);
    console.error("cancel tournament error:", err);
    return NextResponse.json({ error: "Error al cancelar el torneo" }, { status: 500 });
  }
}
