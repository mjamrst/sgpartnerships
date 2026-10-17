import { NextResponse, type NextRequest } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { createSession } from "@/lib/auth";
export async function POST(req: NextRequest) {
  if (
    req.headers.get("origin") &&
    new URL(req.headers.get("origin")!).host !== req.headers.get("host")
  )
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );
  const expected = process.env.APP_PASSWORD;
  if (!expected)
    return NextResponse.json(
      { error: "Workspace password has not been configured." },
      { status: 503 },
    );
  try {
    const { password } = await req.json();
    if (
      typeof password !== "string" ||
      password.length > 512 ||
      !timingSafeEqual(
        createHash("sha256").update(password).digest(),
        createHash("sha256").update(expected).digest(),
      )
    ) {
      await new Promise((r) => setTimeout(r, 700));
      return NextResponse.json(
        { error: "That password doesn't match. Please try again." },
        { status: 401 },
      );
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set("sg_session", await createSession(expected), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 86400,
    });
    return res;
  } catch {
    return NextResponse.json(
      { error: "Enter a valid password." },
      { status: 400 },
    );
  }
}
