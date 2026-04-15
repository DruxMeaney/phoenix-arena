import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** GET /api/profile/posts — Get user's posts */
export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const posts = await prisma.profilePost.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ posts });
}

/** POST /api/profile/posts — Create a new post */
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { content, imageUrl, postType } = body as {
    content: string;
    imageUrl?: string;
    postType?: string;
  };

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: "El contenido es requerido" }, { status: 400 });
  }

  if (content.length > 500) {
    return NextResponse.json({ error: "Maximo 500 caracteres" }, { status: 400 });
  }

  const post = await prisma.profilePost.create({
    data: {
      userId: user.id,
      content: content.trim(),
      imageUrl: imageUrl || null,
      postType: postType || "update",
    },
  });

  // Feed event
  await prisma.feedEvent.create({
    data: {
      userId: user.id,
      type: "post",
      title: "Nueva publicacion",
      description: `${user.username}: ${content.trim().slice(0, 80)}${content.length > 80 ? "..." : ""}`,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}

/** DELETE /api/profile/posts — Delete a post */
export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("id");

  if (!postId) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const post = await prisma.profilePost.findFirst({
    where: { id: postId, userId: user.id },
  });

  if (!post) return NextResponse.json({ error: "Post no encontrado" }, { status: 404 });

  await prisma.profilePost.delete({ where: { id: postId } });

  return NextResponse.json({ message: "Post eliminado" });
}
