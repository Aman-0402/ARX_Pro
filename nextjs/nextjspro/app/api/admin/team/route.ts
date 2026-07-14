import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-api-guard";

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const members = await prisma.teamMember.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ members });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, role, bio, photo, linkedin, twitter, order, active } = body;

  if (!name || !role)
    return NextResponse.json({ error: "Name and role required" }, { status: 400 });

  const member = await prisma.teamMember.create({
    data: {
      name,
      role,
      bio: bio || null,
      photo: photo || null,
      linkedin: linkedin || null,
      twitter: twitter || null,
      order: Number(order) || 0,
      active: active !== false,
    },
  });

  return NextResponse.json({ member });
}
