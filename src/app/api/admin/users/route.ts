import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

/** GET /api/admin/users — List all users with key stats */
export async function GET(request: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const filter = searchParams.get("filter") || "all";

  const where: Record<string, unknown> = {};
  if (search) where.username = { contains: search };
  if (filter === "active") where.status = "active";
  if (filter === "flagged") where.isFlagged = true;

  const users = await prisma.user.findMany({
    where,
    include: {
      wallet: { select: { balance: true, heldBalance: true } },
      _count: {
        select: {
          matchRecords: true,
          tournamentEntries: true,
          disputesAsReporter: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const mapped = users.map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    avatar: u.avatar,
    discordId: u.discordId,
    role: u.role,
    status: u.status,
    tier: u.tier,
    peakScore: u.peakScore,
    trustScore: u.trustScore,
    trustLevel: u.trustLevel,
    isFlagged: u.isFlagged,
    xp: u.xp,
    region: u.region,
    platform: u.platform,
    activisionId: u.activisionId,
    createdAt: u.createdAt,
    lastSeen: u.lastSeen,
    balance: u.wallet?.balance ?? 0,
    heldBalance: u.wallet?.heldBalance ?? 0,
    matchCount: u._count.matchRecords,
    tournamentCount: u._count.tournamentEntries,
    disputeCount: u._count.disputesAsReporter,
  }));

  return NextResponse.json({ users: mapped });
}

/** PUT /api/admin/users — Update a user */
export async function PUT(request: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "User ID requerido" }, { status: 400 });

  const allowedFields = ["role", "status", "tier", "trustLevel", "isFlagged", "region", "platform", "activisionId"];
  const data: Record<string, unknown> = {};

  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      if (key === "isFlagged") data[key] = Boolean(updates[key]);
      else data[key] = updates[key];
    }
  }

  const updated = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ user: updated });
}
