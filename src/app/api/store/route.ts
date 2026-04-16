import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** GET /api/store — List active store items */
export async function GET() {
  const items = await prisma.storeItem.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ items });
}

/** POST /api/store — Purchase an item */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { itemId } = body as { itemId: string };

  const item = await prisma.storeItem.findUnique({ where: { slug: itemId } });
  if (!item || !item.isActive) return NextResponse.json({ error: "Articulo no encontrado" }, { status: 404 });

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet || wallet.balance < item.price) {
    return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
  }

  // Charge wallet
  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { balance: { decrement: item.price } },
  });

  await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      type: "purchase",
      amount: -item.price,
      description: `Compra: ${item.name}`,
      status: "completed",
    },
  });

  // If credit pack, add credits to wallet balance
  if (item.type === "credit_pack" && item.credits > 0) {
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: item.credits } },
    });
  }

  // Add to vault
  await prisma.vaultItem.create({
    data: {
      userId: user.id,
      itemType: item.type,
      itemName: item.name,
      used: item.type === "credit_pack",
      usedAt: item.type === "credit_pack" ? new Date() : null,
    },
  });

  // Record purchase
  await prisma.purchase.create({
    data: {
      userId: user.id,
      itemType: item.type,
      itemName: item.name,
      price: item.price,
      credits: item.credits,
    },
  });

  // Feed event
  await prisma.feedEvent.create({
    data: {
      userId: user.id,
      type: "purchase",
      title: "Compra en la Tienda",
      description: `${user.username} adquirio ${item.name}`,
    },
  });

  return NextResponse.json({ message: `${item.name} adquirido con exito` });
}
