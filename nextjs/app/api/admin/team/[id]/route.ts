import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-api-guard";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  if (!isAdminAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, role, bio, photo, linkedin, twitter, order, active } = body;

  const member = await prisma.teamMember.update({
    where: { id: Number(id) },
    data: {
      name,
      role,
      bio: bio || null,
      photo: photo || null,
      linkedin: linkedin || null,
      twitter: twitter || null,
      order: Number(order) || 0,
      active: !!active,
    },
  });

  return NextResponse.json({ member });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isAdminAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.teamMember.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
