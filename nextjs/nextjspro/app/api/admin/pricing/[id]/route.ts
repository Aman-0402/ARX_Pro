import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-api-guard";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { name, tagline, price, period, badge, badgeVariant, highlight, features, buttonLabel, order, active } = await req.json();
  const plan = await prisma.pricingPlan.update({
    where: { id: Number(id) },
    data: {
      name,
      tagline: tagline || "",
      price,
      period: period || "onwards",
      badge: badge || null,
      badgeVariant: badgeVariant || "gold",
      highlight: Boolean(highlight),
      features: Array.isArray(features) ? JSON.stringify(features) : (features || "[]"),
      buttonLabel: buttonLabel || "Get Quote",
      order: Number(order),
      active: Boolean(active),
    },
  });
  return NextResponse.json(plan);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.pricingPlan.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
