import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-api-guard";

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.socialLink.findMany({ orderBy: { order: "asc" } }));
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { platform, label, url, order, active } = await req.json();
  if (!platform || !url) return NextResponse.json({ error: "Platform and URL required" }, { status: 400 });
  const link = await prisma.socialLink.create({
    data: { platform, label: label || platform, url, order: Number(order) || 0, active: active !== false },
  });
  return NextResponse.json(link, { status: 201 });
}
