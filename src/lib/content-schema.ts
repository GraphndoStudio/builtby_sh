import { z } from "zod";

const mediaKindSchema = z.enum(["image", "video"]);

const nonEmpty = z.string().trim().min(1);

const hrefSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) =>
      value.startsWith("/") ||
      value.startsWith("#") ||
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("mailto:") ||
      value.startsWith("tel:"),
    "Invalid link",
  );

const mediaUrlSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) =>
      value.startsWith("/") ||
      value.startsWith("http://") ||
      value.startsWith("https://"),
    "Media URL must be absolute URL or local /path",
  );

export const portfolioContentSchema = z.object({
  brand: z.object({
    name: nonEmpty,
    tagline: nonEmpty,
  }),
  navigation: z.array(
    z.object({
      label: nonEmpty,
      href: hrefSchema,
    }),
  ),
  loading: z.object({
    displayName: nonEmpty,
    statusText: nonEmpty,
  }),
  hero: z.object({
    displayName: nonEmpty,
    rolePrimary: nonEmpty,
    roleSecondary: nonEmpty,
    roleMorph: nonEmpty,
    subheadline: nonEmpty,
    primaryCtaLabel: nonEmpty,
    primaryCtaHref: hrefSchema,
    secondaryCtaLabel: nonEmpty,
    secondaryCtaHref: hrefSchema,
    resumeUrl: hrefSchema,
    mockupMedia: z.array(
      z.object({
        id: nonEmpty,
        mediaKind: mediaKindSchema,
        mediaUrl: mediaUrlSchema,
        caption: nonEmpty,
      }),
    ),
  }),
  about: z.object({
    title: nonEmpty,
    heading: nonEmpty,
    imageUrl: mediaUrlSchema,
    description: nonEmpty,
  }),
  experience: z.array(
    z.object({
      id: nonEmpty,
      year: nonEmpty,
      title: nonEmpty,
      organization: nonEmpty,
      summary: nonEmpty,
      gallery: z.array(
        z.object({
          id: nonEmpty,
          mediaKind: mediaKindSchema,
          mediaUrl: mediaUrlSchema,
          caption: nonEmpty,
        }),
      ),
    }),
  ),
  featuredWorks: z.array(
    z.object({
      id: nonEmpty,
      title: nonEmpty,
      subtitle: nonEmpty,
      mediaKind: mediaKindSchema,
      mediaUrl: mediaUrlSchema,
      challenge: nonEmpty,
      research: nonEmpty,
      design: nonEmpty,
      result: nonEmpty,
      tools: z.array(nonEmpty),
      caseStudyUrl: hrefSchema.optional(),
    }),
  ),
  services: z.array(
    z.object({
      id: nonEmpty,
      title: nonEmpty,
      description: nonEmpty,
    }),
  ),
  toolbox: z.object({
    design: z.array(nonEmpty),
    development: z.array(nonEmpty),
    learning: z.array(nonEmpty),
  }),
  whyWorkWithMe: z.array(
    z.object({
      id: nonEmpty,
      title: nonEmpty,
      description: nonEmpty,
    }),
  ),
  numbers: z.array(
    z.object({
      id: nonEmpty,
      value: z.number().nonnegative(),
      suffix: z.string().optional(),
      label: nonEmpty,
    }),
  ),
  contact: z.object({
    title: nonEmpty,
    description: nonEmpty,
    email: nonEmpty,
    phone: nonEmpty,
    location: nonEmpty,
    instagramUrl: hrefSchema,
    linkedinUrl: hrefSchema,
    whatsappUrl: hrefSchema,
    projectCtaLabel: nonEmpty,
    projectCtaHref: hrefSchema,
  }),
  footer: z.object({
    lineOne: nonEmpty,
    lineTwo: nonEmpty,
    credit: nonEmpty,
  }),
});

export type PortfolioContentInput = z.infer<typeof portfolioContentSchema>;
