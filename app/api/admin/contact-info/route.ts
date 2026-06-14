import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-api-guard";

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const info = await prisma.siteContact.findFirst();
  return NextResponse.json(info ?? null);
}

export async function PUT(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const info = await prisma.siteContact.upsert({
    where: { id: 1 },
    update: { address: body.address, phone: body.phone, email: body.email, whatsapp: body.whatsapp, mapEmbed: body.mapEmbed },
    create: { id: 1, address: body.address, phone: body.phone, email: body.email, whatsapp: body.whatsapp, mapEmbed: body.mapEmbed },
  });
  return NextResponse.json(info);
}
