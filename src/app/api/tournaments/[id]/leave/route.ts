import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HttpError, httpErrorResponse } from "@/lib/http-error";

/** POST /api/tournaments/[id]/leave — Leave a tournament during registration and refund the entry fee */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;

  // Single atomic transaction: re-read tournament + entry inside the tx so a
  // concurrent admin action (cancel, start) can't slip a refund through after
  // the status changes.
  try {
    const result = await prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.findUnique({ where: { id } });
      if (!tournament) throw new HttpError(404, "Torneo no encontrado");
      if (tournament.status !== "registration") {
        throw new HttpError(400, "Ya no se puede salir del torneo (registro cerrado)");
      }

      const entry = await tx.tournamentEntry.findUnique({
        where: { tournamentId_userId: { tournamentId: id, userId: user.id } },
      });
      if (!entry) throw new HttpError(400, "No estas inscrito");

      const refund = entry.paidAmount ?? tournament.entryFee;

      if (refund > 0) {
        const wallet = await tx.wallet.findUnique({ where: { userId: user.id } });
        if (wallet) {
          await tx.wallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: refund } },
          });
          await tx.transaction.create({
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

      await tx.tournamentEntry.delete({ where: { id: entry.id } });

      await tx.tournament.update({
        where: { id },
        data: {
          filledSlots: { decrement: 1 },
          prizePool: { decrement: refund },
        },
      });

      return { refund };
    });

    return NextResponse.json({ message: "Salida exitosa, reembolso aplicado", refund: result.refund });
  } catch (err) {
    if (err instanceof HttpError) return httpErrorResponse(err);
    console.error("leave tournament error:", err);
    return NextResponse.json({ error: "Error al salir del torneo" }, { status: 500 });
  }
}
