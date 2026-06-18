import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

function sanitizeFileName(input: string) {
  return input.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
}

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function POST(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "File is required." }, { status: 400 });
  }

  if (file.size > 100 * 1024 * 1024) {
    return NextResponse.json(
      { message: "File too large. Max 100MB for this admin uploader." },
      { status: 400 },
    );
  }

  const timestamp = Date.now();
  const sanitizedName = sanitizeFileName(file.name || `asset-${timestamp}`);
  const pathname = `portfolio/media/${timestamp}-${sanitizedName}`;

  if (hasBlobToken()) {
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: file.type || "application/octet-stream",
    });

    return NextResponse.json({
      url: blob.url,
      kind: file.type.startsWith("video/") ? "video" : "image",
      source: "vercel-blob",
    });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const localFileName = `${timestamp}-${sanitizedName}`;
  const localFilePath = path.join(uploadsDir, localFileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(localFilePath, buffer);

  return NextResponse.json({
    url: `/uploads/${localFileName}`,
    kind: file.type.startsWith("video/") ? "video" : "image",
    source: "local",
  });
}
