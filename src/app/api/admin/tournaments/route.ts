import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

/** GET /api/admin/tournaments — List all tournaments with full details */
export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const tournaments = await prisma.tournament.findMany({
    include: {
      entries: {
        include: { user: { select: { id: true, username: true, avatar: true, tier: true } } },
      },
      results: {
        include: { user: { select: { id: true, username: true, avatar: true } } },
      },
      creator: { select: { id: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tournaments });
}

/** POST /api/admin/tournaments — Create a tournament */
export async function POST(request: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { name, game, format, tournamentType, entryFee, maxSlots, startDate, description, rules } = body;

  if (!name || !format || entryFee == null || !maxSlots) {
    return NextResponse.json({ error: "Campos requeridos: name, format, entryFee, maxSlots" }, { status: 400 });
  }

  const tournament = await prisma.tournament.create({
    data: {
      name,
      game: game || "Warzone",
      format,
      tournamentType: tournamentType || "detri",
      entryFee: parseFloat(entryFee),
      maxSlots: parseInt(maxSlots),
      startDate: startDate ? new Date(startDate) : null,
      description: description || null,
      rules: rules || null,
      createdById: user.id,
    },
  });

  return NextResponse.json({ tournament }, { status: 201 });
}

/** PUT /api/admin/tournaments — Update a tournament */
export async function PUT(request: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "Tournament ID requerido" }, { status: 400 });

  const allowedFields = ["name", "game", "format", "tournamentType", "entryFee", "maxSlots", "status", "startDate", "description", "rules", "prizePool", "evidenceUrl"];
  const data: Record<string, unknown> = {};

  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      if (key === "entryFee" || key === "prizePool") data[key] = parseFloat(updates[key]);
      else if (key === "maxSlots") data[key] = parseInt(updates[key]);
      else if (key === "startDate") data[key] = updates[key] ? new Date(updates[key]) : null;
      else data[key] = updates[key];
    }
  }

  const tournament = await prisma.tournament.update({
    where: { id },
    data,
  });

  return NextResponse.json({ tournament });
}
