import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** GET /api/profile — Get full profile data */
export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const full = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      wallet: true,
      profilePosts: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!full) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  return NextResponse.json({
    id: full.id,
    username: full.username,
    email: full.email,
    avatar: full.avatar,
    banner: full.banner,
    bio: full.bio,
    motto: full.motto,
    socialTwitter: full.socialTwitter,
    socialYoutube: full.socialYoutube,
    socialTwitch: full.socialTwitch,
    favoriteGame: full.favoriteGame,
    favoriteWeapon: full.favoriteWeapon,
    profileTheme: full.profileTheme,
    region: full.region,
    activisionId: full.activisionId,
    platform: full.platform,
    tier: full.tier,
    xp: full.xp,
    seasonXp: full.seasonXp,
    peakScore: full.peakScore,
    createdAt: full.createdAt,
    balance: full.wallet?.balance ?? 0,
    posts: full.profilePosts,
  });
}

/** PUT /api/profile — Update profile fields */
export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const allowedFields = [
    "bio", "motto", "banner", "avatar",
    "socialTwitter", "socialYoutube", "socialTwitch",
    "favoriteGame", "favoriteWeapon", "profileTheme", "region",
  ];

  const updateData: Record<string, string> = {};
  for (const key of allowedFields) {
    if (key in body && typeof body[key] === "string") {
      updateData[key] = body[key];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  return NextResponse.json({ message: "Perfil actualizado", username: updated.username });
}
