import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/me
 * Returns the current session info (public fields only).
 */
export async function GET(request: NextRequest) {
  const session = request.cookies.get("phoenix_session")?.value;

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  try {
    const data = JSON.parse(session);
    return NextResponse.json({
      authenticated: true,
      user: {
        username: data.username,
        avatar: data.avatar,
        email: data.email,
        provider: data.provider,
        discordId: data.discordId,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
