import { NextResponse } from "next/server";
import { setAdminSessionCookie, verifyAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const payload = (await request.json()) as { password?: string };
  const password = payload.password ?? "";

  if (!verifyAdminPassword(password)) {
    return NextResponse.json(
      { message: "Wrong password." },
      {
        status: 401,
      },
    );
  }

  await setAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
