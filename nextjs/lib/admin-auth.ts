export const ADMIN_COOKIE = "arx_admin_session";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function verifyCredentials(username: string, password: string): boolean {
  return (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  );
}

export function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  return secret;
}
