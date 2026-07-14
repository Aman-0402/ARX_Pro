import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-api-guard";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { name, company, role, text, stars, avatar, order, active } = await req.json();
  const t = await prisma.testimonial.update({ where: { id: Number(id) }, data: { name, company, role: role || null, text, stars: Number(stars), avatar: avatar || null, order: Number(order), active: Boolean(active) } });
  return NextResponse.json(t);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.testimonial.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
