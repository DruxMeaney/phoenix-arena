import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/feed — Get recent activity feed */
export async function GET() {
  const events = await prisma.feedEvent.findMany({
    include: { user: { select: { username: true, avatar: true, tier: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ events });
}
