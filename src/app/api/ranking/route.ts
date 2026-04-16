import { NextResponse } from "next/server";
import { recalculateAllRankings } from "@/lib/scoring/recalculate";

/** GET /api/ranking — Compute and return full rankings */
export async function GET() {
  const result = await recalculateAllRankings();
  return NextResponse.json(result);
}
