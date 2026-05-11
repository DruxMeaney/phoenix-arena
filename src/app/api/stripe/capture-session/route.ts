import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getCheckoutSession } from "@/lib/stripe";
import { prisma } from "@/lib/db";

/**
 * POST /api/stripe/capture-session
 *
 * Body: { sessionId: string }
 *
 * Verifies a Stripe Checkout Session server-side, credits the wallet with
 * the USD amount stored in session.metadata, and is idempotent against
 * Transaction.reference = sessionId.
 *
 * Wallet top-ups only. Tournament joins use /api/tournaments/[id]/stripe-join.
 */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const sessionId: string | undefined = body?.sessionId;
  if (!sessionId) return NextResponse.json({ error: "sessionId requerido" }, { status: 400 });

  // Idempotency
  const existing = await prisma.transaction.findFirst({
    where: { reference: sessionId, type: "deposit" },
  });
  if (existing) {
    return NextResponse.json({ message: "Pago ya procesado", amountUsd: existing.amount });
  }

  let session;
  try {
    session = await getCheckoutSession(sessionId);
  } catch (err) {
    console.error("Stripe getCheckoutSession error:", err);
    return NextResponse.json({ error: "Error al verificar el pago" }, { status: 500 });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json(
      { error: `Pago no aprobado: ${session.payment_status}` },
      { status: 400 },
    );
  }

  const md = session.metadata || {};
  if (md.kind !== "wallet_topup") {
    return NextResponse.json(
      { error: "Esta sesion corresponde a un torneo; usa /api/tournaments/[id]/stripe-join" },
      { status: 400 },
    );
  }
  if (md.userId !== user.id) {
    return NextResponse.json({ error: "El pago no pertenece al usuario actual" }, { status: 403 });
  }

  const amountUsd = Number(md.amountUsdCents) / 100;
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
    return NextResponse.json({ error: "Monto en metadata invalido" }, { status: 400 });
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet) return NextResponse.json({ error: "Wallet no encontrada" }, { status: 500 });

  await prisma.$transaction(async (tx) => {
    // Re-check inside tx to avoid double-credit on concurrent requests.
    const existingInTx = await tx.transaction.findFirst({
      where: { reference: sessionId, type: "deposit" },
    });
    if (existingInTx) return;
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amountUsd } },
    });
    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type: "deposit",
        amount: amountUsd,
        description: `Deposito via Stripe - $${amountUsd.toFixed(2)}`,
        status: "completed",
        reference: sessionId,
      },
    });
  });

  return NextResponse.json({
    message: "Deposito exitoso",
    amountUsd,
    sessionId,
  });
}
