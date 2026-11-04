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
    shortName: z.string().optional(),
    navCtaLabel: z.string().optional(),
    navCtaHref: hrefSchema.optional().or(z.literal("")),
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
    headline: z.string().optional(),
    subheadline: nonEmpty,
    story: z.string().optional(),
    availabilityText: z.string().optional(),
    locationText: z.string().optional(),
    primaryCtaLabel: nonEmpty,
    primaryCtaHref: hrefSchema,
    secondaryCtaLabel: nonEmpty,
    secondaryCtaHref: hrefSchema,
    resumeUrl: hrefSchema,
    portraitUrl: z.string().optional(),
    archiveThumbnailUrl: z.string().optional(),
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
    posterImageUrl: z.string().optional(),
    posterTag: z.string().optional(),
    posterCredit: z.string().optional(),
    storyParagraphTwo: z.string().optional(),
    pillarOneTitle: z.string().optional(),
    pillarOneDesc: z.string().optional(),
    pillarTwoTitle: z.string().optional(),
    pillarTwoDesc: z.string().optional(),
    pillarThreeTitle: z.string().optional(),
    pillarThreeDesc: z.string().optional(),
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
      caseStudyUrl: hrefSchema.optional().or(z.literal("")),
      liveUrl: hrefSchema.optional().or(z.literal("")),
      githubUrl: hrefSchema.optional().or(z.literal("")),
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
    instagramUrl: hrefSchema.optional().or(z.literal("")),
    linkedinUrl: hrefSchema.optional().or(z.literal("")),
    whatsappUrl: hrefSchema.optional().or(z.literal("")),
    githubUrl: hrefSchema.optional().or(z.literal("")),
    behanceUrl: hrefSchema.optional().or(z.literal("")),
    availabilityStatus: z.string().optional(),
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
