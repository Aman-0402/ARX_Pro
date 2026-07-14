import { NextRequest, NextResponse } from "next/server";
import {
  verifyCredentials,
  getSessionSecret,
  ADMIN_COOKIE,
  COOKIE_MAX_AGE,
} from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!verifyCredentials(String(username), String(password))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = getSessionSecret();
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}
