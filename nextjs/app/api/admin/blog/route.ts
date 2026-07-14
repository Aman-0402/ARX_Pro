import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-api-guard";

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, slug, excerpt, content, coverImage, category, tags, author, published } = body;

  if (!title || !slug || !excerpt || !content || !category || !author)
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 });

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug: String(slug).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, ""),
      excerpt,
      content,
      coverImage: coverImage || null,
      category,
      tags: tags || null,
      author,
      published: !!published,
      publishedAt: published ? new Date() : null,
    },
  });

  return NextResponse.json({ post });
}
