import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const STORE_ITEMS = [
  { id: "credits-50", type: "credit_pack", name: "50 Creditos Phoenix", price: 5, credits: 50, description: "Paquete basico para empezar a competir" },
  { id: "credits-150", type: "credit_pack", name: "150 Creditos Phoenix", price: 12, credits: 150, description: "El mas popular. 25% mas valor" },
  { id: "credits-500", type: "credit_pack", name: "500 Creditos Phoenix", price: 35, credits: 500, description: "Para competidores serios. 40% mas valor" },
  { id: "credits-1200", type: "credit_pack", name: "1,200 Creditos Phoenix", price: 70, credits: 1200, description: "Paquete elite. Mejor precio por credito" },
  { id: "name-change", type: "name_change", name: "Cambio de Identidad", price: 5, credits: 0, description: "Cambia tu nombre de usuario en la plataforma" },
  { id: "record-reset", type: "record_reset", name: "Reinicio de Historial", price: 10, credits: 0, description: "Borra tu historial de partidas y empieza de cero" },
  { id: "badge-flame", type: "badge", name: "Insignia Llama Eterna", price: 3, credits: 0, description: "Insignia exclusiva para tu perfil" },
  { id: "title-legend", type: "title", name: "Titulo: Leyenda", price: 8, credits: 0, description: "Titulo especial visible junto a tu nombre" },
];

/** GET /api/store — List store items */
export async function GET() {
  return NextResponse.json({ items: STORE_ITEMS });
}

/** POST /api/store — Purchase an item */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { itemId } = body as { itemId: string };

  const item = STORE_ITEMS.find((i) => i.id === itemId);
  if (!item) return NextResponse.json({ error: "Articulo no encontrado" }, { status: 404 });

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
      used: item.type === "credit_pack", // credits auto-apply
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
