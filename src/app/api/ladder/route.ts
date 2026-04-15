import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/ladder — Get current season ladder */
export async function GET() {
  // Get top players by seasonXp
  const players = await prisma.user.findMany({
    where: { status: "active", seasonXp: { gt: 0 } },
    select: {
      id: true,
      username: true,
      avatar: true,
      tier: true,
      seasonXp: true,
      xp: true,
    },
    orderBy: { seasonXp: "desc" },
    take: 50,
  });

  const ranked = players.map((p, i) => ({
    rank: i + 1,
    ...p,
  }));

  // XP rewards for top 8
  const rewards = [
    { rank: 1, prize: "$100", xpBonus: 500 },
    { rank: 2, prize: "$60", xpBonus: 300 },
    { rank: 3, prize: "$40", xpBonus: 200 },
    { rank: 4, prize: "$25", xpBonus: 150 },
    { rank: 5, prize: "$15", xpBonus: 100 },
    { rank: 6, prize: "$10", xpBonus: 75 },
    { rank: 7, prize: "$8", xpBonus: 50 },
    { rank: 8, prize: "$5", xpBonus: 25 },
  ];

  return NextResponse.json({ ladder: ranked, rewards });
}
