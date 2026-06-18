import { NextResponse } from "next/server";
import { hasAdminCredentials } from "@/lib/admin-auth";

export async function GET() {
  const registered = await hasAdminCredentials();
  return NextResponse.json(
    { registered },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
