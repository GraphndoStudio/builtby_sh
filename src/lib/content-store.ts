import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { list, put } from "@vercel/blob";
import { defaultPortfolioContent } from "@/lib/default-content";
import {
  portfolioContentSchema,
  type PortfolioContentInput,
} from "@/lib/content-schema";
import type { PortfolioContent } from "@/types/portfolio";

const CONTENT_BLOB_PATH = "portfolio/content/site-content.json";
const LOCAL_CONTENT_PATH = path.join(process.cwd(), "data", "content.json");

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function ensureLocalFile() {
  await mkdir(path.dirname(LOCAL_CONTENT_PATH), { recursive: true });
}

function cloneDefaultContent(): PortfolioContent {
  return JSON.parse(JSON.stringify(defaultPortfolioContent)) as PortfolioContent;
}

async function readLocalContent() {
  try {
    const raw = await readFile(LOCAL_CONTENT_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return portfolioContentSchema.parse(parsed);
  } catch {
    return cloneDefaultContent();
  }
}

async function writeLocalContent(content: PortfolioContentInput) {
  await ensureLocalFile();
  await writeFile(LOCAL_CONTENT_PATH, JSON.stringify(content, null, 2), "utf-8");
}

async function readBlobContent() {
  try {
    const { blobs } = await list({ prefix: CONTENT_BLOB_PATH, limit: 100 });
    if (!blobs.length) {
      return null;
    }

    const latest = blobs.sort(
      (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime(),
    )[0];

    const response = await fetch(latest.url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as unknown;
    return portfolioContentSchema.parse(json);
  } catch {
    return null;
  }
}

async function writeBlobContent(content: PortfolioContentInput) {
  await put(CONTENT_BLOB_PATH, JSON.stringify(content, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function getPortfolioContent() {
  if (hasBlobToken()) {
    const blobContent = await readBlobContent();
    if (blobContent) {
      return blobContent;
    }
  }

  const localContent = await readLocalContent();
  await writeLocalContent(localContent);
  return localContent;
}

export async function savePortfolioContent(content: unknown) {
  const parsed = portfolioContentSchema.parse(content);
  if (hasBlobToken()) {
    await writeBlobContent(parsed);
  }
  await writeLocalContent(parsed);
  return parsed;
}
