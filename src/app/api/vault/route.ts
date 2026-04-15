import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** GET /api/vault — Get player's inventory */
export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const items = await prisma.vaultItem.findMany({
    where: { userId: user.id },
    orderBy: { acquiredAt: "desc" },
  });

  return NextResponse.json({ items });
}

/** POST /api/vault/use — Use an item from inventory */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { itemId, newUsername } = body as { itemId: string; newUsername?: string };

  const item = await prisma.vaultItem.findFirst({
    where: { id: itemId, userId: user.id, used: false },
  });

  if (!item) return NextResponse.json({ error: "Articulo no encontrado o ya usado" }, { status: 404 });

  // Apply item effect
  if (item.itemType === "name_change" && newUsername) {
    const existing = await prisma.user.findUnique({ where: { username: newUsername } });
    if (existing) return NextResponse.json({ error: "Ese nombre ya esta en uso" }, { status: 400 });

    await prisma.user.update({ where: { id: user.id }, data: { username: newUsername } });
  }

  if (item.itemType === "record_reset") {
    await prisma.user.update({
      where: { id: user.id },
      data: { peakScore: 0, tier: "Detri" },
    });
  }

  // Mark as used
  await prisma.vaultItem.update({
    where: { id: item.id },
    data: { used: true, usedAt: new Date() },
  });

  return NextResponse.json({ message: `${item.itemName} aplicado con exito` });
}
