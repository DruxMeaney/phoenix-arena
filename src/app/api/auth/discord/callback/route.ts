import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
  email?: string;
  verified?: boolean;
}

/**
 * GET /api/auth/discord/callback
 * Handles the Discord OAuth2 callback, exchanges code for tokens,
 * fetches user info, and sets a session cookie.
 */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${baseUrl}/login?error=discord_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=no_code`);
  }

  /* ── Validate state ──────────────────────────────────────── */
  const savedState = request.cookies.get("discord_oauth_state")?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${baseUrl}/login?error=invalid_state`);
  }

  /* ── Exchange code for token ─────────────────────────────── */
  const clientId = process.env.DISCORD_CLIENT_ID!;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET!;
  const redirectUri = process.env.DISCORD_REDIRECT_URI!;

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${baseUrl}/login?error=token_exchange_failed`);
  }

  const tokenData: DiscordTokenResponse = await tokenRes.json();

  /* ── Fetch Discord user ──────────────────────────────────── */
  const userRes = await fetch("https://discord.com/api/v10/users/@me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userRes.ok) {
    return NextResponse.redirect(`${baseUrl}/login?error=user_fetch_failed`);
  }

  const discordUser: DiscordUser = await userRes.json();

  /* ── Build session payload ───────────────────────────────── */
  const avatarUrl = discordUser.avatar
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordUser.discriminator || "0") % 5}.png`;

  const sessionPayload = {
    provider: "discord" as const,
    discordId: discordUser.id,
    username: discordUser.global_name || discordUser.username,
    email: discordUser.email || null,
    avatar: avatarUrl,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: Date.now() + tokenData.expires_in * 1000,
  };

  /* ── Persist user in database ──────────────────────────────── */
  let dbUser = await prisma.user.findUnique({
    where: { discordId: discordUser.id },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        username: sessionPayload.username,
        email: sessionPayload.email,
        avatar: avatarUrl,
        discordId: discordUser.id,
        wallet: { create: {} },
      },
    });
  } else {
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { avatar: avatarUrl, username: sessionPayload.username },
    });
  }

  /* ── Set session cookie & redirect ───────────────────────── */
  const response = NextResponse.redirect(`${baseUrl}/perfil`);

  response.cookies.set("phoenix_session", JSON.stringify(sessionPayload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: tokenData.expires_in,
    sameSite: "lax",
    path: "/",
  });

  // Public cookie for client-side UI (no tokens)
  response.cookies.set(
    "phoenix_user",
    JSON.stringify({
      username: sessionPayload.username,
      avatar: sessionPayload.avatar,
      provider: "discord",
    }),
    {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: tokenData.expires_in,
      sameSite: "lax",
      path: "/",
    }
  );

  response.cookies.delete("discord_oauth_state");

  return response;
}
