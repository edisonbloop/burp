import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session";
export const ADMIN_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * The admin cookie used to be the literal string "authenticated", which anyone
 * could forge by hand-setting a cookie. It's now an expiring token signed with
 * a server-only secret: "<expiresAtMs>.<hmac>". Without the secret a valid
 * token can't be produced, and changing the secret/password invalidates every
 * existing session.
 */
function getSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || null;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(`burp-admin:${payload}`).digest("hex");
}

export function createAdminSessionToken(): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const expires = String(Date.now() + ADMIN_SESSION_TTL_MS);
  return `${expires}.${sign(expires, secret)}`;
}

export function verifyAdminSessionToken(token: string | null | undefined): boolean {
  const secret = getSecret();
  if (!secret || !token) return false;

  const [expires, signature, ...rest] = token.split(".");
  if (!expires || !signature || rest.length > 0) return false;
  if (!/^\d+$/.test(expires) || Number(expires) < Date.now()) return false;

  const expected = Buffer.from(sign(expires, secret));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export async function isAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

export async function requireAdminSession(): Promise<void> {
  if (!(await isAdminSession())) throw new Error("Unauthorized");
}
