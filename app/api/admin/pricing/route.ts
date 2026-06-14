import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-api-guard";

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.pricingPlan.findMany({ orderBy: { order: "asc" } }));
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, tagline, price, period, badge, badgeVariant, highlight, features, buttonLabel, order, active } = await req.json();
  if (!name || !price) return NextResponse.json({ error: "Name and price required" }, { status: 400 });
  const plan = await prisma.pricingPlan.create({
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
      order: Number(order) || 0,
      active: Boolean(active),
    },
  });
  return NextResponse.json(plan, { status: 201 });
}
