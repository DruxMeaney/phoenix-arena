import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { decodeExternalReference, getPayment } from "@/lib/mercadopago";
import { prisma } from "@/lib/db";

/**
 * POST /api/mercadopago/capture-payment
 *
 * Body: { paymentId: string }
 *
 * Verifies a MercadoPago payment server-side, credits the wallet with the
 * original USD amount encoded in the preference's external_reference, and
 * is idempotent against `Transaction.reference = paymentId`.
 *
 * NOTE: this endpoint only handles wallet top-ups. Tournament joins use
 * /api/tournaments/[id]/mercadopago-join which combines capture + join.
 */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const paymentId: string | undefined = body?.paymentId;
  if (!paymentId) return NextResponse.json({ error: "paymentId requerido" }, { status: 400 });

  // Idempotency: if we've already credited this payment, return success without
  // re-charging. The unique signal is reference == paymentId on a deposit tx.
  const existing = await prisma.transaction.findFirst({
    where: { reference: paymentId, type: "deposit" },
  });
  if (existing) {
    return NextResponse.json({ message: "Pago ya procesado", amountUsd: existing.amount });
  }

  let payment;
  try {
    payment = await getPayment(paymentId);
  } catch (err) {
    console.error("MercadoPago getPayment error:", err);
    return NextResponse.json({ error: "Error al verificar el pago" }, { status: 500 });
  }

  if (payment.status !== "approved") {
    return NextResponse.json(
      { error: `Pago no aprobado: ${payment.status_detail || payment.status}` },
      { status: 400 },
    );
  }

  const ref = decodeExternalReference(payment.external_reference);
  if (!ref) return NextResponse.json({ error: "Referencia externa invalida" }, { status: 400 });
  if (ref.kind !== "wallet_topup") {
    return NextResponse.json(
      { error: "Este pago corresponde a un torneo; usa /api/tournaments/[id]/mercadopago-join" },
      { status: 400 },
    );
  }
  // Confirm the payment was started by this user — defends against pasting
  // someone else's paymentId.
  if (ref.userId !== user.id) {
    return NextResponse.json({ error: "El pago no pertenece al usuario actual" }, { status: 403 });
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet) return NextResponse.json({ error: "Wallet no encontrada" }, { status: 500 });

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { balance: { increment: ref.amountUsd } },
  });
  await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      type: "deposit",
      amount: ref.amountUsd,
      description: `Deposito via MercadoPago - $${ref.amountUsd.toFixed(2)}`,
      status: "completed",
      reference: paymentId,
    },
  });

  return NextResponse.json({
    message: "Deposito exitoso",
    amountUsd: ref.amountUsd,
    paymentId,
  });
}
