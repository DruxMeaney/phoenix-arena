import { cookies } from "next/headers";
import { prisma } from "./db";

/** Get the current session from cookies. Returns null if not authenticated. */
export async function getSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("phoenix_session")?.value;
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);
    return data as {
      provider: string;
      discordId: string;
      username: string;
      email: string | null;
      avatar: string;
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    };
  } catch {
    return null;
  }
}

/** Get or create a User record from a Discord session. */
export async function getOrCreateUser(session: NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  let user = await prisma.user.findUnique({
    where: { discordId: session.discordId },
    include: { wallet: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        username: session.username,
        email: session.email,
        avatar: session.avatar,
        discordId: session.discordId,
        wallet: { create: {} },
      },
      include: { wallet: true },
    });
  }

  return user;
}

/** Get the authenticated user or return null. */
export async function getAuthenticatedUser() {
  const session = await getSession();
  if (!session) return null;
  return getOrCreateUser(session);
}
