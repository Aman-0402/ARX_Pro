import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-api-guard";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  if (!isAdminAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, slug, category, description, content, image, tags, clientName, liveUrl, featured, order } = body;

  const item = await prisma.portfolioItem.update({
    where: { id: Number(id) },
    data: {
      title,
      slug,
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

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isAdminAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.portfolioItem.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
