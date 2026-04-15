import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/community/[id] — Get public profile of a user */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      avatar: true,
      banner: true,
      bio: true,
      motto: true,
      socialTwitter: true,
      socialYoutube: true,
      socialTwitch: true,
      favoriteGame: true,
      favoriteWeapon: true,
      profileTheme: true,
      tier: true,
      xp: true,
      seasonXp: true,
      peakScore: true,
      region: true,
      lastSeen: true,
      createdAt: true,
      profilePosts: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, content: true, postType: true, createdAt: true },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

  return NextResponse.json({
    ...user,
    isOnline: user.lastSeen >= fiveMinAgo,
    level: Math.floor(user.xp / 100),
  });
}
