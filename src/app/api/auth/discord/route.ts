import { NextResponse } from "next/server";

/**
 * GET /api/auth/discord
 * Redirects the user to Discord's OAuth2 authorization page.
 */
export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Discord OAuth2 no configurado en el servidor." },
      { status: 500 }
    );
  }

  const state = crypto.randomUUID();
  const scopes = "identify email guilds";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    state,
    prompt: "consent",
  });

  const url = `https://discord.com/oauth2/authorize?${params.toString()}`;

  const response = NextResponse.redirect(url);
  response.cookies.set("discord_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600, // 10 min
    sameSite: "lax",
    path: "/",
  });

  return response;
}
