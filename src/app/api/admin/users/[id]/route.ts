import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

/** GET /api/admin/users/[id] — Full user detail */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const target = await prisma.user.findUnique({
    where: { id },
    include: {
      wallet: {
        include: {
          transactions: { orderBy: { createdAt: "desc" }, take: 50 },
        },
      },
      matchRecords: { orderBy: { date: "desc" }, take: 50 },
      tournamentEntries: {
        include: { tournament: { select: { id: true, name: true, status: true, tournamentType: true } } },
        orderBy: { joinedAt: "desc" },
      },
      tournamentResults: {
        include: { tournament: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
      participations: {
        include: { match: { select: { id: true, game: true, modalidad: true, amount: true, status: true } } },
        orderBy: { joinedAt: "desc" },
        take: 30,
      },
      disputesAsReporter: { orderBy: { createdAt: "desc" } },
      purchases: { orderBy: { createdAt: "desc" }, take: 20 },
      vaultItems: { where: { used: false } },
      profilePosts: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!target) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  return NextResponse.json({ user: target });
}
