import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

/** GET /api/community?search=&filter=online|all — List users, search, filter online */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const filter = searchParams.get("filter") || "all";

  // Update lastSeen for authenticated user
  const currentUser = await getAuthenticatedUser();
  if (currentUser) {
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { lastSeen: new Date() },
    }).catch(() => {});
  }

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const where: Record<string, unknown> = { status: "active" };

  if (search) {
    where.username = { contains: search };
  }

  if (filter === "online") {
    where.lastSeen = { gte: fiveMinutesAgo };
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      username: true,
      avatar: true,
      tier: true,
      xp: true,
      peakScore: true,
      region: true,
      bio: true,
      motto: true,
      profileTheme: true,
      lastSeen: true,
      createdAt: true,
    },
    orderBy: { lastSeen: "desc" },
    take: 50,
  });

  const mapped = users.map((u) => ({
    ...u,
    isOnline: u.lastSeen >= fiveMinutesAgo,
    level: Math.floor(u.xp / 100),
  }));

  const onlineCount = mapped.filter((u) => u.isOnline).length;

  return NextResponse.json({ users: mapped, onlineCount, total: mapped.length });
}
