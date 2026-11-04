export type MediaKind = "image" | "video";

export interface NavItem {
  label: string;
  href: string;
}

export interface BrandContent {
  name: string;
  tagline: string;
  shortName?: string;
  navCtaLabel?: string;
  navCtaHref?: string;
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
  headline?: string;
  subheadline: string;
  story?: string;
  availabilityText?: string;
  locationText?: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  resumeUrl: string;
  portraitUrl?: string;
  archiveThumbnailUrl?: string;
  mockupMedia: HeroMockupMedia[];
}

export interface AboutContent {
  title: string;
  heading: string;
  imageUrl: string;
  description: string;
  posterImageUrl?: string;
  posterTag?: string;
  posterCredit?: string;
  storyParagraphTwo?: string;
  pillarOneTitle?: string;
  pillarOneDesc?: string;
  pillarTwoTitle?: string;
  pillarTwoDesc?: string;
  pillarThreeTitle?: string;
  pillarThreeDesc?: string;
}

export interface ExperienceItem {
  id: string;
  year: string;
  title: string;
  organization: string;
  summary: string;
  gallery: HeroMockupMedia[];
}

export interface EducationItem {
  id: string;
  year: string;
  degree: string;
  institution: string;
  summary: string;
  honors?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  year: string;
  credentialUrl?: string;
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
  liveUrl?: string;
  githubUrl?: string;
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
  instagramUrl?: string;
  linkedinUrl?: string;
  whatsappUrl?: string;
  githubUrl?: string;
  behanceUrl?: string;
  availabilityStatus?: string;
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
  education: EducationItem[];
  certifications: CertificationItem[];
  featuredWorks: FeaturedWorkItem[];
  services: ServiceItem[];
  toolbox: ToolboxContent;
  whyWorkWithMe: WhyWorkItem[];
  numbers: StatItem[];
  contact: ContactContent;
  footer: FooterContent;
}
