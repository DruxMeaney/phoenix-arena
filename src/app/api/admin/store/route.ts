import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** GET /api/admin/store — List all store items (including inactive) */
export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const items = await prisma.storeItem.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ items });
}

/** POST /api/admin/store — Create a new store item */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { slug, type, name, description, price, credits, imageUrl, sortOrder } = body;

  if (!slug || !type || !name || !description || price == null) {
    return NextResponse.json({ error: "Campos requeridos: slug, type, name, description, price" }, { status: 400 });
  }

  const existing = await prisma.storeItem.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: "Slug ya existe" }, { status: 400 });

  const item = await prisma.storeItem.create({
    data: {
      slug,
      type,
      name,
      description,
      price: parseFloat(price),
      credits: parseInt(credits) || 0,
      imageUrl: imageUrl || null,
      sortOrder: parseInt(sortOrder) || 0,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}

/** PUT /api/admin/store — Update a store item */
export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "Item ID requerido" }, { status: 400 });

  const allowedFields = ["name", "description", "price", "credits", "imageUrl", "isActive", "sortOrder", "type"];
  const data: Record<string, unknown> = {};

  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      if (key === "price") data[key] = parseFloat(updates[key]);
      else if (key === "credits" || key === "sortOrder") data[key] = parseInt(updates[key]);
      else if (key === "isActive") data[key] = Boolean(updates[key]);
      else data[key] = updates[key];
    }
  }

  const item = await prisma.storeItem.update({ where: { id }, data });
  return NextResponse.json({ item });
}

/** DELETE /api/admin/store — Soft-delete (deactivate) a store item */
export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Item ID requerido" }, { status: 400 });

  await prisma.storeItem.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ message: "Producto desactivado" });
}
