"use client";

import Image, { type ImageProps } from "next/image";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import type { PortfolioContent } from "@/types/portfolio";

interface PortfolioPageProps {
  content: PortfolioContent;
}

type AmbientObject = {
  id: number;
  left: string;
  top: string;
  size: number;
  shape: "rounded" | "diamond";
  duration: number;
  delay: number;
};

function MediaThumb({
  kind,
  url,
  alt,
  className,
  sizes = "100vw",
  quality = 75,
  loading,
  priority = false,
}: {
  kind: "image" | "video";
  url: string;
  alt: string;
  className?: string;
  sizes?: string;
  quality?: number;
  loading?: ImageProps["loading"];
  priority?: boolean;
}) {
  if (kind === "video") {
    return (
      <video
        className={className}
        src={url}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
    );
  }

  const resolvedLoading = priority ? undefined : (loading ?? "lazy");

  return (
    <Image
      className={className}
      src={url}
      alt={alt}
      width={1800}
      height={1200}
      sizes={sizes}
      quality={quality}
      loading={resolvedLoading}
      priority={priority}
      decoding="async"
    />
  );
}

function NumberCard({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!inView) {
      return;
    }

    let frame = 0;
    const frames = 42;
    const increment = value / frames;
    const timer = setInterval(() => {
      frame += 1;
      const next = Math.min(value, Math.round(increment * frame));
      setDisplayValue(next);
      if (frame >= frames) {
        clearInterval(timer);
      }
    }, 28);

    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <div
      ref={ref}
      className="rounded-3xl border border-brand-border bg-brand-bg-secondary/70 p-6 backdrop-blur-xl"
    >
      <p className="font-display font-numbers text-5xl text-brand-text md:text-6xl">
        {displayValue}
        {suffix ?? ""}
      </p>
      <p className="mt-2 text-sm uppercase tracking-[0.16em] text-brand-muted">{label}</p>
    </div>
  );
}

export function PortfolioPage({ content }: PortfolioPageProps) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingDone, setLoadingDone] = useState(false);
  const [currentRole, setCurrentRole] = useState(0);
  const [mockupIndex, setMockupIndex] = useState(0);
  const [cursorActive, setCursorActive] = useState(false);
  const [activeExperienceId, setActiveExperienceId] = useState<string | null>(null);
  const [activeExperienceMediaIndex, setActiveExperienceMediaIndex] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const experienceTimelineRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const ringX = useSpring(cursorX, { stiffness: 240, damping: 30 });
  const ringY = useSpring(cursorY, { stiffness: 240, damping: 30 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 80, damping: 20, mass: 0.8 });
  const smoothY = useSpring(mouseY, { stiffness: 80, damping: 20, mass: 0.8 });
  const orbAX = useTransform(smoothX, [0, 1], [-45, 45]);
  const orbAY = useTransform(smoothY, [0, 1], [-26, 26]);
  const orbBX = useTransform(smoothX, [0, 1], [36, -32]);
  const orbBY = useTransform(smoothY, [0, 1], [20, -22]);
  const { scrollYProgress: experienceScrollYProgress } = useScroll({
    target: experienceTimelineRef,
    offset: ["start 85%", "end 20%"],
  });
  const experienceGlowTop = useTransform(
    experienceScrollYProgress,
    [0, 1],
    ["0%", "92%"],
  );
  const experienceGlowOpacity = useTransform(
    experienceScrollYProgress,
    [0, 0.08, 0.92, 1],
    [0.75, 1, 1, 0.45],
  );

  const roleText =
    currentRole % 2 === 0 ? content.hero.roleSecondary : content.hero.roleMorph;
  const enableInteractiveMotion = hasFinePointer && !prefersReducedMotion;

  const particles = useMemo(
    () =>
      Array.from(
        {
          length: prefersReducedMotion ? 10 : isMobileViewport ? 16 : 28,
        },
        (_, index) => ({
          id: index,
          left: `${(index * 37) % 100}%`,
          top: `${(index * 53) % 100}%`,
          delay: `${(index % 9) * 0.45}s`,
          duration: `${5 + (index % 7)}s`,
        }),
      ),
    [isMobileViewport, prefersReducedMotion],
  );

  const ambientObjects = useMemo<AmbientObject[]>(
    () => {
      const objects: AmbientObject[] = [
        {
          id: 1,
          left: "6%",
          top: "24%",
          size: isMobileViewport ? 96 : 130,
          shape: "diamond",
          duration: 16,
          delay: 0,
        },
        {
          id: 2,
          left: "84%",
          top: "16%",
          size: isMobileViewport ? 110 : 170,
          shape: "rounded",
          duration: 19,
          delay: 0.7,
        },
        {
          id: 3,
          left: "12%",
          top: "68%",
          size: isMobileViewport ? 104 : 150,
          shape: "rounded",
          duration: 17,
          delay: 1.1,
        },
        {
          id: 4,
          left: "80%",
          top: "76%",
          size: isMobileViewport ? 100 : 140,
          shape: "diamond",
          duration: 18,
          delay: 0.35,
        },
      ];

      return objects.filter((_, index) => !isMobileViewport || index < 2);
    },
    [isMobileViewport],
  );

  const activeExperience =
    content.experience.find((item) => item.id === activeExperienceId) ?? null;

  const activeExperienceMedia =
    activeExperience?.gallery[activeExperienceMediaIndex] ?? activeExperience?.gallery[0];

  function openExperienceGallery(experienceId: string) {
    setActiveExperienceId(experienceId);
    setActiveExperienceMediaIndex(0);
  }

  function openExperienceGalleryFromWork(workIndex: number) {
    const match = content.experience[workIndex] ?? content.experience[0];
    if (!match) {
      return;
    }
    openExperienceGallery(match.id);
  }

  const bottomShowcaseItems = useMemo(() => {
    const fromExperience = content.experience.flatMap((item) =>
      item.gallery.map((galleryItem) => ({
        key: `${item.id}-${galleryItem.id}`,
        title: item.title,
        subtitle: galleryItem.caption,
        mediaKind: galleryItem.mediaKind,
        mediaUrl: galleryItem.mediaUrl,
      })),
    );

    if (fromExperience.length > 0) {
      return fromExperience;
    }

    return content.featuredWorks.map((work) => ({
      key: work.id,
      title: work.title,
      subtitle: work.subtitle,
      mediaKind: work.mediaKind,
      mediaUrl: work.mediaUrl,
    }));
  }, [content.experience, content.featuredWorks]);

  useEffect(() => {
    const updateViewportState = () => {
      setIsMobileViewport(window.innerWidth < 768);
      setHasFinePointer(window.matchMedia("(pointer:fine)").matches);
    };

    updateViewportState();
    window.addEventListener("resize", updateViewportState);
    return () => window.removeEventListener("resize", updateViewportState);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingProgress((prev) => {
        const next = Math.min(100, prev + Math.max(3, 12 - Math.floor(prev / 12)));
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => setLoadingDone(true), 420);
        }
        return next;
      });
    }, 85);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentRole((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const interval = setInterval(() => {
      setMockupIndex((prev) => (prev + 1) % Math.max(content.hero.mockupMedia.length, 1));
    }, 3200);

    return () => clearInterval(interval);
  }, [content.hero.mockupMedia.length, prefersReducedMotion]);

  useEffect(() => {
    content.hero.mockupMedia.forEach((item) => {
      if (item.mediaKind !== "image") {
        return;
      }

      const img = new window.Image();
      img.decoding = "async";
      img.fetchPriority = item.id === content.hero.mockupMedia[0]?.id ? "high" : "auto";
      img.src = item.mediaUrl;
      void img.decode?.().catch(() => undefined);
    });
  }, [content.hero.mockupMedia]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      gestureOrientation: "vertical",
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const blocks = gsap.utils.toArray<HTMLElement>(".reveal-up");
      blocks.forEach((block) => {
        gsap.fromTo(
          block,
          { opacity: 0, y: 80 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: block,
              start: "top 86%",
            },
          },
        );
      });
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!hasFinePointer || prefersReducedMotion) {
      return;
    }

    const onMouseMove = (event: MouseEvent) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
      mouseX.set(event.clientX / window.innerWidth);
      mouseY.set(event.clientY / window.innerHeight);

      const target = event.target as HTMLElement;
      const interactive = target.closest("a,button,[data-cursor='interactive']");
      setCursorActive(Boolean(interactive));
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [cursorX, cursorY, mouseX, mouseY, hasFinePointer, prefersReducedMotion]);

  useEffect(() => {
    if (!activeExperience) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveExperienceId(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeExperience]);

  useEffect(() => {
    if (!mobileNavOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMobileNavOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileNavOpen]);

  const activeMockup = content.hero.mockupMedia[mockupIndex] ?? content.hero.mockupMedia[0];
  const loadingFilledBlocks = Math.floor(loadingProgress / 10);

  return (
    <div className="relative overflow-x-clip bg-brand-bg text-brand-text">
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[70] hidden h-2 w-2 rounded-full bg-brand-accent md:block"
        style={{ x: cursorX, y: cursorY, translateX: "-50%", translateY: "-50%" }}
      />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[69] hidden h-9 w-9 rounded-full border border-brand-accent/65 md:block"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          scale: cursorActive ? 1.45 : 1,
        }}
      />

      {!loadingDone ? (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: loadingProgress >= 100 ? 0 : 1 }}
          transition={{ duration: 0.45 }}
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-black"
        >
          <p className="font-display text-4xl tracking-[0.08em]">{content.loading.displayName}</p>
          <p className="mt-2 text-sm tracking-[0.18em] text-brand-muted">{content.loading.statusText}</p>
          <div className="mt-8 flex gap-1.5">
            {Array.from({ length: 10 }).map((_, index) => (
              <span
                key={`loading-${index}`}
                className={`h-4 w-5 border border-brand-border ${
                  index < loadingFilledBlocks ? "bg-brand-accent" : "bg-transparent"
                }`}
              />
            ))}
          </div>
        </motion.div>
      ) : null}

      {activeExperience ? (
        <div
          className="fixed inset-0 z-[95] flex items-start justify-center overflow-y-auto bg-black/80 p-4 py-6 backdrop-blur-md md:items-center md:py-4"
          onClick={() => setActiveExperienceId(null)}
        >
          <div
            className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-5xl overflow-y-auto rounded-3xl border border-brand-border bg-brand-bg-secondary p-4 md:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand-accent">
                  {activeExperience.year}
                </p>
                <h3 className="mt-1 font-display text-3xl">{activeExperience.title}</h3>
                <p className="mt-1 text-sm text-brand-muted">{activeExperience.organization}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveExperienceId(null)}
                className="rounded-full border border-brand-border px-4 py-2 text-xs uppercase tracking-[0.14em] text-brand-text transition hover:border-brand-accent/70 hover:text-brand-accent"
              >
                Close
              </button>
            </div>

            <p className="mt-4 max-w-[70ch] text-sm leading-7 text-brand-muted">
              {activeExperience.summary}
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.35fr]">
              <div className="overflow-hidden rounded-2xl border border-brand-border bg-black/40">
                {activeExperienceMedia ? (
                  <MediaThumb
                    kind={activeExperienceMedia.mediaKind}
                    url={activeExperienceMedia.mediaUrl}
                    alt={activeExperienceMedia.caption}
                    className="h-[420px] w-full object-cover"
                    sizes="(max-width: 1024px) 94vw, 64vw"
                  />
                ) : null}
                <p className="border-t border-brand-border px-4 py-3 text-sm text-brand-text/90">
                  {activeExperienceMedia?.caption}
                </p>
              </div>

              <div className="max-h-[460px] space-y-3 overflow-auto pr-1">
                {activeExperience.gallery.length > 0 ? (
                  activeExperience.gallery.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveExperienceMediaIndex(index)}
                      className={`w-full overflow-hidden rounded-xl border text-left transition ${
                        index === activeExperienceMediaIndex
                          ? "border-brand-accent"
                          : "border-brand-border hover:border-brand-accent/50"
                      }`}
                    >
                      <MediaThumb
                        kind={item.mediaKind}
                        url={item.mediaUrl}
                        alt={item.caption}
                        className="h-28 w-full object-cover"
                        sizes="(max-width: 1024px) 36vw, 220px"
                      />
                      <p className="px-3 py-2 text-xs text-brand-muted">{item.caption}</p>
                    </button>
                  ))
                ) : (
                  <div className="rounded-xl border border-brand-border bg-black/35 p-4 text-xs text-brand-muted">
                    No gallery items found for this experience yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(95%_70%_at_50%_0%,rgba(42,250,223,0.18),transparent_58%),linear-gradient(150deg,#090b12_0%,#050505_52%,#0d1020_100%)]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(circle at 50% 40%, rgba(0,0,0,1), rgba(0,0,0,0.15))",
          }}
        />
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className="absolute h-1 w-1 rounded-full bg-brand-accent/70"
            style={{ left: particle.left, top: particle.top }}
            animate={
              prefersReducedMotion
                ? { opacity: 0.4 }
                : { y: [0, -20, 0], opacity: [0.3, 1, 0.3] }
            }
            transition={{
              duration: prefersReducedMotion
                ? 0
                : Number(particle.duration.replace("s", "")),
              delay: prefersReducedMotion ? 0 : Number(particle.delay.replace("s", "")),
              repeat: prefersReducedMotion ? 0 : Infinity,
              ease: prefersReducedMotion ? "linear" : "easeInOut",
            }}
          />
        ))}
        {ambientObjects.map((object) => (
          <motion.div
            key={object.id}
            className="absolute"
            style={{
              left: object.left,
              top: object.top,
              width: object.size,
              height: object.size,
              perspective: "900px",
            }}
            animate={{
              y: prefersReducedMotion ? 0 : [-12, 18, -10],
              rotate: prefersReducedMotion ? 0 : [0, 4, -3, 0],
              opacity: prefersReducedMotion ? 0.58 : [0.5, 0.9, 0.62],
            }}
            transition={{
              duration: prefersReducedMotion ? 0 : object.duration,
              repeat: prefersReducedMotion ? 0 : Infinity,
              ease: prefersReducedMotion ? "linear" : "easeInOut",
              delay: prefersReducedMotion ? 0 : object.delay,
            }}
          >
            <motion.div
              className={`relative h-full w-full border border-brand-accent/45 bg-[linear-gradient(145deg,rgba(28,44,52,0.55),rgba(8,12,18,0.35))] shadow-[0_20px_42px_rgba(0,0,0,0.45)] backdrop-blur-sm ${
                object.shape === "diamond"
                  ? "rotate-45 rounded-[1.5rem]"
                  : "rounded-[1.8rem]"
              }`}
              style={{ transformStyle: "preserve-3d" }}
              animate={{
                rotateY: prefersReducedMotion ? 0 : [0, 18, 0, -18, 0],
                rotateX: prefersReducedMotion ? 0 : [0, 8, 0, -8, 0],
              }}
              transition={{
                duration: prefersReducedMotion ? 0 : object.duration * 0.72,
                repeat: prefersReducedMotion ? 0 : Infinity,
                ease: prefersReducedMotion ? "linear" : "easeInOut",
                delay: prefersReducedMotion ? 0 : object.delay,
              }}
            >
              <div className="absolute -inset-[14%] rounded-[inherit] bg-[radial-gradient(100%_100%_at_50%_50%,rgba(42,250,223,0.28),rgba(76,131,255,0.16)_45%,rgba(0,0,0,0)_75%)] blur-xl" />
              <div className="absolute inset-[9%] rounded-[inherit] border border-brand-accent/60 shadow-[inset_0_0_24px_rgba(42,250,223,0.22)]" />
              <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(100%_100%_at_20%_20%,rgba(42,250,223,0.26),rgba(76,131,255,0.14)_45%,rgba(0,0,0,0)_82%)]" />
            </motion.div>
          </motion.div>
        ))}
        <motion.div
          className="absolute left-[8%] top-[12%] h-72 w-72 rounded-full bg-brand-accent/18 blur-3xl"
          style={{ x: orbAX, y: orbAY }}
        />
        <motion.div
          className="absolute right-[10%] top-[34%] h-80 w-80 rounded-full bg-[#4c83ff]/18 blur-3xl"
          style={{ x: orbBX, y: orbBY }}
        />
      </div>

      <header className="fixed left-1/2 top-5 z-50 w-[min(920px,92vw)] -translate-x-1/2">
        <div className="relative rounded-full border border-brand-border bg-black/45 px-4 py-2 backdrop-blur-xl md:px-6 md:py-2.5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-sm text-brand-text">{content.brand.name}</p>
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-brand-muted">
                {content.brand.tagline}
              </p>
            </div>

            <button
              type="button"
              aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileNavOpen}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-accent/45 bg-[linear-gradient(180deg,rgba(22,22,22,0.95),rgba(8,8,8,0.95))] text-brand-text shadow-[0_0_26px_rgba(42,250,223,0.22)] transition hover:border-brand-accent/70 md:hidden"
              onClick={() => setMobileNavOpen((prev) => !prev)}
            >
              <span className="relative block h-3.5 w-[18px]">
                <span
                  className={`absolute left-0 top-0 block h-[2px] w-[18px] rounded-full bg-brand-accent transition-transform duration-300 ${
                    mobileNavOpen ? "translate-y-[6px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[6px] block h-[2px] w-[18px] rounded-full bg-brand-text transition-opacity duration-300 ${
                    mobileNavOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 top-[12px] block h-[2px] w-[18px] rounded-full bg-brand-accent transition-transform duration-300 ${
                    mobileNavOpen ? "-translate-y-[6px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>

            <nav className="hidden items-center gap-5 md:flex">
              {content.navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-xs font-medium text-brand-text/85 transition hover:text-brand-accent"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileNavOpen ? (
          <div className="fixed inset-0 z-[58] md:hidden">
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              className="absolute inset-0 bg-black/72 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.nav
              initial={{ opacity: 0, y: -18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-x-4 top-24 rounded-[1.8rem] border border-brand-accent/35 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(42,250,223,0.18),rgba(0,0,0,0)_55%),linear-gradient(180deg,rgba(14,14,14,0.96),rgba(7,7,7,0.96))] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-[0.65rem] uppercase tracking-[0.24em] text-brand-accent/90">
                  Navigation
                </p>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand-border text-xs text-brand-text/90"
                >
                  x
                </button>
              </div>

              <div className="mt-3 grid gap-2">
                {content.navigation.map((item) => (
                  <a
                    key={`mobile-${item.href}`}
                    href={item.href}
                    className="rounded-2xl border border-brand-border/80 bg-black/35 px-4 py-3 font-display text-xl tracking-[0.01em] text-brand-text transition hover:border-brand-accent/70 hover:bg-brand-accent/12 hover:text-brand-accent"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </motion.nav>
          </div>
        ) : null}
      </AnimatePresence>

      <main className="w-full px-4 pb-20 pt-32 md:px-6 lg:px-8">
        <section
          id="hero"
          className="noise-overlay grid min-h-screen items-center gap-10 pb-12 pt-10 lg:grid-cols-[0.92fr_1.08fr]"
        >
          <div className="reveal-up space-y-6">
            <h1 className="font-display text-[3.2rem] leading-[0.95] sm:text-[4.6rem] md:text-[5.4rem] lg:text-[6.5rem]">
              {content.hero.displayName.split("").map((character, index) => (
                <motion.span
                  key={`${character}-${index}`}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 70 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 0.55, delay: 0.15 + index * 0.03 }
                  }
                  className="inline-block"
                >
                  {character === " " ? "\u00a0" : character}
                </motion.span>
              ))}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xl text-brand-text md:text-2xl">
              <span className="font-display">{content.hero.rolePrimary}</span>
              <motion.span
                animate={prefersReducedMotion ? undefined : { rotate: 360 }}
                transition={
                  prefersReducedMotion
                    ? undefined
                    : { duration: 3.8, repeat: Infinity, ease: "linear" }
                }
                className="font-display text-gradient-accent"
              >
                x
              </motion.span>
              <motion.span
                key={roleText}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.45 }}
                className="font-display text-gradient-accent"
              >
                {roleText}
              </motion.span>
            </div>

            <p className="max-w-[52ch] text-base leading-8 text-brand-muted md:text-lg">
              {content.hero.subheadline}
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href={content.hero.primaryCtaHref}
                data-cursor="interactive"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-accent px-6 py-3 text-sm font-semibold text-black shadow-[0_0_28px_rgba(42,250,223,0.35)] transition hover:brightness-110"
              >
                {content.hero.primaryCtaLabel}
                <span className="transition group-hover:translate-x-1">{"->"}</span>
              </a>
              <a
                href={content.hero.resumeUrl}
                data-cursor="interactive"
                className="rounded-full border border-brand-border bg-brand-bg-secondary/75 px-6 py-3 text-sm text-brand-text transition hover:border-brand-accent/55 hover:text-brand-accent"
              >
                {content.hero.secondaryCtaLabel}
              </a>
            </div>
          </div>

          <motion.div
            className="reveal-up relative mx-auto h-[410px] w-full max-w-[560px] rounded-[2rem] border border-brand-border bg-brand-bg-secondary/60 p-4 backdrop-blur-xl lg:h-auto lg:max-w-[540px] lg:aspect-square xl:max-w-[600px]"
            whileHover={enableInteractiveMotion ? { rotateX: 2.4, rotateY: -2.4 } : undefined}
            transition={enableInteractiveMotion ? { duration: 0.25 } : undefined}
            data-cursor="interactive"
          >
            <div className="absolute inset-0 rounded-[2rem] border border-brand-accent/25 shadow-[0_0_80px_rgba(42,250,223,0.18)]" />
            <div className="relative h-full overflow-hidden rounded-[1.55rem] border border-brand-border bg-black">
              <AnimatePresence mode="wait" initial={false}>
                {activeMockup ? (
                  <motion.div
                    key={activeMockup.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="h-full will-change-[opacity]"
                  >
                    <MediaThumb
                      kind={activeMockup.mediaKind}
                      url={activeMockup.mediaUrl}
                      alt={activeMockup.caption}
                      className="h-full w-full object-contain"
                      sizes="(max-width: 768px) 90vw, (max-width: 1280px) 46vw, 560px"
                      quality={92}
                      priority
                      loading="eager"
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-brand-accent">Live Preview</p>
                <p className="mt-1 text-sm text-brand-text/90">{activeMockup?.caption}</p>
              </div>
            </div>
          </motion.div>
        </section>

        <section
          id="about"
          className="reveal-up mt-14 grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr]"
        >
          <div className="order-2 mx-auto w-full max-w-[460px] overflow-hidden rounded-3xl border border-brand-border bg-brand-bg-secondary/75 lg:order-1 lg:max-w-[540px]">
            <MediaThumb
              kind="image"
              url={content.about.imageUrl}
              alt={content.about.heading}
              className="h-[360px] w-full object-cover sm:h-[460px] lg:h-[560px] xl:h-[620px]"
              sizes="(max-width: 768px) 94vw, (max-width: 1280px) 42vw, 540px"
            />
          </div>
          <div className="order-1 h-fit rounded-3xl border border-brand-border bg-brand-bg-secondary/70 p-8 backdrop-blur-xl lg:order-2">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-accent">{content.about.title}</p>
            <h2 className="mt-4 max-w-[18ch] font-display text-4xl leading-tight md:text-5xl">
              {content.about.heading}
            </h2>
            <p className="mt-6 max-w-[58ch] text-base leading-8 text-brand-muted md:text-lg">
              {content.about.description}
            </p>
          </div>
        </section>

        <section id="experience" className="mt-24">
          <h2 className="reveal-up font-display text-4xl md:text-5xl">Experience</h2>
          <div ref={experienceTimelineRef} className="relative mt-8 pl-8 md:pl-10">
            <div className="pointer-events-none absolute bottom-8 left-0 top-8">
              <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-brand-border to-transparent" />
              <motion.div
                className="absolute left-0 -translate-x-[1px] w-[3px] rounded-full bg-gradient-to-b from-transparent via-brand-accent to-transparent blur-[0.4px]"
                style={{
                  top: experienceGlowTop,
                  opacity: experienceGlowOpacity,
                  height: "6.5rem",
                  boxShadow: "0 0 24px rgba(42,250,223,0.92)",
                  maskImage:
                    "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
                }}
              />
            </div>

            <div className="space-y-4">
              {content.experience.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, x: -35 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.55, delay: index * 0.06 }}
                  className="relative rounded-2xl border border-brand-border bg-brand-bg-secondary/70 p-5"
                >
                  <motion.span
                    className="absolute -left-[2.35rem] top-8 h-3 w-3 rounded-full bg-brand-accent md:-left-[2.85rem]"
                    animate={{
                      opacity: 0.28,
                      scale: 0.72,
                      boxShadow: "0 0 8px rgba(42,250,223,0.35)",
                    }}
                    whileInView={{
                      opacity: 1,
                      scale: 1,
                      boxShadow: "0 0 22px rgba(42,250,223,0.95)",
                    }}
                    viewport={{ amount: 0.7 }}
                    transition={{
                      duration: 0.28,
                      ease: "easeOut",
                      delay: index * 0.1,
                    }}
                  />
                  <p className="font-numbers text-xs uppercase tracking-[0.24em] text-brand-accent">{item.year}</p>
                  <h3 className="mt-1 font-display text-2xl">{item.title}</h3>
                  <p className="mt-2 text-sm text-brand-muted">{item.organization}</p>
                  <p className="mt-3 max-w-[65ch] text-sm leading-7 text-brand-muted/95">{item.summary}</p>
                  <button
                    type="button"
                    onClick={() => {
                      openExperienceGallery(item.id);
                    }}
                    data-cursor="interactive"
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-border bg-black/25 px-4 py-2 text-xs uppercase tracking-[0.14em] text-brand-text transition hover:border-brand-accent/70 hover:text-brand-accent"
                  >
                    Show Work
                    <span>{"->"}</span>
                  </button>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="featured-works" className="mt-24 space-y-10">
          <h2 className="reveal-up font-display text-4xl md:text-5xl">Featured Works</h2>
          {content.featuredWorks.map((work, workIndex) => (
            <article
              key={work.id}
              className="reveal-up group grid gap-4 rounded-[2rem] border border-brand-border bg-brand-bg-secondary/70 p-4 md:gap-6 md:p-5 lg:min-h-[88vh] lg:grid-cols-[1.2fr_0.8fr]"
            >
              <div className="relative overflow-hidden rounded-[1.45rem] border border-brand-border">
                <MediaThumb
                  kind={work.mediaKind}
                  url={work.mediaUrl}
                  alt={work.title}
                  className="h-[290px] w-full object-cover transition duration-700 group-hover:scale-105 sm:h-[360px] md:h-[420px] lg:h-full lg:min-h-[420px]"
                  sizes="(max-width: 768px) 94vw, (max-width: 1280px) 80vw, 58vw"
                  quality={90}
                  priority={workIndex === 0}
                />
                <div className="absolute inset-0 bg-black/35 opacity-0 transition duration-300 group-hover:opacity-100" />
              </div>
              <div className="flex flex-col rounded-[1.45rem] border border-brand-border bg-black/35 p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-accent">{work.subtitle}</p>
                  <h3 className="mt-2 font-display text-3xl md:text-4xl">{work.title}</h3>
                </div>
                <div className="mt-5 space-y-3 text-sm leading-7 text-brand-muted">
                  <p><span className="text-brand-text">Challenge:</span> {work.challenge}</p>
                  <p><span className="text-brand-text">Research:</span> {work.research}</p>
                  <p><span className="text-brand-text">Design:</span> {work.design}</p>
                  <p><span className="text-brand-text">Result:</span> {work.result}</p>
                </div>
                <div className="pt-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-accent">Tools Used</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {work.tools.map((tool) => (
                      <span
                        key={tool}
                        className="rounded-full border border-brand-border bg-brand-bg-secondary px-3 py-1 text-xs text-brand-text"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => openExperienceGalleryFromWork(workIndex)}
                    data-cursor="interactive"
                    className="rounded-full border border-brand-border bg-black/55 px-4 py-2 text-xs uppercase tracking-[0.16em] text-brand-text transition hover:border-brand-accent/70 hover:text-brand-accent"
                  >
                    View Case Study
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section
          id="services"
          className="mt-24 rounded-[2rem] border border-brand-border bg-[radial-gradient(120%_120%_at_0%_0%,rgba(42,250,223,0.14),rgba(0,0,0,0)_52%),linear-gradient(180deg,rgba(16,16,16,0.86),rgba(6,6,6,0.92))] p-6 md:p-8"
        >
          <div className="reveal-up flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-brand-accent">What I Offer</p>
              <h2 className="mt-2 font-display text-4xl md:text-5xl">Services</h2>
            </div>
            <p className="max-w-[52ch] text-sm leading-7 text-brand-muted">
              From visual systems to responsive frontends, each service is crafted for clarity,
              impact, and measurable digital growth.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {content.services.map((service, index) => (
              <motion.article
                key={service.id}
                whileHover={
                  enableInteractiveMotion ? { y: -8, rotateX: 1.5, rotateY: -1.5 } : undefined
                }
                transition={enableInteractiveMotion ? { duration: 0.22 } : undefined}
                data-cursor="interactive"
                className="reveal-up group relative overflow-hidden rounded-3xl border border-brand-border/90 bg-black/45 p-6 shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              >
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-accent opacity-70" />
                <p className="text-[0.68rem] uppercase tracking-[0.18em] text-brand-accent/90">
                  Service {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 font-display text-[1.9rem] leading-tight">{service.title}</h3>
                <p className="mt-3 text-sm leading-7 text-brand-text/78">{service.description}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section
          id="toolbox"
          className="mt-24 rounded-[2rem] border border-brand-border bg-[radial-gradient(100%_120%_at_100%_0%,rgba(76,131,255,0.18),rgba(0,0,0,0)_50%),linear-gradient(180deg,rgba(16,16,16,0.86),rgba(7,7,7,0.92))] p-6 md:p-8"
        >
          <div className="reveal-up flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-brand-accent">Stack & Software</p>
              <h2 className="mt-2 font-display text-4xl md:text-5xl">Toolbox</h2>
            </div>
            <p className="max-w-[52ch] text-sm leading-7 text-brand-muted">
              A practical mix of design, development, and next-step tools that power full
              creative-to-code execution.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <div className="reveal-up rounded-3xl border border-brand-border bg-black/45 p-6 shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-brand-accent">Design</p>
              <div className="mt-4 h-px bg-gradient-to-r from-brand-accent/70 to-transparent" />
              <div className="mt-4 flex flex-wrap gap-2">
                {content.toolbox.design.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-brand-accent/30 bg-brand-bg-secondary/80 px-3 py-1 text-xs text-brand-text"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="reveal-up rounded-3xl border border-brand-border bg-black/45 p-6 shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-brand-accent">Development</p>
              <div className="mt-4 h-px bg-gradient-to-r from-brand-accent/70 to-transparent" />
              <div className="mt-4 flex flex-wrap gap-2">
                {content.toolbox.development.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-brand-accent/30 bg-brand-bg-secondary/80 px-3 py-1 text-xs text-brand-text"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="reveal-up rounded-3xl border border-brand-border bg-black/45 p-6 shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-brand-accent">Learning</p>
              <div className="mt-4 h-px bg-gradient-to-r from-brand-accent/70 to-transparent" />
              <div className="mt-4 flex flex-wrap gap-2">
                {content.toolbox.learning.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-brand-accent/30 bg-brand-bg-secondary/80 px-3 py-1 text-xs text-brand-text"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24 rounded-[2rem] border border-brand-border bg-[radial-gradient(120%_120%_at_50%_0%,rgba(42,250,223,0.12),rgba(0,0,0,0)_56%),linear-gradient(180deg,rgba(15,15,15,0.88),rgba(6,6,6,0.92))] p-6 md:p-8">
          <div className="reveal-up flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-brand-accent">Core Values</p>
              <h2 className="mt-2 font-display text-4xl md:text-5xl">Why Work With Me</h2>
            </div>
            <p className="max-w-[52ch] text-sm leading-7 text-brand-muted">
              Creative thinking, detail-level precision, and performance-first execution on every
              deliverable.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {content.whyWorkWithMe.map((item) => (
              <motion.article
                key={item.id}
                whileHover={enableInteractiveMotion ? { y: -6 } : undefined}
                transition={enableInteractiveMotion ? { duration: 0.2 } : undefined}
                className="reveal-up rounded-3xl border border-brand-border bg-black/45 p-6 shadow-[0_14px_40px_rgba(0,0,0,0.35)]"
              >
                <h3 className="font-display text-[1.9rem] leading-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-brand-text/78">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {content.numbers.map((stat) => (
              <NumberCard
                key={stat.id}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
              />
            ))}
          </div>
        </section>

        <section className="mt-24 rounded-[2rem] border border-dashed border-brand-border bg-brand-bg-secondary/45 p-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-accent">Testimonials</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Client voices coming soon.</h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-brand-muted">
            This section is intentionally reserved for testimonials and social proof
            snapshots in the next content update.
          </p>
        </section>

        <section className="mt-24 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-3xl md:text-4xl">Quick Showcase</h2>
            <p className="text-sm text-brand-muted">Recent visuals from experience galleries</p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-brand-border bg-brand-bg-secondary/65 py-5">
            <motion.div
              className="flex w-max gap-4 px-4 md:px-6"
              animate={prefersReducedMotion ? { x: "0%" } : { x: ["0%", "-50%"] }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 26, repeat: Infinity, ease: "linear" }
              }
            >
              {[...bottomShowcaseItems, ...bottomShowcaseItems].map((item, index) => (
                <article
                  key={`${item.key}-${index}`}
                  className="w-[250px] shrink-0 overflow-hidden rounded-2xl border border-brand-border bg-black/35 md:w-[300px]"
                >
                  <MediaThumb
                    kind={item.mediaKind}
                    url={item.mediaUrl}
                    alt={item.title}
                    className="h-40 w-full object-cover"
                    sizes="(max-width: 768px) 250px, 300px"
                  />
                  <div className="space-y-1 p-3">
                    <h3 className="text-sm font-semibold text-brand-text">{item.title}</h3>
                    <p className="text-xs text-brand-muted">{item.subtitle}</p>
                  </div>
                </article>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="contact" className="mt-24 rounded-[2rem] border border-brand-border bg-brand-bg-secondary/75 p-8 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-accent">Contact</p>
          <h2 className="mt-3 font-display text-4xl leading-tight md:text-6xl">{content.contact.title}</h2>
          <p className="mt-5 max-w-[60ch] text-base leading-8 text-brand-muted">{content.contact.description}</p>

          <div className="mt-8 grid gap-3 text-sm md:grid-cols-3">
            <a
              href={`mailto:${content.contact.email}`}
              className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text"
            >
              {content.contact.email}
            </a>
            <a
              href={`tel:${content.contact.phone}`}
              className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text"
            >
              {content.contact.phone}
            </a>
            <p className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text">
              {content.contact.location}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={content.contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="interactive"
              className="inline-flex items-center gap-2 rounded-full border border-brand-border px-4 py-2 text-xs uppercase tracking-[0.14em] text-brand-text transition hover:border-brand-accent/70 hover:text-brand-accent"
            >
              <span className="font-semibold">IG</span>
              Instagram
            </a>
            <a
              href={content.contact.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="interactive"
              className="inline-flex items-center gap-2 rounded-full border border-brand-border px-4 py-2 text-xs uppercase tracking-[0.14em] text-brand-text transition hover:border-brand-accent/70 hover:text-brand-accent"
            >
              <span className="font-semibold">IN</span>
              LinkedIn
            </a>
            <a
              href={content.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="interactive"
              className="inline-flex items-center gap-2 rounded-full border border-brand-border px-4 py-2 text-xs uppercase tracking-[0.14em] text-brand-text transition hover:border-brand-accent/70 hover:text-brand-accent"
            >
              <span className="font-semibold">WA</span>
              WhatsApp
            </a>
          </div>

          <a
            href={content.contact.projectCtaHref}
            data-cursor="interactive"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-accent px-6 py-3 text-sm font-semibold text-black shadow-[0_0_30px_rgba(42,250,223,0.38)]"
          >
            {content.contact.projectCtaLabel}
            <span>{"->"}</span>
          </a>
        </section>
      </main>

      <footer className="mt-14 border-t border-brand-border px-4 py-10 md:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <p className="font-display text-xl">{content.footer.lineOne}</p>
          <p className="text-sm text-brand-muted">{content.footer.lineTwo}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-brand-accent">{content.footer.credit}</p>
        </div>
      </footer>
    </div>
  );
}
