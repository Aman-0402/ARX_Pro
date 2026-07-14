import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-api-guard";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  if (!isAdminAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { certificateId, holderName, courseName, issueDate, expiryDate, isValid } = body;

  const cert = await prisma.certificate.update({
    where: { id: Number(id) },
    data: {
      certificateId: String(certificateId).trim().toUpperCase(),
      holderName,
      courseName,
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      isValid: !!isValid,
    },
  });

  return NextResponse.json({ certificate: cert });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isAdminAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.certificate.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
