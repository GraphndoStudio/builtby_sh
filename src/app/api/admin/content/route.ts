import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { savePortfolioContent } from "@/lib/content-store";

export async function PUT(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json(
      { message: "Unauthorized" },
      {
        status: 401,
      },
    );
  }

  try {
    const payload = (await request.json()) as unknown;
    const content = await savePortfolioContent(payload);
    return NextResponse.json({ ok: true, content });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? "Invalid content payload." },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      { message: "Failed to save content." },
      {
        status: 500,
      },
    );
  }
}
