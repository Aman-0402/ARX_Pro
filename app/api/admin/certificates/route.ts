import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-api-guard";

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const certificates = await prisma.certificate.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ certificates });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { certificateId, holderName, courseName, issueDate, expiryDate, isValid } = body;

  if (!certificateId || !holderName || !courseName || !issueDate)
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 });

  const cert = await prisma.certificate.create({
    data: {
      certificateId: String(certificateId).trim().toUpperCase(),
      holderName,
      courseName,
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      isValid: isValid !== false,
    },
  });

  return NextResponse.json({ certificate: cert });
}
