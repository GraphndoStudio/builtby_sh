import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  preload: false,
});

const numberFont = Space_Grotesk({
  variable: "--font-numbers",
  subsets: ["latin"],
  preload: false,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://builtbysh.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "builtby_sh | THE CREATIVE ENGINE",
    template: "%s | builtby_sh",
  },
  description:
    "THE CREATIVE ENGINE portfolio of Sharukh H - Graphic Designer and Frontend Developer building high-impact visual and digital experiences.",
  keywords: [
    "Sharukh H",
    "builtby_sh",
    "graphic designer portfolio",
    "frontend developer portfolio",
    "UI design",
    "brand identity",
    "creative developer",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "THE CREATIVE ENGINE",
    title: "builtby_sh | THE CREATIVE ENGINE",
    description:
      "Design. Build. Elevate. Graphic design + frontend development portfolio by Sharukh H.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "THE CREATIVE ENGINE - builtby_sh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "builtby_sh | THE CREATIVE ENGINE",
    description:
      "Design. Build. Elevate. Graphic design + frontend development portfolio by Sharukh H.",
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${numberFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
