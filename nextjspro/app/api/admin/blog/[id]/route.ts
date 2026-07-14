import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-api-guard";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  if (!isAdminAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, slug, excerpt, content, coverImage, category, tags, author, published } = body;

  const existing = await prisma.blogPost.findUnique({ where: { id: Number(id) } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const post = await prisma.blogPost.update({
    where: { id: Number(id) },
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage: coverImage || null,
      category,
      tags: tags || null,
      author,
      published: !!published,
      publishedAt: published && !existing.published ? new Date() : existing.publishedAt,
    },
  });

  return NextResponse.json({ post });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isAdminAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.blogPost.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
