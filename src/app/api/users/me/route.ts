import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      region: user.region,
      activisionId: user.activisionId,
      platform: user.platform,
      discordId: user.discordId,
      role: user.role,
      tier: user.tier,
      peakScore: user.peakScore,
      createdAt: user.createdAt,
      balance: user.wallet?.balance ?? 0,
      heldBalance: user.wallet?.heldBalance ?? 0,
    },
  });
}
