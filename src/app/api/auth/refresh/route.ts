import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/refresh
 * Silently refreshes the Discord token if it's about to expire.
 * Called automatically by the client on page load.
 */
export async function GET(request: NextRequest) {
  const sessionRaw = request.cookies.get("phoenix_session")?.value;
  if (!sessionRaw) {
    return NextResponse.json({ refreshed: false, reason: "no_session" });
  }

  try {
    const session = JSON.parse(sessionRaw);

    // Check if token expires in less than 24 hours
    const expiresIn = session.expiresAt - Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (expiresIn > oneDayMs) {
      return NextResponse.json({ refreshed: false, reason: "still_valid" });
    }

    // Refresh the Discord token
    const clientId = process.env.DISCORD_CLIENT_ID!;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET!;

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: session.refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.json({ refreshed: false, reason: "refresh_failed" });
    }

    const tokenData = await tokenRes.json();

    // Update session with new tokens
    const updatedSession = {
      ...session,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
    };

    const thirtyDays = 30 * 24 * 60 * 60;
    const response = NextResponse.json({ refreshed: true });

    response.cookies.set("phoenix_session", JSON.stringify(updatedSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: thirtyDays,
      sameSite: "lax",
      path: "/",
    });

    response.cookies.set(
      "phoenix_user",
      JSON.stringify({
        username: updatedSession.username,
        avatar: updatedSession.avatar,
        provider: "discord",
      }),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        maxAge: thirtyDays,
        sameSite: "lax",
        path: "/",
      }
    );

    return response;
  } catch {
    return NextResponse.json({ refreshed: false, reason: "error" });
  }
}
