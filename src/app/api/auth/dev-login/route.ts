import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/auth/dev-login
 *
 * Test-only bypass for Discord OAuth. Creates (or reuses) a test user with
 * the requested username and sets the phoenix_session cookie so the rest
 * of the app behaves as if the user logged in via Discord.
 *
 * Guarded by NODE_ENV !== "production" AND a separate ENABLE_DEV_LOGIN=1
 * env var so it can never be turned on accidentally in production by
 * environment misconfiguration alone.
 *
 * Body: { username?: string }  — defaults to "test_player".
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production" || process.env.ENABLE_DEV_LOGIN !== "1") {
    return NextResponse.json({ error: "Dev login no habilitado" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const username = (typeof body?.username === "string" && body.username.trim()) || "test_player";

  // A fake but stable Discord id so repeated calls reuse the same user.
  const fakeDiscordId = `dev:${username}`;

  let user = await prisma.user.findUnique({
    where: { discordId: fakeDiscordId },
    include: { wallet: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        username,
        email: `${username}@dev.local`,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`,
        discordId: fakeDiscordId,
        wallet: { create: {} },
      },
      include: { wallet: true },
    });
  }

  const sessionPayload = {
    provider: "dev" as const,
    discordId: fakeDiscordId,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    accessToken: "dev-token",
    refreshToken: "dev-refresh",
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };

  const response = NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      balance: user.wallet?.balance ?? 0,
    },
  });

  const thirtyDays = 30 * 24 * 60 * 60;
  response.cookies.set("phoenix_session", JSON.stringify(sessionPayload), {
    httpOnly: true,
    secure: false, // dev only
    maxAge: thirtyDays,
    sameSite: "lax",
    path: "/",
  });
  response.cookies.set(
    "phoenix_user",
    JSON.stringify({ username: user.username, avatar: user.avatar, provider: "dev" }),
    { httpOnly: false, secure: false, maxAge: thirtyDays, sameSite: "lax", path: "/" },
  );

  return response;
}
