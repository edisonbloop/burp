import { createHash, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_SESSION_TTL_MS, createAdminSessionToken } from "@/lib/admin-session";

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

// Best-effort per-instance lockout. On serverless this resets when an instance
// recycles, but it still stops rapid password guessing against a warm instance.
const failures = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function passwordsMatch(given: string, expected: string): boolean {
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  try {
    const key = clientKey(request);
    const now = Date.now();
    const entry = failures.get(key);
    if (entry && entry.resetAt > now && entry.count >= MAX_FAILURES) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return NextResponse.json(
        { success: false, message: "Too many attempts. Try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    const body = await request.json();
    const { password } = body as { password: string };

    if (!password || typeof password !== "string") {
      return NextResponse.json({ success: false, message: "Password required" }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json({ success: false, message: "Server misconfigured" }, { status: 500 });
    }

    if (!passwordsMatch(password, adminPassword)) {
      const current = entry && entry.resetAt > now ? entry : { count: 0, resetAt: now + WINDOW_MS };
      failures.set(key, { count: current.count + 1, resetAt: current.resetAt });
      return NextResponse.json({ success: false, message: "Incorrect password" }, { status: 401 });
    }

    const token = createAdminSessionToken();
    if (!token) {
      return NextResponse.json({ success: false, message: "Server misconfigured" }, { status: 500 });
    }

    failures.delete(key);
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ADMIN_SESSION_TTL_MS / 1000,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
  }
}
