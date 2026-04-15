import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** GET /api/wallet — Get wallet balance and recent transactions */
export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const wallet = await prisma.wallet.findUnique({
    where: { userId: user.id },
    include: {
      transactions: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!wallet) return NextResponse.json({ error: "Wallet no encontrada" }, { status: 404 });

  return NextResponse.json({
    balance: wallet.balance,
    heldBalance: wallet.heldBalance,
    transactions: wallet.transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      description: t.description,
      status: t.status,
      createdAt: t.createdAt,
    })),
  });
}

/** POST /api/wallet — Deposit or withdraw */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { action, amount } = body as { action: "deposit" | "withdraw"; amount: number };

  if (!action || !amount || amount <= 0) {
    return NextResponse.json({ error: "Accion y monto son requeridos" }, { status: 400 });
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet) return NextResponse.json({ error: "Wallet no encontrada" }, { status: 404 });

  if (action === "deposit") {
    // In production, this would integrate with Stripe/OpenPay
    const updated = await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } },
    });

    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: "deposit",
        amount,
        description: `Deposito de $${amount.toFixed(2)}`,
        status: "completed",
      },
    });

    return NextResponse.json({ balance: updated.balance, message: "Deposito exitoso" });
  }

  if (action === "withdraw") {
    if (wallet.balance < amount) {
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
    }

    const updated = await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: amount } },
    });

    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: "withdrawal",
        amount: -amount,
        description: `Retiro de $${amount.toFixed(2)}`,
        status: "processing",
      },
    });

    return NextResponse.json({ balance: updated.balance, message: "Retiro en proceso" });
  }

  return NextResponse.json({ error: "Accion invalida" }, { status: 400 });
}
