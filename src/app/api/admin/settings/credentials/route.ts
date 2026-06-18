import { NextResponse } from "next/server";
import {
  getRegisteredAdminEmail,
  isEmailChangeOtpConfigured,
  isAdminAuthenticated,
  resetAdminCredentials,
} from "@/lib/admin-auth";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const email = await getRegisteredAdminEmail();
  const otpConfigured = await isEmailChangeOtpConfigured();
  return NextResponse.json({ email, emailLocked: true, otpConfigured });
}

export async function PUT(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    currentPassword?: string;
    password?: string;
    confirmPassword?: string;
  };

  const currentPassword = payload.currentPassword ?? "";
  const password = payload.password ?? "";
  const confirmPassword = payload.confirmPassword ?? "";

  if (password !== confirmPassword) {
    return NextResponse.json(
      { message: "Password confirmation does not match." },
      { status: 400 },
    );
  }

  const result = await resetAdminCredentials(currentPassword, password);
  if (!result.ok) {
    const status =
      result.message === "Current password is incorrect." ? 401 : 400;
    return NextResponse.json(
      { message: result.message ?? "Could not update credentials." },
      { status },
    );
  }

  return NextResponse.json({ ok: true, message: "Password updated." });
}
