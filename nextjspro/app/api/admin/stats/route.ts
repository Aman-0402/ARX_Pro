import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-api-guard";

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.stat.findMany({ orderBy: { order: "asc" } }));
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { icon, target, suffix, label, order, active } = await req.json();
  if (!label || target === undefined) return NextResponse.json({ error: "Label and target required" }, { status: 400 });
  const stat = await prisma.stat.create({ data: { icon: icon || "users", target: Number(target), suffix: suffix || "+", label, order: Number(order) || 0, active: Boolean(active) } });
  return NextResponse.json(stat, { status: 201 });
}
