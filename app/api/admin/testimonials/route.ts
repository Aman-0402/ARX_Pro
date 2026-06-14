import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-api-guard";

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.testimonial.findMany({ orderBy: { order: "asc" } }));
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, company, role, text, stars, avatar, order, active } = await req.json();
  if (!name || !text) return NextResponse.json({ error: "Name and text required" }, { status: 400 });
  const t = await prisma.testimonial.create({ data: { name, company: company || "", role: role || null, text, stars: Number(stars) || 5, avatar: avatar || null, order: Number(order) || 0, active: Boolean(active) } });
  return NextResponse.json(t, { status: 201 });
}
