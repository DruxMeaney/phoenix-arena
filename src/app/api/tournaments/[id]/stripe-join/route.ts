import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getCheckoutSession } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { HttpError, httpErrorResponse } from "@/lib/http-error";

/**
 * POST /api/tournaments/[id]/stripe-join
 *
 * Stripe counterpart to paypal-join / mercadopago-join. Same two-step
 * transaction pattern: credit the deposit first (Tx A, idempotent), then
 * charge the entry and create the entry row (Tx B). If Tx B fails after
 * Tx A succeeded, the deposit stays in the wallet.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const sessionId: string | undefined = body?.sessionId;
  if (!sessionId) return NextResponse.json({ error: "sessionId requerido" }, { status: 400 });

  // ── 1. Pre-checks ──────────────────────────────────────────────────────
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

  // ── 2. Verify session with Stripe ──────────────────────────────────────
  let session;
  try {
    session = await getCheckoutSession(sessionId);
  } catch (err) {
    console.error("Stripe getCheckoutSession error in stripe-join:", err);
    return NextResponse.json({ error: "Error al verificar el pago" }, { status: 500 });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json(
      { error: `Pago no aprobado: ${session.payment_status}` },
      { status: 400 },
    );
  }

  const md = session.metadata || {};
  if (md.userId !== user.id) {
    return NextResponse.json({ error: "El pago no pertenece al usuario actual" }, { status: 403 });
  }
  if (md.kind !== "tournament_join" || md.tournamentId !== tournament.id) {
    return NextResponse.json(
      { error: "El pago no corresponde a este torneo" },
      { status: 400 },
    );
  }

  const depositAmount = Number(md.amountUsdCents) / 100;
  if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
    return NextResponse.json({ error: "Monto en metadata invalido" }, { status: 400 });
  }

  // ── 3. Tx A: credit deposit (idempotent) ───────────────────────────────
  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findFirst({
        where: { reference: sessionId, type: "deposit" },
      });
      if (existing) return;
      const wallet = await tx.wallet.findUnique({ where: { userId: user.id } });
      if (!wallet) throw new HttpError(500, "Wallet no encontrado");
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: depositAmount } },
      });
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: "deposit",
          amount: depositAmount,
          description: `Deposito via Stripe (entrada ${tournament.name}) - $${depositAmount.toFixed(2)}`,
          status: "completed",
          reference: sessionId,
        },
      });
    });
  } catch (err) {
    console.error(
      `[CRITICAL] Stripe session ${sessionId} paid but deposit credit failed for user ${user.id}:`,
      err,
    );
    return NextResponse.json(
      { error: "Pago verificado pero el deposito fallo. Soporte fue notificado." },
      { status: 500 },
    );
  }

  // ── 4. Tx B: charge entry + create entry + bump pool ───────────────────
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
    console.error("stripe-join entry-creation tx failed:", err);
    return NextResponse.json(
      { error: "El deposito se acredito pero la inscripcion fallo." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "Inscripcion exitosa via Stripe",
    deposited: depositAmount,
    entryFee: tournament.entryFee,
  });
}
