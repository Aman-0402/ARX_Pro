import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const certId = searchParams.get("id");

  if (!certId || !certId.trim()) {
    return NextResponse.json(
      { error: "Certificate ID is required" },
      { status: 400 }
    );
  }

  try {
    const certificate = await prisma.certificate.findUnique({
      where: { certificateId: certId.trim().toUpperCase() },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found. Please check the ID and try again." },
        { status: 404 }
      );
    }

    return NextResponse.json({ certificate });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
