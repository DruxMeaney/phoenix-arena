import { cookies, headers } from "next/headers";
import { prisma } from "./db";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "1234";

/**
 * Get admin user for admin panel operations.
 * First tries Discord session (getAuthenticatedUser pattern).
 * Falls back to admin password header for password-gate access.
 * Returns a user object or null.
 */
export async function getAdminUser() {
  // Try Discord session first
  const cookieStore = await cookies();
  const raw = cookieStore.get("phoenix_session")?.value;

  if (raw) {
    try {
      const data = JSON.parse(raw);
      if (data.discordId) {
        const user = await prisma.user.findUnique({
          where: { discordId: data.discordId },
        });
        if (user && user.role === "admin") return user;
      }
    } catch {
      // Invalid session, continue to password check
    }
  }

  // Fallback: check admin password header from frontend
  const headerStore = await headers();
  const adminPass = headerStore.get("x-admin-password");

  if (adminPass === ADMIN_PASSWORD) {
    // Return first admin user, or create a system admin placeholder
    let admin = await prisma.user.findFirst({ where: { role: "admin" } });

    if (!admin) {
      // Create a system admin for password-gate access
      admin = await prisma.user.create({
        data: {
          username: "Phoenix Admin",
          role: "admin",
          wallet: { create: {} },
        },
      });
    }

    return admin;
  }

  return null;
}
