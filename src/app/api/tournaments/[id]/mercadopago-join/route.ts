import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { decodeExternalReference, getPayment } from "@/lib/mercadopago";
import { prisma } from "@/lib/db";

/**
 * POST /api/tournaments/[id]/mercadopago-join
 *
 * Body: { paymentId: string }
 *
 * MercadoPago counterpart to paypal-join: verifies the payment, credits the
 * wallet with the USD amount encoded in external_reference, then performs
 * the standard join in the same request.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const paymentId: string | undefined = body?.paymentId;
  if (!paymentId) return NextResponse.json({ error: "paymentId requerido" }, { status: 400 });

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

  // Idempotency: if a deposit was already recorded against this paymentId,
  // we already credited the wallet (and presumably joined). Don't double-credit.
  const existingDeposit = await prisma.transaction.findFirst({
    where: { reference: paymentId, type: "deposit" },
  });
  if (existingDeposit) {
    return NextResponse.json(
      { error: "Este pago ya fue procesado anteriormente" },
      { status: 400 },
    );
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
  if (ref.userId !== user.id) {
    return NextResponse.json({ error: "El pago no pertenece al usuario actual" }, { status: 403 });
  }
  if (ref.kind !== "tournament_join" || ref.extra !== tournament.id) {
    return NextResponse.json(
      { error: "El pago no corresponde a este torneo" },
      { status: 400 },
    );
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet) return NextResponse.json({ error: "Wallet no encontrado" }, { status: 500 });

  // Credit the deposit first so the audit trail shows funding before the entry charge.
  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { balance: { increment: ref.amountUsd } },
  });
  await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      type: "deposit",
      amount: ref.amountUsd,
      description: `Deposito via MercadoPago (entrada ${tournament.name}) - $${ref.amountUsd.toFixed(2)}`,
      status: "completed",
      reference: paymentId,
    },
  });

  // Re-read balance and verify it covers the entry fee.
  const fundedWallet = await prisma.wallet.findUnique({ where: { id: wallet.id } });
  if (!fundedWallet || fundedWallet.balance < tournament.entryFee) {
    return NextResponse.json(
      { error: "Saldo insuficiente tras el deposito", balance: fundedWallet?.balance ?? 0 },
      { status: 400 },
    );
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
      reference: tournament.id,
    },
  });

  await prisma.tournamentEntry.create({
    data: {
      tournamentId: tournament.id,
      userId: user.id,
      paidAmount: tournament.entryFee,
    },
  });

  await prisma.tournament.update({
    where: { id: tournament.id },
    data: {
      filledSlots: { increment: 1 },
      prizePool: { increment: tournament.entryFee },
    },
  });

  return NextResponse.json({
    message: "Inscripcion exitosa via MercadoPago",
    deposited: ref.amountUsd,
    entryFee: tournament.entryFee,
  });
}
