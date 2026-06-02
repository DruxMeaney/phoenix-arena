import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import {
  PRIZE_DISTRIBUTION_VALUES,
  validateCustomSplits,
} from "@/lib/prize-splits";

const PRIZE_DISTRIBUTION_SET = new Set<string>(PRIZE_DISTRIBUTION_VALUES);

/**
 * Normalise the prize-distribution inputs from the admin form. Returns the
 * fields to persist or an error message if invalid.
 */
function parsePrizeDistribution(updates: Record<string, unknown>):
  | { error: string }
  | { prizeDistribution?: string; customPrizeSplits?: string | null } {
  const result: { prizeDistribution?: string; customPrizeSplits?: string | null } = {};

  if (updates.prizeDistribution !== undefined) {
    const dist = String(updates.prizeDistribution);
    if (!PRIZE_DISTRIBUTION_SET.has(dist)) {
      return { error: `prizeDistribution invalido: ${dist}` };
    }
    result.prizeDistribution = dist;
  }

  if (updates.customPrizeSplits !== undefined) {
    const raw = updates.customPrizeSplits;
    if (raw === null || raw === "") {
      result.customPrizeSplits = null;
    } else {
      let parsed: unknown = raw;
      if (typeof raw === "string") {
        try {
          parsed = JSON.parse(raw);
        } catch {
          return { error: "customPrizeSplits debe ser JSON valido" };
        }
      }
      const err = validateCustomSplits(parsed);
      if (err) return { error: err };
      result.customPrizeSplits = JSON.stringify(parsed);
    }
  }

  return result;
}

/** GET /api/admin/tournaments — List all tournaments with full details */
export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
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
  } catch (err) {
    console.error("Admin tournaments GET error:", err);
    // Fallback: try without results relation in case of schema mismatch
    try {
      const tournaments = await prisma.tournament.findMany({
        include: {
          entries: {
            include: { user: { select: { id: true, username: true, avatar: true, tier: true } } },
          },
          creator: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ tournaments: tournaments.map((t: Record<string, unknown>) => ({ ...t, results: [] })) });
    } catch (fallbackErr) {
      console.error("Admin tournaments fallback error:", fallbackErr);
      return NextResponse.json({ error: "Error al cargar torneos", detail: String(fallbackErr) }, { status: 500 });
    }
  }
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

  const prize = parsePrizeDistribution(body);
  if ("error" in prize) return NextResponse.json({ error: prize.error }, { status: 400 });

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
      ...(prize.prizeDistribution !== undefined && { prizeDistribution: prize.prizeDistribution }),
      ...(prize.customPrizeSplits !== undefined && { customPrizeSplits: prize.customPrizeSplits }),
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

  const prize = parsePrizeDistribution(updates);
  if ("error" in prize) return NextResponse.json({ error: prize.error }, { status: 400 });
  if (prize.prizeDistribution !== undefined) data.prizeDistribution = prize.prizeDistribution;
  if (prize.customPrizeSplits !== undefined) data.customPrizeSplits = prize.customPrizeSplits;

  const tournament = await prisma.tournament.update({
    where: { id },
    data,
  });

  return NextResponse.json({ tournament });
}
