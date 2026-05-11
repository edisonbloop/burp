import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body as { password: string };

    if (!password) {
      return NextResponse.json({ success: false, message: "Password required" }, { status: 400 });
    }

    const submissionPassword = process.env.SUBMISSION_PASSWORD;
    if (!submissionPassword) {
      return NextResponse.json({ success: false, message: "Server misconfigured" }, { status: 500 });
    }

    if (password !== submissionPassword) {
      return NextResponse.json({ success: false, message: "Incorrect password" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
  }
}
