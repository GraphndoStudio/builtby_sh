import { NextResponse } from "next/server";
import {
  changeAdminEmailWithOtp,
  isAdminAuthenticated,
  setAdminSessionCookie,
} from "@/lib/admin-auth";

export async function PUT(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    currentPassword?: string;
    nextEmail?: string;
    otpCode?: string;
  };

  const currentPassword = payload.currentPassword ?? "";
  const nextEmail = payload.nextEmail ?? "";
  const otpCode = payload.otpCode ?? "";

  const result = await changeAdminEmailWithOtp(
    currentPassword,
    nextEmail,
    otpCode,
  );

  if (!result.ok) {
    const status =
      result.message === "Current password is incorrect." ||
      result.message === "Invalid OTP code."
        ? 401
        : 400;

    return NextResponse.json(
      { message: result.message ?? "Could not change email." },
      { status },
    );
  }

  if (result.email) {
    await setAdminSessionCookie(result.email);
  }

  return NextResponse.json({ ok: true, message: "Admin email updated." });
}
