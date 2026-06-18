import { NextResponse } from "next/server";
import {
  hasAdminCredentials,
  markAdminLoginSuccess,
  setAdminSessionCookie,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const payload = (await request.json()) as { email?: string; password?: string };
  const email = payload.email ?? "";
  const password = payload.password ?? "";

  const isRegistered = await hasAdminCredentials();
  if (!isRegistered) {
    return NextResponse.json(
      { message: "Admin account not registered yet. Create it first." },
      {
        status: 409,
      },
    );
  }

  const isValid = await verifyAdminCredentials(email, password);
  if (!isValid) {
    return NextResponse.json(
      { message: "Invalid email or password." },
      {
        status: 401,
      },
    );
  }

  await markAdminLoginSuccess(email);
  await setAdminSessionCookie(email);
  return NextResponse.json({ ok: true });
}
