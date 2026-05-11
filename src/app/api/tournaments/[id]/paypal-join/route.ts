import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { capturePayPalOrder } from "@/lib/paypal";
import { prisma } from "@/lib/db";
import { HttpError, httpErrorResponse } from "@/lib/http-error";

/**
 * POST /api/tournaments/[id]/paypal-join
 *
 * Single-shot "fund + join" flow: capture a PayPal order, credit the wallet
 * with the captured amount, then perform the standard tournament join in the
 * same request. Used when the player doesn't have enough wallet balance to
 * cover the entry fee on its own.
 *
 * Flow (designed so the user is never out money if anything fails after
 * PayPal capture):
 *
 *   1. Pre-check the tournament (status, slots, not already joined) so we
 *      never capture money for a tournament the user can't join.
 *   2. Capture the PayPal order OUTSIDE any DB transaction.
 *   3. Tx A — credit the deposit to the wallet. Idempotent against a prior
 *      `deposit` tx with the same `reference = orderId`. This step is
 *      "commit first" so even if step 4 fails, the user has their money.
 *   4. Tx B — charge the entry fee, create the entry row, bump the pool.
 *      If this fails the user keeps the deposit as wallet credit and we
 *      return an explanatory error.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const orderId: string | undefined = body?.orderId;
  if (!orderId) return NextResponse.json({ error: "orderId requerido" }, { status: 400 });

  // ── 1. Pre-checks (read-only) ──────────────────────────────────────────
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: { entries: true },
  });
  if (!tournament) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
  if (tournament.status !== "registration") {
    return NextResponse.json({ error: "El registro esta cerrado" }, { status: 400 });
  }
  if (tournament.filledSlots >= tournament.maxSlots) {
    return NextResponse.json({ error: "Torneo lleno" }, { status: 400 });
  }
  if (tournament.entries.some((e) => e.userId === user.id)) {
    return NextResponse.json({ error: "Ya estas inscrito" }, { status: 400 });
  }

  // ── 2. Capture PayPal (network call, no DB locks held) ─────────────────
  let capturedAmount = 0;
  try {
    const capture = await capturePayPalOrder(orderId);
    if (capture.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "El pago no fue completado", status: capture.status },
        { status: 400 },
      );
    }
    capturedAmount = parseFloat(
      capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || "0",
    );
  } catch (err) {
    console.error("PayPal capture error in paypal-join:", err);
    return NextResponse.json({ error: "Error al procesar el pago" }, { status: 500 });
  }

  if (capturedAmount <= 0) {
    return NextResponse.json({ error: "Monto capturado invalido" }, { status: 400 });
  }

  // ── 3. Tx A: credit deposit (idempotent) ───────────────────────────────
  // If this fails the user's PayPal money is captured but our DB has no
  // record — log critical so ops can reconcile. Webhooks (Fase B) close
  // this loop automatically.
  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findFirst({
        where: { reference: orderId, type: "deposit" },
      });
      if (existing) return; // already credited (retry / webhook beat us)

      const wallet = await tx.wallet.findUnique({ where: { userId: user.id } });
      if (!wallet) throw new HttpError(500, "Wallet no encontrado");

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: capturedAmount } },
      });
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: "deposit",
          amount: capturedAmount,
          description: `Deposito via PayPal (entrada ${tournament.name}) - $${capturedAmount.toFixed(2)}`,
          status: "completed",
          reference: orderId,
        },
      });
    });
  } catch (err) {
    console.error(
      `[CRITICAL] PayPal order ${orderId} captured for $${capturedAmount} but deposit credit failed for user ${user.id}:`,
      err,
    );
    return NextResponse.json(
      { error: "Pago capturado pero el deposito fallo. Soporte fue notificado." },
      { status: 500 },
    );
  }

  // ── 4. Tx B: charge entry + create entry + bump pool ───────────────────
  // If this fails the deposit from Tx A stays in the wallet — the user can
  // try to join again or use the credit elsewhere.
  try {
    await prisma.$transaction(async (tx) => {
      const t = await tx.tournament.findUnique({
        where: { id },
        include: { entries: true },
      });
      if (!t) throw new HttpError(404, "Torneo no encontrado");
      if (t.status !== "registration") {
        throw new HttpError(
          400,
          "El registro se cerro mientras procesabamos tu pago. Tu deposito quedo en tu wallet.",
        );
      }
      if (t.filledSlots >= t.maxSlots) {
        throw new HttpError(
          400,
          "El torneo se lleno mientras procesabamos tu pago. Tu deposito quedo en tu wallet.",
        );
      }
      if (t.entries.some((e) => e.userId === user.id)) {
        throw new HttpError(400, "Ya estas inscrito");
      }

      const wallet = await tx.wallet.findUnique({ where: { userId: user.id } });
      if (!wallet) throw new HttpError(500, "Wallet no encontrado");
      if (wallet.balance < t.entryFee) {
        throw new HttpError(400, "Saldo insuficiente tras el deposito");
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: t.entryFee } },
      });
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: "tournament_entry",
          amount: -t.entryFee,
          description: `Inscripcion a ${t.name}`,
          status: "completed",
          reference: t.id,
        },
      });
      await tx.tournamentEntry.create({
        data: {
          tournamentId: t.id,
          userId: user.id,
          paidAmount: t.entryFee,
        },
      });
      await tx.tournament.update({
        where: { id: t.id },
        data: {
          filledSlots: { increment: 1 },
          prizePool: { increment: t.entryFee },
        },
      });
    });
  } catch (err) {
    if (err instanceof HttpError) return httpErrorResponse(err);
    console.error("paypal-join entry-creation tx failed:", err);
    return NextResponse.json(
      { error: "El deposito se acredito pero la inscripcion fallo." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "Inscripcion exitosa via PayPal",
    deposited: capturedAmount,
    entryFee: tournament.entryFee,
  });
}
