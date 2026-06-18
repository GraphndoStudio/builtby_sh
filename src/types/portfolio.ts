export type MediaKind = "image" | "video";

export interface NavItem {
  label: string;
  href: string;
}

export interface BrandContent {
  name: string;
  tagline: string;
}

export interface LoadingContent {
  displayName: string;
  statusText: string;
}

export interface HeroMockupMedia {
  id: string;
  mediaKind: MediaKind;
  mediaUrl: string;
  caption: string;
}

export interface HeroContent {
  displayName: string;
  rolePrimary: string;
  roleSecondary: string;
  roleMorph: string;
  subheadline: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  resumeUrl: string;
  mockupMedia: HeroMockupMedia[];
}

export interface AboutContent {
  title: string;
  heading: string;
  imageUrl: string;
  description: string;
}

export interface ExperienceItem {
  id: string;
  year: string;
  title: string;
  organization: string;
  summary: string;
  gallery: HeroMockupMedia[];
}

export interface FeaturedWorkItem {
  id: string;
  title: string;
  subtitle: string;
  mediaKind: MediaKind;
  mediaUrl: string;
  challenge: string;
  research: string;
  design: string;
  result: string;
  tools: string[];
  caseStudyUrl?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
}

export interface WhyWorkItem {
  id: string;
  title: string;
  description: string;
}

export interface StatItem {
  id: string;
  value: number;
  suffix?: string;
  label: string;
}

export interface ToolboxContent {
  design: string[];
  development: string[];
  learning: string[];
}

export interface ContactContent {
  title: string;
  description: string;
  email: string;
  phone: string;
  location: string;
  instagramUrl: string;
  linkedinUrl: string;
  whatsappUrl: string;
  projectCtaLabel: string;
  projectCtaHref: string;
}

export interface FooterContent {
  lineOne: string;
  lineTwo: string;
  credit: string;
}

export interface PortfolioContent {
  brand: BrandContent;
  navigation: NavItem[];
  loading: LoadingContent;
  hero: HeroContent;
  about: AboutContent;
  experience: ExperienceItem[];
  featuredWorks: FeaturedWorkItem[];
  services: ServiceItem[];
  toolbox: ToolboxContent;
  whyWorkWithMe: WhyWorkItem[];
  numbers: StatItem[];
  contact: ContactContent;
  footer: FooterContent;
}
