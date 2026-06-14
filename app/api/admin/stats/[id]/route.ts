import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-api-guard";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { icon, target, suffix, label, order, active } = await req.json();
  const stat = await prisma.stat.update({ where: { id: Number(id) }, data: { icon, target: Number(target), suffix, label, order: Number(order), active: Boolean(active) } });
  return NextResponse.json(stat);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.stat.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
