import { NextRequest } from "next/server";

export function isAdminAuthenticated(req: NextRequest): boolean {
  const cookie = req.cookies.get("arx_admin_session");
  const secret = process.env.ADMIN_SESSION_SECRET;
  return !!(cookie && secret && cookie.value === secret);
}
