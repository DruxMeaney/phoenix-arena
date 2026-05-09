import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { capturePayPalOrder } from "@/lib/paypal";
import { prisma } from "@/lib/db";

/**
 * POST /api/tournaments/[id]/paypal-join
 *
 * Single-shot "fund + join" flow: capture a PayPal order, credit the wallet
 * with the captured amount, then perform the standard tournament join in the
 * same request. Used when the player doesn't have enough wallet balance to
 * cover the entry fee on its own.
 *
 * The captured amount is expected to cover at least the missing portion of
 * the entry fee; the remainder (if any) stays in the wallet as credit.
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

  // Capture the PayPal order and credit the wallet.
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

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet) return NextResponse.json({ error: "Wallet no encontrado" }, { status: 500 });

  // Credit the deposit first so the audit trail shows the funding step.
  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { balance: { increment: capturedAmount } },
  });
  await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      type: "deposit",
      amount: capturedAmount,
      description: `Deposito via PayPal (entrada ${tournament.name}) - $${capturedAmount.toFixed(2)}`,
      status: "completed",
      reference: orderId,
    },
  });

  // Re-read balance after the deposit and verify it covers the entry fee.
  const fundedWallet = await prisma.wallet.findUnique({ where: { id: wallet.id } });
  if (!fundedWallet || fundedWallet.balance < tournament.entryFee) {
    return NextResponse.json(
      { error: "Saldo insuficiente tras el deposito", balance: fundedWallet?.balance ?? 0 },
      { status: 400 },
    );
  }

  // Charge the entry fee.
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
    message: "Inscripcion exitosa via PayPal",
    deposited: capturedAmount,
    entryFee: tournament.entryFee,
  });
}
