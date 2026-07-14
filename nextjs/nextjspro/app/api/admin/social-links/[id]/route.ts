import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-api-guard";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { platform, label, url, order, active } = await req.json();
  const link = await prisma.socialLink.update({
    where: { id: Number(id) },
    data: { platform, label, url, order: Number(order), active: Boolean(active) },
  });
  return NextResponse.json(link);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.socialLink.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
