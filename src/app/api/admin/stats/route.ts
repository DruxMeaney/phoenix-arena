import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** GET /api/admin/stats — Dashboard metrics for admin panel */
export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const [
    totalUsers,
    activeUsers,
    matchesToday,
    matchesWeek,
    pendingDisputes,
    totalDisputes,
    allTransactions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "active" } }),
    prisma.match.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.match.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.dispute.count({ where: { status: { in: ["open", "in_review"] } } }),
    prisma.dispute.count(),
    prisma.transaction.findMany({
      where: { createdAt: { gte: weekStart }, status: "completed" },
      select: { amount: true },
    }),
  ]);

  const weeklyVolume = allTransactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const disputeRate = matchesWeek > 0 ? ((pendingDisputes / matchesWeek) * 100).toFixed(1) : "0";

  return NextResponse.json({
    totalUsers,
    activeUsers,
    matchesToday,
    matchesWeek,
    weeklyVolume,
    pendingDisputes,
    totalDisputes,
    disputeRate,
  });
}
