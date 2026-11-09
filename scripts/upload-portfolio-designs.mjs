import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
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

const CACHE_FILE = "data/uploaded-blobs.json";

async function loadBlobCache() {
  if (existsSync(CACHE_FILE)) {
    try {
      const raw = await readFile(CACHE_FILE, "utf-8");
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}

async function saveBlobCache(cache) {
  await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

function sanitizeBlobName(fileName) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uploadFile(localPath, blobFolder, cache) {
  if (cache[localPath]) {
    console.log(`[Cached] ${path.basename(localPath)} -> ${cache[localPath]}`);
    return cache[localPath];
  }

  const buffer = await readFile(localPath);
  const baseName = sanitizeBlobName(path.basename(localPath));
  const blobPath = `portfolio/${blobFolder}/${Date.now()}-${baseName}`;
  const contentType = getContentType(localPath);

  console.log(`[Uploading] ${path.basename(localPath)} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)...`);
  const result = await put(blobPath, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  cache[localPath] = result.url;
  await saveBlobCache(cache);
  console.log(`[Uploaded] -> ${result.url}`);
  return result.url;
}

// Master list of design items to upload and curate
const DESIGN_ITEMS = [
  // --- RANDOM DESIGNS / CREATIVE POSTERS ---
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/HIgh Abouve.jpg",
    folder: "posters",
    caption: "High Above - Mountain Minimalist Poster",
    category: "Random Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/escape.jpg",
    folder: "posters",
    caption: "Escape The Ordinary - Wilderness Mood Poster",
    category: "Random Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/Gateway.jpg",
    folder: "posters",
    caption: "Gateway of India - Architectural Monolith",
    category: "Random Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/into the wild v4.jpg",
    folder: "posters",
    caption: "Into The Wild - Atmospheric Wilderness Poster",
    category: "Random Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/awaken.jpg",
    folder: "posters",
    caption: "Awaken - Conceptual Typographic Poster",
    category: "Random Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/taj.jpg",
    folder: "posters",
    caption: "Taj Mahal - Heritage Architectural Poster",
    category: "Random Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/neon atherr.jpg",
    folder: "posters",
    caption: "Neon Cyberpunk Visual Concept",
    category: "Random Designs",
  },

  // --- APPLE REDESIGN CAMPAIGN ---
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/landing page/desktop & mobile/Web 1920 – 1.png",
    folder: "apple",
    caption: "Apple iPhone Experience - Concept Landing Page",
    category: "Apple Brand Redesign",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/landing page/03 Product copy.jpg",
    folder: "apple",
    caption: "Apple Product Showcase - Dynamic Island Feature",
    category: "Apple Brand Redesign",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/landing page/04 Product copy.jpg",
    folder: "apple",
    caption: "Apple Product Showcase - Performance Benchmark",
    category: "Apple Brand Redesign",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/landing page/05 Product copy.jpg",
    folder: "apple",
    caption: "Apple Product Showcase - Pro Camera System",
    category: "Apple Brand Redesign",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/social media ads/insta ads/insta ad 1.jpg",
    folder: "apple",
    caption: "Apple Instagram Ad - Precision Craftsmanship",
    category: "Apple Brand Redesign",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/social media ads/insta ads/insta ad 2.jpg",
    folder: "apple",
    caption: "Apple Instagram Ad - Aerospace Titanium",
    category: "Apple Brand Redesign",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/social media ads/insta ads/insta ad 3_instagram feed.jpg",
    folder: "apple",
    caption: "Apple Instagram Feed - 48MP Pro Visuals",
    category: "Apple Brand Redesign",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/social media ads/facebook ads/apple iphone 15 facebook feed ad copy.jpg",
    folder: "apple",
    caption: "Apple Facebook Feed Ad - Next-Gen Power",
    category: "Apple Brand Redesign",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/social media ads/linkdin ad/apple life is easier-01.jpg",
    folder: "apple",
    caption: "Apple LinkedIn Ad - Work Life Made Easier",
    category: "Apple Brand Redesign",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/emailer/desktop-01.jpg",
    folder: "apple",
    caption: "Apple Desktop Email Newsletter Design",
    category: "Apple Brand Redesign",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/emailer/mobile-01.jpg",
    folder: "apple",
    caption: "Apple Mobile Responsive Emailer Design",
    category: "Apple Brand Redesign",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/google ads/gads.jpg",
    folder: "apple",
    caption: "Apple Google Display Ads Suite",
    category: "Apple Brand Redesign",
  },

  // --- ATHER ENERGY REDESIGN CAMPAIGN ---
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/landing page/Web 1920 – 1.jpg",
    folder: "ather",
    caption: "Ather Energy EV Landing Page Experience",
    category: "Ather Energy Redesign",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/portfolio1.jpg",
    folder: "ather",
    caption: "Ather Brand Redesign Overview Showcase",
    category: "Ather Energy Redesign",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/social media ads/insta ads/neon atherr.jpg",
    folder: "ather",
    caption: "Ather Neon Night Edition Ad Creative",
    category: "Ather Energy Redesign",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/social media ads/insta ads/ather new.jpg",
    folder: "ather",
    caption: "Ather 450X High-Torque Performance Ad",
    category: "Ather Energy Redesign",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/social media ads/insta ads/ather ads-01.jpg",
    folder: "ather",
    caption: "Ather Electric Revolution Campaign Ad",
    category: "Ather Energy Redesign",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/social media ads/insta story ad/ather 450x-01.jpg",
    folder: "ather",
    caption: "Ather 450X Instagram Story Ad",
    category: "Ather Energy Redesign",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/emailer/ather emailer-{desktop}.jpg",
    folder: "ather",
    caption: "Ather Desktop Email Campaign Design",
    category: "Ather Energy Redesign",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/emailer/ather emailer {mobile}-01.jpg",
    folder: "ather",
    caption: "Ather Mobile Responsive Email Campaign",
    category: "Ather Energy Redesign",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/google ads/ather gads-01.jpg",
    folder: "ather",
    caption: "Ather Google Display Ads Suite",
    category: "Ather Energy Redesign",
  },

  // --- CINE.ARC PRODUCTIONS (CLIENT BRANDING) ---
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/cine.arc productions/brand business card/Business_Card_Mockup_4 copy.png",
    folder: "clients",
    caption: "Cine.Arc Productions - Premium Business Card Mockup",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/cine.arc productions/brand business card/businesss.jpg",
    folder: "clients",
    caption: "Cine.Arc Productions - Brand Collateral Layout",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/cine.arc productions/700ppi/cine.arc - white logo.png",
    folder: "clients",
    caption: "Cine.Arc Productions - Minimalist White Brand Identity",
    category: "Client Designs",
  },

  // --- HONEY CAKES & BROCHURE (FREELANCE CLIENTS) ---
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/honey cakes/honey cakes - christmas sale.jpg",
    folder: "clients",
    caption: "Honey Cakes - Christmas Festive Sale Ad",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/honey cakes/honey cakes logo.png",
    folder: "clients",
    caption: "Honey Cakes - Brand Identity Logo",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/honey cakes/honey cakes - christmas sale story .jpg",
    folder: "clients",
    caption: "Honey Cakes - Christmas Social Story Campaign",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/brochure/os-front.jpg",
    folder: "clients",
    caption: "OS Tri-Fold Corporate Brochure - Front Cover",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/brochure/os - inside left.jpg",
    folder: "clients",
    caption: "OS Tri-Fold Corporate Brochure - Inside Spread",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/brochure/os-back.jpg",
    folder: "clients",
    caption: "OS Tri-Fold Corporate Brochure - Back Cover",
    category: "Client Designs",
  },

  // --- FREELANCE EVENT & CAMPAIGN POSTERS ---
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/TECH MEET.jpg",
    folder: "events",
    caption: "Tech Meet 2024 - Annual Conference Event Poster",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/CULTURHYTHM.jpg",
    folder: "events",
    caption: "Culturhythm Fest - Music & Dance Festival Poster",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/THE FINAL TOUCH.jpg",
    folder: "events",
    caption: "The Final Touch - Creative Showcase Poster",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/HAPPINESS_LUNCH.jpg",
    folder: "events",
    caption: "Happiness Lunch - Corporate Team Outreach Poster",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/programmers day.jpg",
    folder: "events",
    caption: "International Programmer's Day - Celebration Creative",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/wwd-01.jpg",
    folder: "events",
    caption: "World Wildlife Day - Conservation Awareness Campaign",
    category: "Campaign & Event Creatives",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/cloud clash22.jpg",
    folder: "events",
    caption: "Cloud Clash 2022 - Hackathon Competition Poster",
    category: "Campaign & Event Creatives",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/CS-POST.jpg",
    folder: "events",
    caption: "Computer Science Society - Technical Symposium Poster",
    category: "Campaign & Event Creatives",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/freshers day copy.jpg",
    folder: "events",
    caption: "Freshers Induction - Campus Welcome Campaign Poster",
    category: "Campaign & Event Creatives",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/Freelance projects/tr hunt.jpg",
    folder: "events",
    caption: "Campus Treasure Hunt - Interactive Quest Poster",
    category: "Campaign & Event Creatives",
  },

  // --- ZYROPS TECHNOLOGIES LLP ---
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrops_unified_ecosystem (1).png",
    folder: "zyrops",
    caption: "Zyrops Unified Ecosystem - Cloud Architecture Interface",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrocrm_premium_redesign.png",
    folder: "zyrops",
    caption: "Zyro CRM Premium Redesign - High-Velocity Sales Hub",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrocrm_bold_hook.png",
    folder: "zyrops",
    caption: "Zyro CRM - Value Proposition Marketing Hero",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/product zyrocrm 3.png",
    folder: "zyrops",
    caption: "Zyro CRM - Deal Pipeline & Telemetry Dashboard",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/product zyrohr .png",
    folder: "zyrops",
    caption: "Zyro HR - Employee Lifecycle & Attendance System",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrohr_lens_of_clarity.png",
    folder: "zyrops",
    caption: "Zyro HR - Lens of Clarity Workforce Analytics",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrohr_before_after.png",
    folder: "zyrops",
    caption: "Zyro HR - Workflow Transformation Before vs After",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/dark_vs_light_audit.png",
    folder: "zyrops",
    caption: "Zyrops Design System - Dark vs Light Mode Visual Audit",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrops_brand_identity_horizontal.png",
    folder: "zyrops",
    caption: "Zyrops Brand Identity - Horizontal Visual Banner",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/eid al adha.png",
    folder: "zyrops",
    caption: "Eid al-Adha - Festive Brand Greeting Campaign",
    category: "Social Media Creatives",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/live now zyrops 1.png",
    folder: "zyrops",
    caption: "Zyrops Live Now - Official Platform Launch Creative",
    category: "Social Media Creatives",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrops_did_you_know.png",
    folder: "zyrops",
    caption: "Zyrops 'Did You Know?' - Educational Carousel Series",
    category: "Social Media Creatives",
  },

  // --- NOMADSCIPHER LLP ---
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/insta 2.png",
    folder: "nomadscipher",
    caption: "Nomad's Cipher - Social Media Campaign Poster",
    category: "Social Media Creatives",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/festive poster - nomadscipher - eid.png",
    folder: "nomadscipher",
    caption: "Nomad's Cipher - Festive Eid Mubarak Greeting",
    category: "Social Media Creatives",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/GD hiring - Nomadscipher.jpg",
    folder: "nomadscipher",
    caption: "Nomad's Cipher - Graphic Designer Recruitment Poster",
    category: "Social Media Creatives",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/NomadsCipher - QA ENGINEER hiring.jpg",
    folder: "nomadscipher",
    caption: "Nomad's Cipher - QA Engineer Hiring Campaign",
    category: "Social Media Creatives",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/NomadsCipher - vibe coder internship pg.png",
    folder: "nomadscipher",
    caption: "Nomad's Cipher - Vibe Coder Internship Launch Poster",
    category: "Social Media Creatives",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/Nomads chiper - CipherTrack meta ad1.png",
    folder: "nomadscipher",
    caption: "CipherTrack - Performance Meta Ad 01",
    category: "Social Media Creatives",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/Nomads chiper - CipherTrack meta ad2.png",
    folder: "nomadscipher",
    caption: "CipherTrack - Performance Meta Ad 02",
    category: "Social Media Creatives",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/Nomadscipher-metaads-HRMS-1.png",
    folder: "nomadscipher",
    caption: "Nomad's Cipher HRMS - Meta Ad Campaign 01",
    category: "Social Media Creatives",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/Nomadscipher-metaads-HRMS-2.png",
    folder: "nomadscipher",
    caption: "Nomad's Cipher HRMS - Meta Ad Campaign 02",
    category: "Social Media Creatives",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/product-hrms.png",
    folder: "nomadscipher",
    caption: "HRMS Enterprise Interface Design",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/product-ciphertrack.png",
    folder: "nomadscipher",
    caption: "CipherTrack - Cloud Fleet Tracking Dashboard",
    category: "Client Designs",
  },
  {
    localPath: "D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/product-cipherpos.png",
    folder: "nomadscipher",
    caption: "CipherPOS - Modern Point-of-Sale System UI",
    category: "Client Designs",
  },
];

async function main() {
  await loadEnv();
  const cache = await loadBlobCache();

  console.log(`Starting upload process for ${DESIGN_ITEMS.length} design works...`);
  const uploadedMap = new Map();

  for (let i = 0; i < DESIGN_ITEMS.length; i++) {
    const item = DESIGN_ITEMS[i];
    try {
      const url = await uploadFile(item.localPath, item.folder, cache);
      uploadedMap.set(item.localPath, url);
    } catch (err) {
      console.error(`Failed uploading ${item.localPath}:`, err.message);
    }
  }

  console.log(`Upload complete! Successfully processed ${uploadedMap.size} files.`);

  // Load existing content.json
  const rawContent = await readFile("data/content.json", "utf-8");
  const content = JSON.parse(rawContent);

  // Helper to get uploaded url
  const getUrl = (localPath) => uploadedMap.get(localPath) || cache[localPath];

  // 1. Update Hero Mockups with real top designs
  content.hero.mockupMedia = [
    {
      id: "mockup-1",
      mediaKind: "image",
      mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/landing page/desktop & mobile/Web 1920 – 1.png"),
      caption: "Apple iPhone Experience - Concept Landing Page",
      category: "UI & Web Redesign",
    },
    {
      id: "mockup-2",
      mediaKind: "image",
      mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/HIgh Abouve.jpg"),
      caption: "High Above - Mountain Minimalist Poster",
      category: "Graphic Design",
    },
    {
      id: "mockup-3",
      mediaKind: "image",
      mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/social media ads/insta ads/neon atherr.jpg"),
      caption: "Ather Energy - Neon Night Edition Campaign",
      category: "Brand Campaign",
    },
  ];

  // 2. Update About Poster
  content.about.posterImageUrl = getUrl("D:/portfolio designs/PORTFOLIO/random designs/HIgh Abouve.jpg");
  content.about.posterTag = "Visual Archive 01 / Graphic Poster System";
  content.about.posterCredit = "BuiltBy.sh Studio";

  // 3. Update Featured Works with real, high-impact case studies
  content.featuredWorks = [
    {
      id: "work-1",
      title: "Apple Brand Experience & Digital Campaign Suite",
      subtitle: "Full-Funnel Campaign Redesign & Landing Page",
      mediaKind: "image",
      mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/landing page/desktop & mobile/Web 1920 – 1.png"),
      challenge: "Concept redesign exploring how modern Apple product launches can merge sleek minimalism with dynamic storytelling across high-converting web and social touchpoints.",
      research: "Audited Apple's iconic design language, typography scale, high-key lighting, and user conversion paths across desktop, mobile, and social feed ads.",
      design: "Engineered an immersive web landing page paired with modular Instagram carousels, LinkedIn campaigns, desktop emailers, and high-impact Google Display ads.",
      result: "Produced a cohesive, photorealistic marketing ecosystem that elevates product perception while driving decisive user engagement.",
      tools: ["Adobe Photoshop", "Adobe Illustrator", "Adobe XD", "Figma", "Typography"],
      caseStudyUrl: "#",
    },
    {
      id: "work-2",
      title: "Ather Energy EV Brand Experience & Launch Campaign",
      subtitle: "Electric Vehicle Showcase & Digital Ad Suite",
      mediaKind: "image",
      mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/landing page/Web 1920 – 1.jpg"),
      challenge: "Crafting a futuristic visual identity and digital launch narrative for Ather Energy's high-performance electric scooter line to stand out in the rapidly evolving EV sector.",
      research: "Researched next-gen mobility aesthetics, cyberpunk neon visual cues, and consumer touchpoints across digital banners, email newsletters, and social ads.",
      design: "Designed a clean, aerodynamic landing page experience alongside the high-voltage 'Neon Night Edition' campaign, Instagram story formats, and corporate emailers.",
      result: "Delivered a dynamic, high-torque visual suite that positions the brand at the cutting edge of modern electric mobility.",
      tools: ["Adobe Photoshop", "Adobe Illustrator", "Adobe XD", "Visual Direction"],
      caseStudyUrl: "#",
    },
    {
      id: "work-3",
      title: "ZyrOps & NomadsCipher Enterprise Cloud Ecosystem",
      subtitle: "B2B SaaS Dashboard Interfaces & Visual Identity",
      mediaKind: "image",
      mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrops_unified_ecosystem (1).png"),
      challenge: "Transforming complex multi-tenant B2B operations (CRM, HRMS, LMS, Point-of-Sale) into intuitive, high-clarity user interfaces and cohesive brand communications.",
      research: "Benchmarked SaaS workflows, information hierarchy, data telemetry, and responsive dashboard constraints for rapid developer execution.",
      design: "Created clean component architectures, high-contrast dashboards with dark/light mode audits, and unified marketing materials that demystified technical capabilities.",
      result: "Enabled clear visual governance across products and produced marketing creatives that boosted enterprise client conversion.",
      tools: ["Figma", "Tailwind CSS", "HTML5", "JavaScript", "Adobe Illustrator"],
      caseStudyUrl: "#",
    },
    {
      id: "work-4",
      title: "Cine.Arc Productions Brand Identity & Corporate Collateral",
      subtitle: "Film Production Studio Visual System & Print Suite",
      mediaKind: "image",
      mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/cine.arc productions/brand business card/Business_Card_Mockup_4 copy.png"),
      challenge: "Building a prestigious, timeless brand identity and tangible print collateral for an independent cinema and media production house.",
      research: "Explored cinematic monochrome palettes, minimalist typography, and luxury print production techniques (embossing, matte finish, foil stamp).",
      design: "Developed the minimalist Cine.Arc brand mark in high-contrast black and white editions, paired with a modern business card and collateral system.",
      result: "Established an authoritative, high-trust identity that resonates with creative directors, clients, and film industry partners.",
      tools: ["Adobe Illustrator", "Adobe Photoshop", "Print Production", "Brand Identity"],
      caseStudyUrl: "#",
    },
  ];

  // 4. Update Experience Timeline: Freelance Designer & Developer
  const freelanceExp = content.experience.find((e) => e.id === "exp-1793799404825");
  if (freelanceExp) {
    freelanceExp.gallery = [
      // Client Designs
      {
        id: `gal-cine-1`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/cine.arc productions/brand business card/Business_Card_Mockup_4 copy.png"),
        caption: "Cine.Arc Productions - Business Card Identity Mockup",
        category: "Client Designs",
      },
      {
        id: `gal-cine-2`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/cine.arc productions/700ppi/cine.arc - white logo.png"),
        caption: "Cine.Arc Productions - Minimalist Studio Wordmark",
        category: "Client Designs",
      },
      {
        id: `gal-cine-3`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/cine.arc productions/brand business card/businesss.jpg"),
        caption: "Cine.Arc Productions - Print Collateral Layout",
        category: "Client Designs",
      },
      {
        id: `gal-honey-1`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/Freelance projects/honey cakes/honey cakes - christmas sale.jpg"),
        caption: "Honey Cakes - Christmas Festive Sale Campaign",
        category: "Client Designs",
      },
      {
        id: `gal-honey-2`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/Freelance projects/honey cakes/honey cakes logo.png"),
        caption: "Honey Cakes - Artisanal Brand Identity Logo",
        category: "Client Designs",
      },
      {
        id: `gal-honey-3`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/Freelance projects/honey cakes/honey cakes - christmas sale story .jpg"),
        caption: "Honey Cakes - Christmas Social Story Creative",
        category: "Client Designs",
      },
      {
        id: `gal-os-1`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/Freelance projects/brochure/os-front.jpg"),
        caption: "OS Tri-Fold Corporate Brochure - Front Cover Design",
        category: "Client Designs",
      },
      {
        id: `gal-os-2`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/Freelance projects/brochure/os - inside left.jpg"),
        caption: "OS Tri-Fold Corporate Brochure - Inside Spread",
        category: "Client Designs",
      },
      {
        id: `gal-os-3`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/Freelance projects/brochure/os-back.jpg"),
        caption: "OS Tri-Fold Corporate Brochure - Back Panel Layout",
        category: "Client Designs",
      },
      {
        id: `gal-techmeet`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/Freelance projects/TECH MEET.jpg"),
        caption: "Tech Meet 2024 - Annual Technical Conference Poster",
        category: "Client Designs",
      },
      {
        id: `gal-culturhythm`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/Freelance projects/CULTURHYTHM.jpg"),
        caption: "Culturhythm Fest - Music & Dance Festival Poster",
        category: "Client Designs",
      },
      {
        id: `gal-finaltouch`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/Freelance projects/THE FINAL TOUCH.jpg"),
        caption: "The Final Touch - Creative Showcase Poster",
        category: "Client Designs",
      },
      {
        id: `gal-progday`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/Freelance projects/programmers day.jpg"),
        caption: "Programmer's Day - Global Celebration Creative",
        category: "Client Designs",
      },
      {
        id: `gal-happylunch`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/Freelance projects/HAPPINESS_LUNCH.jpg"),
        caption: "Happiness Lunch - Corporate Team Outreach Poster",
        category: "Client Designs",
      },

      // Random Designs (Creative Posters)
      {
        id: `gal-highabove`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/HIgh Abouve.jpg"),
        caption: "High Above - Mountain Minimalist Poster",
        category: "Random Designs",
      },
      {
        id: `gal-escape`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/escape.jpg"),
        caption: "Escape The Ordinary - Wilderness Mood Poster",
        category: "Random Designs",
      },
      {
        id: `gal-gateway`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/Gateway.jpg"),
        caption: "Gateway of India - Monolith Architecture Poster",
        category: "Random Designs",
      },
      {
        id: `gal-wild`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/into the wild v4.jpg"),
        caption: "Into The Wild - Atmospheric Wilderness Poster",
        category: "Random Designs",
      },
      {
        id: `gal-awaken`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/awaken.jpg"),
        caption: "Awaken - Conceptual Typographic Poster",
        category: "Random Designs",
      },
      {
        id: `gal-taj`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/taj.jpg"),
        caption: "Taj Mahal - Heritage Architectural Poster",
        category: "Random Designs",
      },
      {
        id: `gal-neonather`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/neon atherr.jpg"),
        caption: "Neon Cyberpunk Visual Concept",
        category: "Random Designs",
      },

      // Apple Redesign Campaign
      {
        id: `gal-apple-web`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/landing page/desktop & mobile/Web 1920 – 1.png"),
        caption: "Apple iPhone Experience - Concept Landing Page",
        category: "Apple Brand Redesign",
      },
      {
        id: `gal-apple-ad1`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/social media ads/insta ads/insta ad 1.jpg"),
        caption: "Apple Instagram Ad - Precision Craftsmanship",
        category: "Apple Brand Redesign",
      },
      {
        id: `gal-apple-ad2`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/social media ads/insta ads/insta ad 2.jpg"),
        caption: "Apple Instagram Ad - Aerospace Titanium Frame",
        category: "Apple Brand Redesign",
      },
      {
        id: `gal-apple-ad3`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/social media ads/insta ads/insta ad 3_instagram feed.jpg"),
        caption: "Apple Instagram Feed - 48MP Pro Visual Suite",
        category: "Apple Brand Redesign",
      },
      {
        id: `gal-apple-email-desk`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/emailer/desktop-01.jpg"),
        caption: "Apple Desktop Email Newsletter Design",
        category: "Apple Brand Redesign",
      },
      {
        id: `gal-apple-email-mob`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/emailer/mobile-01.jpg"),
        caption: "Apple Mobile Responsive Emailer Design",
        category: "Apple Brand Redesign",
      },
      {
        id: `gal-apple-gads`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/google ads/gads.jpg"),
        caption: "Apple Google Display Ads Suite",
        category: "Apple Brand Redesign",
      },
      {
        id: `gal-apple-linkedin`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 1 [apple]/social media ads/linkdin ad/apple life is easier-01.jpg"),
        caption: "Apple LinkedIn Ad - Life is Easier with iPhone",
        category: "Apple Brand Redesign",
      },

      // Ather Energy Redesign
      {
        id: `gal-ather-web`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/landing page/Web 1920 – 1.jpg"),
        caption: "Ather Energy EV Landing Page Experience",
        category: "Ather Energy Redesign",
      },
      {
        id: `gal-ather-neon`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/social media ads/insta ads/neon atherr.jpg"),
        caption: "Ather Neon Night Edition Ad Creative",
        category: "Ather Energy Redesign",
      },
      {
        id: `gal-ather-perf`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/social media ads/insta ads/ather new.jpg"),
        caption: "Ather 450X High-Torque Performance Ad",
        category: "Ather Energy Redesign",
      },
      {
        id: `gal-ather-rev`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/social media ads/insta ads/ather ads-01.jpg"),
        caption: "Ather Electric Revolution Campaign Ad",
        category: "Ather Energy Redesign",
      },
      {
        id: `gal-ather-story`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/social media ads/insta story ad/ather 450x-01.jpg"),
        caption: "Ather 450X Instagram Story Creative",
        category: "Ather Energy Redesign",
      },
      {
        id: `gal-ather-email-desk`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/emailer/ather emailer-{desktop}.jpg"),
        caption: "Ather Desktop Email Campaign Design",
        category: "Ather Energy Redesign",
      },
      {
        id: `gal-ather-gads`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/random designs/redesigns/portfolio 2 [ather]/google ads/ather gads-01.jpg"),
        caption: "Ather Google Display Ads Suite",
        category: "Ather Energy Redesign",
      },
    ];
  }

  // 5. Update ZyrOps LLP Experience Gallery
  const zyropsExp = content.experience.find((e) => e.id === "exp-zyr");
  if (zyropsExp) {
    zyropsExp.gallery = [
      {
        id: `zyr-gal-1`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrops_unified_ecosystem (1).png"),
        caption: "Zyrops Unified Ecosystem - Cloud Architecture",
        category: "Client Designs",
      },
      {
        id: `zyr-gal-2`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrocrm_premium_redesign.png"),
        caption: "Zyro CRM Premium Redesign - High-Velocity Sales Hub",
        category: "Client Designs",
      },
      {
        id: `zyr-gal-3`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrocrm_bold_hook.png"),
        caption: "Zyro CRM - Value Proposition Marketing Hero",
        category: "Client Designs",
      },
      {
        id: `zyr-gal-4`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/product zyrocrm 3.png"),
        caption: "Zyro CRM - Deal Pipeline & Telemetry Dashboard",
        category: "Client Designs",
      },
      {
        id: `zyr-gal-5`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/product zyrohr .png"),
        caption: "Zyro HR - Employee Lifecycle & Attendance System",
        category: "Client Designs",
      },
      {
        id: `zyr-gal-6`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrohr_lens_of_clarity.png"),
        caption: "Zyro HR - Lens of Clarity Workforce Analytics",
        category: "Client Designs",
      },
      {
        id: `zyr-gal-7`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrohr_before_after.png"),
        caption: "Zyro HR - Workflow Transformation Before vs After",
        category: "Client Designs",
      },
      {
        id: `zyr-gal-8`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/dark_vs_light_audit.png"),
        caption: "Zyrops Design System - Dark vs Light Mode Audit",
        category: "Client Designs",
      },
      {
        id: `zyr-gal-9`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrops_brand_identity_horizontal.png"),
        caption: "Zyrops Brand Identity - Horizontal Visual Banner",
        category: "Client Designs",
      },
      {
        id: `zyr-gal-10`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/eid al adha.png"),
        caption: "Eid al-Adha - Festive Brand Greeting Campaign",
        category: "Social Media Creatives",
      },
      {
        id: `zyr-gal-11`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/live now zyrops 1.png"),
        caption: "Zyrops Live Now - Official Platform Launch Creative",
        category: "Social Media Creatives",
      },
      {
        id: `zyr-gal-12`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/zyrops_did_you_know.png"),
        caption: "Zyrops 'Did You Know?' - Educational Carousel Series",
        category: "Social Media Creatives",
      },
    ];
  }

  // 6. Update NomadsCipher LLP Experience Gallery
  const nomadsExp = content.experience.find((e) => e.id === "exp-nomadscipher");
  if (nomadsExp) {
    nomadsExp.gallery = [
      {
        id: `nom-gal-1`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/insta 2.png"),
        caption: "Nomad's Cipher - Social Media Campaign Poster",
        category: "Social Media Creatives",
      },
      {
        id: `nom-gal-2`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/festive poster - nomadscipher - eid.png"),
        caption: "Nomad's Cipher - Festive Eid Mubarak Greeting",
        category: "Social Media Creatives",
      },
      {
        id: `nom-gal-3`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/GD hiring - Nomadscipher.jpg"),
        caption: "Nomad's Cipher - Graphic Designer Recruitment Poster",
        category: "Social Media Creatives",
      },
      {
        id: `nom-gal-4`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/NomadsCipher - QA ENGINEER hiring.jpg"),
        caption: "Nomad's Cipher - QA Engineer Hiring Campaign",
        category: "Social Media Creatives",
      },
      {
        id: `nom-gal-5`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/NomadsCipher - vibe coder internship pg.png"),
        caption: "Nomad's Cipher - Vibe Coder Internship Launch Poster",
        category: "Social Media Creatives",
      },
      {
        id: `nom-gal-6`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/Nomads chiper - CipherTrack meta ad1.png"),
        caption: "CipherTrack - Performance Meta Ad 01",
        category: "Social Media Creatives",
      },
      {
        id: `nom-gal-7`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/Nomads chiper - CipherTrack meta ad2.png"),
        caption: "CipherTrack - Performance Meta Ad 02",
        category: "Social Media Creatives",
      },
      {
        id: `nom-gal-8`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/Nomadscipher-metaads-HRMS-1.png"),
        caption: "Nomad's Cipher HRMS - Meta Ad Campaign 01",
        category: "Social Media Creatives",
      },
      {
        id: `nom-gal-9`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/Nomadscipher-metaads-HRMS-2.png"),
        caption: "Nomad's Cipher HRMS - Meta Ad Campaign 02",
        category: "Social Media Creatives",
      },
      {
        id: `nom-gal-10`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/product-hrms.png"),
        caption: "HRMS Enterprise Interface Design",
        category: "Client Designs",
      },
      {
        id: `nom-gal-11`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/product-ciphertrack.png"),
        caption: "CipherTrack - Cloud Fleet Tracking Dashboard",
        category: "Client Designs",
      },
      {
        id: `nom-gal-12`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/NomadsCipher LLP & ZyrOps Technologies LLP/product-cipherpos.png"),
        caption: "CipherPOS - Modern Point-of-Sale System UI",
        category: "Client Designs",
      },
    ];
  }

  // 7. Update Political Outreach Campaign Experience Gallery
  const politicalExp = content.experience.find((e) => e.id === "exp-political");
  if (politicalExp) {
    politicalExp.gallery = [
      {
        id: `pol-gal-1`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/Freelance projects/wwd-01.jpg"),
        caption: "World Wildlife Day - Conservation Awareness Campaign",
        category: "Campaign & Event Creatives",
      },
      {
        id: `pol-gal-2`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/Freelance projects/cloud clash22.jpg"),
        caption: "Cloud Clash 2022 - Hackathon Competition Poster",
        category: "Campaign & Event Creatives",
      },
      {
        id: `pol-gal-3`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/Freelance projects/CS-POST.jpg"),
        caption: "Computer Science Society - Technical Symposium Poster",
        category: "Campaign & Event Creatives",
      },
      {
        id: `pol-gal-4`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/Freelance projects/freshers day copy.jpg"),
        caption: "Freshers Induction - Campus Welcome Campaign Poster",
        category: "Campaign & Event Creatives",
      },
      {
        id: `pol-gal-5`,
        mediaKind: "image",
        mediaUrl: getUrl("D:/portfolio designs/PORTFOLIO/clients/Freelance projects/tr hunt.jpg"),
        caption: "Campus Treasure Hunt - Interactive Quest Poster",
        category: "Campaign & Event Creatives",
      },
    ];
  }

  // Save updated content locally
  await writeFile("data/content.json", JSON.stringify(content, null, 2), "utf-8");
  console.log("Successfully saved updated data/content.json!");

  // Upload updated content.json to Vercel Blob
  console.log("Uploading updated site-content.json to Vercel Blob...");
  const blobRes = await put("portfolio/content/site-content.json", JSON.stringify(content, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  console.log("Successfully updated Vercel Blob site-content:", blobRes.url);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
