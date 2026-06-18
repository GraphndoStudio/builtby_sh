import { NextResponse } from "next/server";
import {
  hasAdminCredentials,
  markAdminLoginSuccess,
  registerAdminCredentials,
  setAdminSessionCookie,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    email?: string;
    password?: string;
    confirmPassword?: string;
  };

  const email = payload.email ?? "";
  const password = payload.password ?? "";
  const confirmPassword = payload.confirmPassword ?? "";

  if (password !== confirmPassword) {
    return NextResponse.json(
      { message: "Password confirmation does not match." },
      { status: 400 },
    );
  }

  if (await hasAdminCredentials()) {
    return NextResponse.json(
      { message: "Admin account is already registered." },
      { status: 409 },
    );
  }

  const result = await registerAdminCredentials(email, password);
  if (!result.ok) {
    return NextResponse.json(
      { message: result.message ?? "Could not create admin account." },
      { status: 400 },
    );
  }

  await markAdminLoginSuccess(email);
  await setAdminSessionCookie(email);
  return NextResponse.json({ ok: true });
}
