import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-api-guard";

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const services = await prisma.service.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { title, description, icon, image, order, active } = body;
  if (!title || !description) return NextResponse.json({ error: "Title and description required" }, { status: 400 });
  const service = await prisma.service.create({
    data: {
      title,
      description,
      icon: icon || "briefcase",
      image: image || null,
      order: Number(order) || 0,
      active: Boolean(active),
    },
  });
  return NextResponse.json(service, { status: 201 });
}
