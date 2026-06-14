import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-api-guard";

const toSlug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.portfolioItem.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, slug, category, description, content, image, tags, clientName, liveUrl, featured, order } = body;

  if (!title || !category || !description)
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 });

  const item = await prisma.portfolioItem.create({
    data: {
      title,
      slug: slug ? String(slug) : toSlug(title),
      category,
      description,
      content: content || null,
      image: image || null,
      tags: tags || null,
      clientName: clientName || null,
      liveUrl: liveUrl || null,
      featured: !!featured,
      order: Number(order) || 0,
    },
  });

  return NextResponse.json({ item });
}
