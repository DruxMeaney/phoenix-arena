import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** GET /api/tournaments — List tournaments */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status"); // registration, in_progress, finished

  const where = status ? { status } : {};

  const tournaments = await prisma.tournament.findMany({
    where,
    include: {
      entries: {
        include: { user: { select: { id: true, username: true, avatar: true, tier: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ tournaments });
}

/** POST /api/tournaments — Create tournament (admin only) */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const { name, game, format, tournamentType, entryFee, maxSlots, startDate } = body;

  const tournament = await prisma.tournament.create({
    data: {
      name,
      game: game || "Warzone",
      format,
      tournamentType: tournamentType || "detri",
      entryFee,
      maxSlots,
      startDate: startDate ? new Date(startDate) : null,
    },
  });

  return NextResponse.json({ tournament }, { status: 201 });
}
