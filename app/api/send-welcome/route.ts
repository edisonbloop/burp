import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, firstName } = await req.json();
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });
    await sendWelcomeEmail(email, firstName ?? "");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Welcome email error:", e);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
