import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  getPsrRankingSnapshot,
  rebuildAndPersistPsrRankings,
} from "@/lib/ranking/psr-service";

/** GET /api/ranking - Compute the current PSR leaderboard without mutating audit tables. */
export async function GET() {
  const snapshot = await getPsrRankingSnapshot();
  return NextResponse.json(snapshot);
}

/** POST /api/ranking - Admin-only rebuild that persists event logs, deltas and snapshots. */
export async function POST() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
  }

  const snapshot = await rebuildAndPersistPsrRankings();
  return NextResponse.json(snapshot);
}
