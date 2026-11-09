import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { put } from "@vercel/blob";

// Load environment variables from .env.local
async function loadEnv() {
  if (existsSync(".env.local")) {
    const envContent = await readFile(".env.local", "utf-8");
    for (const line of envContent.split(/\r?\n/)) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim().replace(/^["']|["']$/g, "");
        process.env[key] = val;
      }
    }
  }
}

const OPT_CACHE_FILE = "data/optimized-blobs.json";

async function loadCache() {
  if (existsSync(OPT_CACHE_FILE)) {
    try {
      const raw = await readFile(OPT_CACHE_FILE, "utf-8");
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}

async function saveCache(cache) {
  await writeFile(OPT_CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
}

function sanitizeName(fileName) {
  return fileName
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function optimizeAndUpload(localPath, blobFolder, cache) {
  if (cache[localPath]) {
    console.log(`[Cached] ${path.basename(localPath)} -> ${cache[localPath]}`);
    return cache[localPath];
  }

  const baseName = sanitizeName(path.basename(localPath));
  const startTime = Date.now();

  // Resize and compress with sharp to prevent any GPU texture overload
  const optimizedBuffer = await sharp(localPath)
    .resize({
      width: 1600,
      height: 2000,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 84, effort: 4 })
    .toBuffer();

  const originalSize = (await readFile(localPath)).length;
  const optSize = optimizedBuffer.length;
  const reduction = (((originalSize - optSize) / originalSize) * 100).toFixed(1);

  console.log(
    `[Optimized] ${path.basename(localPath)}: ${(originalSize / 1024 / 1024).toFixed(2)} MB -> ${(optSize / 1024).toFixed(1)} KB (-${reduction}%)`,
  );

  const blobPath = `portfolio/${blobFolder}/opt-${Date.now()}-${baseName}.webp`;
  const result = await put(blobPath, optimizedBuffer, {
    access: "public",
    contentType: "image/webp",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  cache[localPath] = result.url;
  await saveCache(cache);
  console.log(`[Uploaded] -> ${result.url} (${Date.now() - startTime}ms)`);
  return result.url;
}

// Master list of design items to process and update
const DESIGN_ITEMS = [
  // Posters
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/HIgh Abouve.jpg", folder: "posters" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/escape.jpg", folder: "posters" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/Gateway.jpg", folder: "posters" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/into the wild v4.jpg", folder: "posters" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/awaken.jpg", folder: "posters" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/taj.jpg", folder: "posters" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/neon atherr.jpg", folder: "posters" },

  // Apple
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/landing page/desktop & mobile/Web 1920 – 1.png", folder: "apple" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/landing page/03 Product copy.jpg", folder: "apple" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/landing page/04 Product copy.jpg", folder: "apple" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/landing page/05 Product copy.jpg", folder: "apple" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/social media ads/insta ads/insta ad 1.jpg", folder: "apple" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/social media ads/insta ads/insta ad 2.jpg", folder: "apple" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/social media ads/insta ads/insta ad 3_instagram feed.jpg", folder: "apple" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/social media ads/facebook ads/apple iphone 15 facebook feed ad copy.jpg", folder: "apple" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/social media ads/linkdin ad/apple life is easier-01.jpg", folder: "apple" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/emailer/desktop-01.jpg", folder: "apple" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/emailer/mobile-01.jpg", folder: "apple" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/google ads/gads.jpg", folder: "apple" },

  // Ather
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/landing page/Web 1920 – 1.jpg", folder: "ather" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/portfolio1.jpg", folder: "ather" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/social media ads/insta ads/neon atherr.jpg", folder: "ather" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/social media ads/insta ads/ather new.jpg", folder: "ather" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/social media ads/insta ads/ather ads-01.jpg", folder: "ather" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/social media ads/insta story ad/ather 450x-01.jpg", folder: "ather" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/emailer/ather emailer-{desktop}.jpg", folder: "ather" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/emailer/ather emailer {mobile}-01.jpg", folder: "ather" },
  { localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/google ads/ather gads-01.jpg", folder: "ather" },

  // Cine.Arc
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/cine.arc productions/brand business card/Business_Card_Mockup_4 copy.png", folder: "clients" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/cine.arc productions/brand business card/businesss.jpg", folder: "clients" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/cine.arc productions/700ppi/cine.arc - white logo.png", folder: "clients" },

  // Freelance
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/honey cakes/honey cakes - christmas sale.jpg", folder: "clients" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/honey cakes/honey cakes logo.png", folder: "clients" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/honey cakes/honey cakes - christmas sale story .jpg", folder: "clients" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/brochure/os-front.jpg", folder: "clients" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/brochure/os - inside left.jpg", folder: "clients" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/brochure/os-back.jpg", folder: "clients" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/TECH MEET.jpg", folder: "events" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/CULTURHYTHM.jpg", folder: "events" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/THE FINAL TOUCH.jpg", folder: "events" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/HAPPINESS_LUNCH.jpg", folder: "events" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/programmers day.jpg", folder: "events" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/wwd-01.jpg", folder: "events" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/cloud clash22.jpg", folder: "events" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/CS-POST.jpg", folder: "events" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/freshers day copy.jpg", folder: "events" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/tr hunt.jpg", folder: "events" },

  // ZyrOps
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrops_unified_ecosystem (1).png", folder: "zyrops" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrocrm_premium_redesign.png", folder: "zyrops" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrocrm_bold_hook.png", folder: "zyrops" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/product zyrocrm 3.png", folder: "zyrops" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/product zyrohr .png", folder: "zyrops" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrohr_lens_of_clarity.png", folder: "zyrops" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrohr_before_after.png", folder: "zyrops" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/dark_vs_light_audit.png", folder: "zyrops" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrops_brand_identity_horizontal.png", folder: "zyrops" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/eid al adha.png", folder: "zyrops" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/live now zyrops 1.png", folder: "zyrops" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrops_did_you_know.png", folder: "zyrops" },

  // NomadsCipher
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/insta 2.png", folder: "nomadscipher" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/festive poster - nomadscipher - eid.png", folder: "nomadscipher" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/GD hiring - Nomadscipher.jpg", folder: "nomadscipher" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/NomadsCipher - QA ENGINEER hiring.jpg", folder: "nomadscipher" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/NomadsCipher - vibe coder internship pg.png", folder: "nomadscipher" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/Nomads chiper - CipherTrack meta ad1.png", folder: "nomadscipher" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/Nomads chiper - CipherTrack meta ad2.png", folder: "nomadscipher" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/Nomadscipher-metaads-HRMS-1.png", folder: "nomadscipher" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/Nomadscipher-metaads-HRMS-2.png", folder: "nomadscipher" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/product-hrms.png", folder: "nomadscipher" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/product-ciphertrack.png", folder: "nomadscipher" },
  { localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/product-cipherpos.png", folder: "nomadscipher" },
];

async function main() {
  await loadEnv();
  const cache = await loadCache();
  console.log(`Starting Sharp optimization and upload for ${DESIGN_ITEMS.length} items...`);

  const urlMap = new Map();
  for (let i = 0; i < DESIGN_ITEMS.length; i++) {
    const item = DESIGN_ITEMS[i];
    try {
      const url = await optimizeAndUpload(item.localPath, item.folder, cache);
      urlMap.set(item.localPath, url);
    } catch (err) {
      console.error(`Failed ${item.localPath}:`, err.message);
    }
  }

  console.log(`All items optimized! Updating content.json...`);
  const rawContent = await readFile("data/content.json", "utf-8");
  const oldCache = JSON.parse(await readFile("data/uploaded-blobs.json", "utf-8"));

  // Build replacement map from old URLs to new optimized URLs
  let updatedJsonString = rawContent;
  for (const [localPath, newUrl] of urlMap.entries()) {
    const oldUrl = oldCache[localPath];
    if (oldUrl && newUrl && oldUrl !== newUrl) {
      // Replace all occurrences of oldUrl with newUrl
      updatedJsonString = updatedJsonString.split(oldUrl).join(newUrl);
    }
  }

  // Parse and re-save
  const updatedContent = JSON.parse(updatedJsonString);
  await writeFile("data/content.json", JSON.stringify(updatedContent, null, 2), "utf-8");
  console.log("Updated data/content.json successfully!");

  // Upload to Vercel Blob site-content
  console.log("Uploading updated site-content.json to Vercel Blob...");
  const blobRes = await put("portfolio/content/site-content.json", JSON.stringify(updatedContent, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  console.log("Successfully updated Vercel Blob site-content:", blobRes.url);
}

main().catch((err) => {
  console.error("Optimization failed:", err);
  process.exit(1);
});
