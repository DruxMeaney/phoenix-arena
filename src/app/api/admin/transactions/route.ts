import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

/** GET /api/admin/transactions — List all transactions with filters */
export async function GET(request: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "100");

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (status) where.status = status;

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      wallet: {
        include: {
          user: { select: { id: true, username: true, avatar: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 500),
  });

  const mapped = transactions.map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    description: t.description,
    status: t.status,
    reference: t.reference,
    createdAt: t.createdAt,
    userId: t.wallet.user.id,
    username: t.wallet.user.username,
    avatar: t.wallet.user.avatar,
  }));

  return NextResponse.json({ transactions: mapped });
}
