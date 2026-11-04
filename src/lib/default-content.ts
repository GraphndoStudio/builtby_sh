import type { PortfolioContent } from "@/types/portfolio";

export const defaultPortfolioContent: PortfolioContent = {
  brand: {
    name: "THE CREATIVE ENGINE",
    tagline: "Design. Build. Elevate.",
    shortName: "BuiltBy.sh",
    navCtaLabel: "Say Hello",
    navCtaHref: "#contact",
  },
  navigation: [
    { label: "Hero", href: "#hero" },
    { label: "About", href: "#about" },
    { label: "Experience", href: "#experience" },
    { label: "Works", href: "#featured-works" },
    { label: "Services", href: "#services" },
    { label: "Toolbox", href: "#toolbox" },
    { label: "Contact", href: "#contact" },
  ],
  loading: {
    displayName: "SHARUKH",
    statusText: "Initializing Portfolio...",
  },
  hero: {
    displayName: "SHARUKH",
    rolePrimary: "Frontend Developer",
    roleSecondary: "Graphic Designer",
    roleMorph: "Creative Problem Solver",
    headline: "Designing products that shape experiences. Engineering code that connects.",
    subheadline: "Designing visuals that connect. Developing experiences that perform.",
    story: "From concept to creation. I combine intentional graphic design with modern frontend engineering (React, Next.js, TypeScript) to craft digital products that blend form, function, and emotion—turning ideas into designs that earn trust.",
    availabilityText: "Available for Select Projects",
    locationText: "India · Worldwide",
    primaryCtaLabel: "See My Work",
    primaryCtaHref: "#featured-works",
    secondaryCtaLabel: "Start a Project",
    secondaryCtaHref: "#contact",
    resumeUrl: "#contact",
    portraitUrl: "",
    archiveThumbnailUrl: "/uploads/1781775293542-artboard-1-300x.png",
    mockupMedia: [
      {
        id: "mockup-1",
        mediaKind: "image",
        mediaUrl:
          "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=80",
        caption: "Brand presentation",
      },
      {
        id: "mockup-2",
        mediaKind: "image",
        mediaUrl:
          "https://images.unsplash.com/photo-1558655146-364adaf1fcc9?auto=format&fit=crop&w=1600&q=80",
        caption: "UI exploration",
      },
      {
        id: "mockup-3",
        mediaKind: "image",
        mediaUrl:
          "https://images.unsplash.com/photo-1515378791036-0648a814c963?auto=format&fit=crop&w=1600&q=80",
        caption: "Campaign creative",
      },
    ],
  },
  about: {
    title: "WHO I AM",
    heading: "A designer-developer crafting memorable digital experiences.",
    imageUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
    description:
      "My creative foundation started in graphic design—obsessing over composition, poster typography, and brand identity systems that capture attention and communicate purpose.",
    storyParagraphTwo:
      "To bring those designs to life, I expanded into modern frontend engineering. Today, I build responsive, production-ready web applications using React, Next.js, TypeScript, and fluid GSAP motion—delivering products where aesthetic finesse and technical performance work seamlessly together.",
    posterImageUrl: "/uploads/1781775293542-artboard-1-300x.png",
    posterTag: "Visual Archive 01 / Graphic Poster System",
    posterCredit: "Graphndo Studio",
    pillarOneTitle: "01 / Visual Heritage",
    pillarOneDesc: "Brand & Typography",
    pillarTwoTitle: "02 / Technical Craft",
    pillarTwoDesc: "Next.js & TypeScript",
    pillarThreeTitle: "03 / Fluid Motion",
    pillarThreeDesc: "GSAP & Interaction",
  },
  experience: [
    {
      id: "exp-1",
      year: "2022",
      title: "Computer Science",
      organization: "Academic Foundation",
      summary: "Built a strong software foundation through projects and system-focused learning.",
      gallery: [
        {
          id: "exp-1-gal-1",
          mediaKind: "image",
          mediaUrl:
            "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&q=80",
          caption: "Computer science project showcase",
        },
        {
          id: "exp-1-gal-2",
          mediaKind: "image",
          mediaUrl:
            "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
          caption: "Lab and coding workflow",
        },
      ],
    },
    {
      id: "exp-2",
      year: "2023",
      title: "Graphic Design Training",
      organization: "Design Track",
      summary: "Focused on composition, typography, and campaign design systems.",
      gallery: [
        {
          id: "exp-2-gal-1",
          mediaKind: "image",
          mediaUrl:
            "https://images.unsplash.com/photo-1524290266577-e90173d9075c?auto=format&fit=crop&w=1400&q=80",
          caption: "Poster and visual identity studies",
        },
        {
          id: "exp-2-gal-2",
          mediaKind: "image",
          mediaUrl:
            "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80",
          caption: "Design review board",
        },
      ],
    },
    {
      id: "exp-3",
      year: "2024",
      title: "Frontend Internship",
      organization: "NxtWave CCBP 4.0 Academy",
      summary: "Worked on responsive UI implementation and component-based architecture.",
      gallery: [
        {
          id: "exp-3-gal-1",
          mediaKind: "image",
          mediaUrl:
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
          caption: "Frontend implementation sprint",
        },
        {
          id: "exp-3-gal-2",
          mediaKind: "image",
          mediaUrl:
            "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
          caption: "Team development standup",
        },
      ],
    },
    {
      id: "exp-4",
      year: "2024",
      title: "Freelance Frontend Developer",
      organization: "Independent Projects",
      summary: "Delivered landing pages and business websites with custom UI and motion.",
      gallery: [
        {
          id: "exp-4-gal-1",
          mediaKind: "image",
          mediaUrl:
            "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1400&q=80",
          caption: "Freelance project delivery",
        },
        {
          id: "exp-4-gal-2",
          mediaKind: "image",
          mediaUrl:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
          caption: "Website performance report",
        },
      ],
    },
    {
      id: "exp-5",
      year: "2025",
      title: "Graphic Designer",
      organization: "NomadsCipher LLP",
      summary: "Created campaign creatives, social media design kits, and ad concepts.",
      gallery: [
        {
          id: "exp-5-gal-1",
          mediaKind: "image",
          mediaUrl:
            "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1400&q=80",
          caption: "Brand campaign posters",
        },
        {
          id: "exp-5-gal-2",
          mediaKind: "image",
          mediaUrl:
            "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=1400&q=80",
          caption: "Social media ad creatives",
        },
      ],
    },
    {
      id: "exp-6",
      year: "2026",
      title: "Political Campaign",
      organization: "Graphic Design Trainee",
      summary: "Designed high-impact campaign posters and communication visuals.",
      gallery: [
        {
          id: "exp-6-gal-1",
          mediaKind: "image",
          mediaUrl:
            "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=80",
          caption: "Campaign poster rollout",
        },
        {
          id: "exp-6-gal-2",
          mediaKind: "image",
          mediaUrl:
            "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80",
          caption: "Creative coordination session",
        },
      ],
    },
  ],
  featuredWorks: [
    {
      id: "work-1",
      title: "Campaign Identity System",
      subtitle: "Political Campaign Creative Direction",
      mediaKind: "image",
      mediaUrl:
        "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1800&q=80",
      challenge:
        "The campaign needed a cohesive visual language that could perform across print, social, and event media in a short timeline.",
      research:
        "I audited competitor campaign visuals, audience response, and local visual cues to identify high-recall design patterns.",
      design:
        "Developed typography hierarchy, accent color system, and modular layouts for posters, feeds, and ad creatives.",
      result:
        "Delivered a consistent creative system that increased campaign recognition and improved social engagement.",
      tools: ["Adobe Photoshop", "Adobe Illustrator", "Figma"],
      caseStudyUrl: "#",
    },
    {
      id: "work-2",
      title: "Responsive Portfolio Platform",
      subtitle: "Frontend + Motion-led Showcase",
      mediaKind: "image",
      mediaUrl:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1800&q=80",
      challenge:
        "The portfolio needed to stand out visually while keeping performance and maintainability high.",
      research:
        "Benchmarked modern agency portfolios and studied interaction patterns that improved user retention.",
      design:
        "Built a motion-first UI with modern layout rhythms, interactive sections, and clear content hierarchy.",
      result:
        "A distinctive, professional website that balances aesthetics, speed, and content control.",
      tools: ["HTML5", "CSS3", "JavaScript", "GSAP", "Figma"],
      caseStudyUrl: "#",
    },
    {
      id: "work-3",
      title: "Brand + Social Media Suite",
      subtitle: "Visual Storytelling for Business Growth",
      mediaKind: "image",
      mediaUrl:
        "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1800&q=80",
      challenge:
        "The client had inconsistent visual assets and needed a recognizable voice across platforms.",
      research:
        "Analyzed audience behavior and campaign conversion patterns for tone, format, and visual timing.",
      design:
        "Created a scalable brand toolkit with ad templates, post systems, and campaign-ready layouts.",
      result:
        "Improved brand consistency and faster campaign turnaround with reusable, high-impact assets.",
      tools: ["Adobe Photoshop", "Canva", "Adobe XD"],
      caseStudyUrl: "#",
    },
  ],
  services: [
    {
      id: "srv-1",
      title: "Brand Identity",
      description: "Creating memorable visual identities.",
    },
    {
      id: "srv-2",
      title: "Social Media Design",
      description: "Posts, campaigns and advertisements.",
    },
    {
      id: "srv-3",
      title: "UI Design",
      description: "Landing pages and interfaces.",
    },
    {
      id: "srv-4",
      title: "Responsive Website Development",
      description: "Responsive websites built with modern technologies.",
    },
  ],
  toolbox: {
    design: [
      "Adobe Photoshop",
      "Adobe Illustrator",
      "Adobe XD",
      "Canva",
      "Figma",
      "Typography",
      "Brand Identity",
      "Visual Storytelling",
    ],
    development: [
      "HTML5",
      "CSS3",
      "JavaScript",
      "Bootstrap",
      "Responsive Design",
      "Git",
      "GitHub",
    ],
    learning: ["React", "Tailwind", "GSAP", "Framer Motion"],
  },
  whyWorkWithMe: [
    {
      id: "why-1",
      title: "Creativity",
      description: "Every project begins with understanding people.",
    },
    {
      id: "why-2",
      title: "Precision",
      description: "Pixel-perfect execution across every screen size.",
    },
    {
      id: "why-3",
      title: "Performance",
      description: "Designs that not only look good but perform well.",
    },
  ],
  numbers: [
    { id: "num-1", value: 1, suffix: "+", label: "Years Experience" },
    { id: "num-2", value: 100, suffix: "+", label: "Creative Designs" },
    { id: "num-3", value: 20, suffix: "+", label: "Projects Completed" },
    { id: "num-4", value: 100, suffix: "%", label: "Commitment" },
  ],
  contact: {
    title: "Let's build something that people remember.",
    description:
      "From brand systems to responsive frontends, I can help you launch visuals and products that are polished, strategic, and effective.",
    email: "studio.graphndo@gmail.com",
    phone: "+91 90000 00000",
    location: "India",
    instagramUrl: "https://instagram.com/graphndo._",
    linkedinUrl: "https://linkedin.com/",
    whatsappUrl: "https://wa.me/919000000000",
    githubUrl: "https://github.com/GraphndoStudio",
    behanceUrl: "https://behance.net",
    availabilityStatus: "Available for select projects",
    projectCtaLabel: "Start a Project",
    projectCtaHref: "#contact",
  },
  footer: {
    lineOne: "Designed. Developed. Delivered.",
    lineTwo: "By Sharukh.",
    credit: "THE CREATIVE ENGINE",
  },
};
