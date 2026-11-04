"use client";

import Image, { type ImageProps } from "next/image";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import type { FeaturedWorkItem, PortfolioContent } from "@/types/portfolio";

interface PortfolioPageProps {
  content: PortfolioContent;
}

function MediaThumb({
  kind,
  url,
  alt,
  className,
  sizes = "100vw",
  quality = 80,
  loading,
  priority = false,
}: {
  kind: "image" | "video";
  url?: string;
  alt: string;
  className?: string;
  sizes?: string;
  quality?: number;
  loading?: ImageProps["loading"];
  priority?: boolean;
}) {
  const [hasError, setHasError] = useState(false);

  if (!url || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-zinc-900/80 p-4 text-center text-xs text-brand-muted ${className ?? "h-48 w-full"}`}
      >
        <svg
          className="mb-1.5 h-6 w-6 text-brand-muted/60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="line-clamp-1">{alt || "Preview image"}</span>
      </div>
    );
  }

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
        onError={() => setHasError(true)}
      />
    );
  }

  const resolvedLoading = priority ? undefined : (loading ?? "lazy");

  return (
    <Image
      className={className}
      src={url}
      alt={alt || "Media thumbnail"}
      width={1800}
      height={1200}
      sizes={sizes}
      quality={quality}
      loading={resolvedLoading}
      priority={priority}
      decoding="async"
      onError={() => setHasError(true)}
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
  const [mockupIndex, setMockupIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);

  const [cursorActive, setCursorActive] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [activeExperienceId, setActiveExperienceId] = useState<string | null>(null);
  const [activeExperienceMediaIndex, setActiveExperienceMediaIndex] = useState(0);
  const [activeFeaturedWork, setActiveFeaturedWork] = useState<FeaturedWorkItem | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const [experienceActiveTab, setExperienceActiveTab] = useState<"work" | "education">("work");
  const [activeCertificateId, setActiveCertificateId] = useState<string | null>(null);

  const lenisRef = useRef<Lenis | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const experienceTimelineRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Mouse tracking
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const ringX = useSpring(cursorX, { stiffness: 240, damping: 30 });
  const ringY = useSpring(cursorY, { stiffness: 240, damping: 30 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 80, damping: 20, mass: 0.8 });
  const smoothY = useSpring(mouseY, { stiffness: 80, damping: 20, mass: 0.8 });
  const orbAX = useTransform(smoothX, [0, 1], [-35, 35]);
  const orbAY = useTransform(smoothY, [0, 1], [-20, 20]);
  const orbBX = useTransform(smoothX, [0, 1], [30, -25]);
  const orbBY = useTransform(smoothY, [0, 1], [15, -18]);

  // Subtle 3D tilt for showcase card
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const smoothTiltX = useSpring(tiltX, { stiffness: 180, damping: 24 });
  const smoothTiltY = useSpring(tiltY, { stiffness: 180, damping: 24 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !hasFinePointer || prefersReducedMotion) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    tiltX.set((y - 0.5) * -10);
    tiltY.set((x - 0.5) * 10);
  };

  const handleCardMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const handlePrevMockup = () => {
    setMockupIndex((prev) =>
      prev > 0 ? prev - 1 : content.hero.mockupMedia.length - 1,
    );
  };

  const handleNextMockup = () => {
    setMockupIndex((prev) =>
      prev < content.hero.mockupMedia.length - 1 ? prev + 1 : 0,
    );
  };

  const handleCopyEmail = () => {
    if (!content.contact.email) return;
    void navigator.clipboard.writeText(content.contact.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2400);
  };


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

  const enableInteractiveMotion = hasFinePointer && !prefersReducedMotion;

  const activeExperience = useMemo(
    () => content.experience.find((item) => item.id === activeExperienceId) ?? null,
    [content.experience, activeExperienceId],
  );

  const activeExperienceMedia =
    activeExperience?.gallery[activeExperienceMediaIndex] ?? activeExperience?.gallery[0];

  const activeCertificate = useMemo(
    () => content.certifications?.find((item) => item.id === activeCertificateId) ?? null,
    [content.certifications, activeCertificateId],
  );

  useEffect(() => {
    if (!activeCertificate) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveCertificateId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCertificate]);

  function openExperienceGallery(experienceId: string) {
    setActiveExperienceId(experienceId);
    setActiveExperienceMediaIndex(0);
  }

  function handleFeaturedWorkClick(work: FeaturedWorkItem) {
    if (work.caseStudyUrl && work.caseStudyUrl !== "#" && !work.caseStudyUrl.startsWith("#")) {
      window.open(work.caseStudyUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setActiveFeaturedWork(work);
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

  // Ensure marquee items repeat enough times to fill any screen size smoothly
  const marqueeItems = useMemo(() => {
    if (bottomShowcaseItems.length === 0) return [];
    const multiplier = Math.max(3, Math.ceil(12 / bottomShowcaseItems.length));
    return Array.from({ length: multiplier }).flatMap(() => bottomShowcaseItems);
  }, [bottomShowcaseItems]);

  const scrollToAnchor = useCallback((href: string) => {
    if (!href.startsWith("#")) {
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target as HTMLElement, { offset: -50, duration: 1.1 });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  const handleNavClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (href.startsWith("#")) {
        event.preventDefault();
        setMobileNavOpen(false);
        setTimeout(() => {
          scrollToAnchor(href);
        }, 80);
      }
    },
    [scrollToAnchor],
  );

  // Viewport detection
  useEffect(() => {
    const updateViewportState = () => {
      setHasFinePointer(window.matchMedia("(pointer:fine)").matches);
    };

    updateViewportState();
    window.addEventListener("resize", updateViewportState);
    return () => window.removeEventListener("resize", updateViewportState);
  }, []);

  // Studio live clock (India time)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Loading screen progression
  useEffect(() => {
    let progress = 0;
    const timer = setInterval(() => {
      progress = Math.min(100, progress + Math.max(4, 15 - Math.floor(progress / 9)));
      setLoadingProgress(progress);
      if (progress >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setLoadingDone(true);
        }, 360);
      }
    }, 70);

    return () => clearInterval(timer);
  }, []);

  // Manage body overflow during loading screen
  useEffect(() => {
    if (!loadingDone) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [loadingDone]);

  // Smooth carousel auto-cycle
  useEffect(() => {
    if (prefersReducedMotion || content.hero.mockupMedia.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setMockupIndex((prev) => (prev + 1) % content.hero.mockupMedia.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [content.hero.mockupMedia.length, prefersReducedMotion]);

  // Preload hero mockup images
  useEffect(() => {
    content.hero.mockupMedia.forEach((item) => {
      if (item.mediaKind !== "image" || !item.mediaUrl) {
        return;
      }

      const img = new window.Image();
      img.decoding = "async";
      img.fetchPriority = item.id === content.hero.mockupMedia[0]?.id ? "high" : "auto";
      img.src = item.mediaUrl;
      void img.decode?.().catch(() => undefined);
    });
  }, [content.hero.mockupMedia]);

  // Lenis & GSAP ScrollTrigger Integration
  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Prevent mobile address-bar resize triggers from creating jank/stutter
    ScrollTrigger.config({
      ignoreMobileResize: true,
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
    });

    const isTouch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches);

    const lenis = new Lenis({
      duration: isTouch ? 0.75 : 1.1,
      smoothWheel: true,
      syncTouch: true,
      syncTouchLerp: 0.09,
      touchMultiplier: 1.15,
      gestureOrientation: "vertical",
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    // Smooth frame interpolations on mobile to eliminate jerkiness
    gsap.ticker.lagSmoothing(500, 33);

    const ctx = gsap.context(() => {
      const blocks = gsap.utils.toArray<HTMLElement>(".reveal-up");
      blocks.forEach((block) => {
        gsap.fromTo(
          block,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: block,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    });

    return () => {
      ctx.revert();
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [prefersReducedMotion]);

  // Custom cursor tracking
  useEffect(() => {
    if (!hasFinePointer || prefersReducedMotion) {
      return;
    }

    const onMouseMove = (event: MouseEvent) => {
      if (!cursorVisible) {
        setCursorVisible(true);
      }
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
      mouseX.set(event.clientX / window.innerWidth);
      mouseY.set(event.clientY / window.innerHeight);

      const target = event.target as HTMLElement;
      const interactive = target.closest("a,button,[data-cursor='interactive'],input,textarea");
      setCursorActive(Boolean(interactive));
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [cursorX, cursorY, mouseX, mouseY, hasFinePointer, prefersReducedMotion, cursorVisible]);

  // Modal keyboard handling (Experience)
  useEffect(() => {
    if (!activeExperience) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveExperienceId(null);
      } else if (event.key === "ArrowLeft") {
        setActiveExperienceMediaIndex((prev) =>
          prev > 0 ? prev - 1 : activeExperience.gallery.length - 1,
        );
      } else if (event.key === "ArrowRight") {
        setActiveExperienceMediaIndex((prev) =>
          prev < activeExperience.gallery.length - 1 ? prev + 1 : 0,
        );
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

  // Modal keyboard handling (Featured Work)
  useEffect(() => {
    if (!activeFeaturedWork) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveFeaturedWork(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeFeaturedWork]);

  // Mobile nav overflow lock
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

  const activeMockup =
    content.hero.mockupMedia[mockupIndex] ?? content.hero.mockupMedia[0];
  const loadingFilledBlocks = Math.floor(loadingProgress / 10);

  return (
    <div className="relative overflow-x-clip bg-brand-bg text-brand-text">
      {/* Custom interactive cursor */}
      {cursorVisible && hasFinePointer && !prefersReducedMotion ? (
        <>
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
        </>
      ) : null}

      {/* Loading Screen */}
      {!loadingDone ? (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: loadingProgress >= 100 ? 0 : 1 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-[#110C17]"
        >
          <p className="font-display text-4xl tracking-[0.08em]">{content.loading.displayName}</p>
          <p className="mt-2 text-sm tracking-[0.18em] text-brand-muted">{content.loading.statusText}</p>
          <div className="mt-8 flex gap-1.5">
            {Array.from({ length: 10 }).map((_, index) => (
              <span
                key={`loading-${index}`}
                className={`h-4 w-5 border border-brand-border transition-colors duration-150 ${
                  index < loadingFilledBlocks ? "bg-brand-accent shadow-[0_0_14px_rgba(144,86,162,0.85)]" : "bg-transparent"
                }`}
              />
            ))}
          </div>
        </motion.div>
      ) : null}

      {/* Experience Gallery Modal */}
      {activeExperience ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[95] flex items-start justify-center overflow-y-auto bg-black/85 p-4 py-6 backdrop-blur-md md:items-center md:py-4"
          onClick={() => setActiveExperienceId(null)}
        >
          <div
            className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-5xl overflow-y-auto rounded-3xl border border-brand-border bg-brand-bg-secondary p-4 md:p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-numbers text-xs uppercase tracking-[0.18em] text-brand-accent">
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
              <div className="relative overflow-hidden rounded-2xl border border-brand-border bg-black/40">
                {activeExperienceMedia ? (
                  <div className="relative">
                    <MediaThumb
                      kind={activeExperienceMedia.mediaKind}
                      url={activeExperienceMedia.mediaUrl}
                      alt={activeExperienceMedia.caption}
                      className="h-[420px] w-full object-cover"
                      sizes="(max-width: 1024px) 94vw, 64vw"
                    />

                    {activeExperience.gallery.length > 1 ? (
                      <>
                        <button
                          type="button"
                          aria-label="Previous gallery image"
                          onClick={() =>
                            setActiveExperienceMediaIndex((prev) =>
                              prev > 0 ? prev - 1 : activeExperience.gallery.length - 1,
                            )
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-brand-border bg-black/70 p-2.5 text-white backdrop-blur transition hover:border-brand-accent hover:text-brand-accent"
                        >
                          {"<"}
                        </button>
                        <button
                          type="button"
                          aria-label="Next gallery image"
                          onClick={() =>
                            setActiveExperienceMediaIndex((prev) =>
                              prev < activeExperience.gallery.length - 1 ? prev + 1 : 0,
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-brand-border bg-black/70 p-2.5 text-white backdrop-blur transition hover:border-brand-accent hover:text-brand-accent"
                        >
                          {">"}
                        </button>
                      </>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex h-[420px] items-center justify-center p-6 text-sm text-brand-muted">
                    No preview media available.
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-brand-border px-4 py-3 text-sm text-brand-text/90">
                  <span>{activeExperienceMedia?.caption}</span>
                  {activeExperience.gallery.length > 1 ? (
                    <span className="font-numbers text-xs text-brand-muted">
                      {activeExperienceMediaIndex + 1} / {activeExperience.gallery.length}
                    </span>
                  ) : null}
                </div>
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
                          ? "border-brand-accent shadow-[0_0_12px_rgba(42,250,223,0.3)]"
                          : "border-brand-border hover:border-brand-accent/50"
                      }`}
                    >
                      <MediaThumb
                        kind={item.mediaKind}
                        url={item.mediaUrl}
                        alt={item.caption}
                        className="h-24 w-full object-cover"
                        sizes="(max-width: 1024px) 36vw, 220px"
                      />
                      <p className="line-clamp-1 px-3 py-2 text-xs text-brand-muted">{item.caption}</p>
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

      {/* Featured Works - Dedicated Case Study Modal */}
      {activeFeaturedWork ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[95] flex items-start justify-center overflow-y-auto bg-black/85 p-4 py-6 backdrop-blur-md md:items-center md:py-6"
          onClick={() => setActiveFeaturedWork(null)}
        >
          <div
            className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-4xl overflow-y-auto rounded-3xl border border-brand-border bg-brand-bg-secondary p-5 md:p-8 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-brand-accent">
                  {activeFeaturedWork.subtitle}
                </p>
                <h3 className="mt-1 font-display text-3xl md:text-4xl">{activeFeaturedWork.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveFeaturedWork(null)}
                className="rounded-full border border-brand-border px-4 py-2 text-xs uppercase tracking-[0.14em] text-brand-text transition hover:border-brand-accent/70 hover:text-brand-accent"
              >
                Close
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-brand-border bg-black/50">
              <MediaThumb
                kind={activeFeaturedWork.mediaKind}
                url={activeFeaturedWork.mediaUrl}
                alt={activeFeaturedWork.title}
                className="max-h-[460px] w-full object-cover"
                sizes="(max-width: 1024px) 94vw, 896px"
              />
            </div>

            <div className="mt-6 grid gap-4 rounded-2xl border border-brand-border bg-black/40 p-5 text-sm leading-7 text-brand-muted">
              <div>
                <span className="font-semibold text-brand-text">The Challenge: </span>
                {activeFeaturedWork.challenge}
              </div>
              <div>
                <span className="font-semibold text-brand-text">Research & Strategy: </span>
                {activeFeaturedWork.research}
              </div>
              <div>
                <span className="font-semibold text-brand-text">Design Execution: </span>
                {activeFeaturedWork.design}
              </div>
              <div>
                <span className="font-semibold text-brand-text">Outcome & Impact: </span>
                {activeFeaturedWork.result}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-brand-border pt-5">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-brand-accent">Tools Applied</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeFeaturedWork.tools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-full border border-brand-border bg-brand-bg px-3 py-1 text-xs text-brand-text"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {activeFeaturedWork.caseStudyUrl && activeFeaturedWork.caseStudyUrl !== "#" ? (
                <a
                  href={activeFeaturedWork.caseStudyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-5 py-2.5 text-xs font-semibold text-black transition hover:brightness-110"
                >
                  Visit Project Link
                  <span>{"->"}</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* Certificate Lightbox Popup Modal */}
      <AnimatePresence>
        {activeCertificate ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Certificate: ${activeCertificate.name}`}
            className="fixed inset-0 z-[96] flex items-start sm:items-center justify-center overflow-y-auto bg-black/90 p-3 sm:p-6 py-5 sm:py-6 backdrop-blur-md"
            onClick={() => setActiveCertificateId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 14 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative my-auto w-full max-w-4xl max-h-[calc(100dvh-2.5rem)] overflow-y-auto rounded-2xl sm:rounded-3xl border border-[#FF77B8]/30 bg-gradient-to-b from-[#1E0922] via-[#120516] to-[#0B0610] p-4 sm:p-7 shadow-[0_30px_90px_rgba(0,0,0,0.95)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Header Bar */}
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3 sm:pb-4">
                <div className="pr-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#FF77B8]">
                      {activeCertificate.year}
                    </span>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
                      ✓ Verified Credential
                    </span>
                  </div>
                  <h3 className="mt-1 font-display text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                    {activeCertificate.name}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-[#D8CCE0]">
                    Issued by <span className="text-white font-semibold">{activeCertificate.issuer}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveCertificateId(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-zinc-300 transition hover:border-[#FF77B8] hover:bg-[#FF77B8]/10 hover:text-white"
                  aria-label="Close certificate popup"
                >
                  ✕
                </button>
              </div>

              {/* Certificate Image Display */}
              <div className="mt-4 sm:mt-5 overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-black/60 shadow-inner">
                {activeCertificate.imageUrl ? (
                  <div className="relative aspect-[16/10] sm:aspect-[16/11] max-h-[48vh] sm:max-h-[62vh] w-full overflow-hidden bg-black flex items-center justify-center">
                    <MediaThumb
                      kind="image"
                      url={activeCertificate.imageUrl}
                      alt={`${activeCertificate.name} - ${activeCertificate.issuer}`}
                      className="h-full w-full object-contain"
                      sizes="(max-width: 768px) 100vw, 900px"
                      priority
                    />
                  </div>
                ) : (
                  /* Fallback preview card if no image uploaded yet */
                  <div className="relative flex flex-col items-center justify-center p-6 sm:p-14 text-center">
                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-[#FF77B8]/40 bg-[#FF77B8]/10 text-2xl shadow-[0_0_30px_rgba(255,119,184,0.3)]">
                      🎓
                    </div>
                    <h4 className="mt-4 font-display text-xl sm:text-2xl font-bold text-white">
                      {activeCertificate.name}
                    </h4>
                    <p className="mt-2 text-xs sm:text-sm text-[#D8CCE0]">
                      {activeCertificate.issuer} · {activeCertificate.year}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1 font-mono text-[11px] sm:text-xs text-emerald-400">
                      <span>✓ Official Credential Record</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 sm:mt-5 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-3 border-t border-white/10">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {activeCertificate.imageUrl ? (
                    <a
                      href={activeCertificate.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 sm:py-2 font-mono text-xs text-white transition hover:border-[#FF77B8] hover:bg-white/10 text-center"
                    >
                      <span>Open Full Size</span>
                      <span>↗</span>
                    </a>
                  ) : null}
                  {activeCertificate.credentialUrl ? (
                    <a
                      href={activeCertificate.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-full border border-[#FF77B8]/40 bg-[#FF77B8]/10 px-4 py-2.5 sm:py-2 font-mono text-xs font-semibold text-[#FF77B8] transition hover:bg-[#FF77B8]/20 text-center"
                    >
                      <span>Verify Online</span>
                      <span>↗</span>
                    </a>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveCertificateId(null)}
                  className="w-full sm:w-auto rounded-full border border-white/20 bg-white/10 px-5 py-2.5 sm:py-2 font-mono text-xs font-semibold text-white transition hover:bg-white/20 text-center"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {/* Editorial architectural background: Deep Purple & Black Combo */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[#0B0610]" />
        {/* Deep purple atmospheric wash for top region */}
        <div className="absolute inset-x-0 top-0 h-[100vh] bg-gradient-to-b from-[#380E35]/90 via-[#20081E]/80 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_50%_-15%,rgba(65,18,62,0.7),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_90%_100%,rgba(49,18,46,0.6),transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,119,184,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,119,184,0.05) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at 50% 35%, black 45%, transparent 80%)",
          }}
        />
        <motion.div
          className="absolute left-[8%] top-[15%] h-80 w-80 rounded-full bg-[#380E35]/70 blur-[130px]"
          style={{ x: orbAX, y: orbAY }}
        />
        <motion.div
          className="absolute right-[10%] top-[25%] h-96 w-96 rounded-full bg-[#250823]/90 blur-[140px]"
          style={{ x: orbBX, y: orbBY }}
        />
      </div>

      {/* Floating navigation header */}
      <header className="fixed left-1/2 top-5 z-50 w-[min(900px,92vw)] -translate-x-1/2">
        <div className="relative rounded-full border border-white/10 bg-[#140718]/90 px-5 py-2.5 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
          <div className="flex items-center justify-between gap-4">
            <a
              href="#hero"
              onClick={(e) => handleNavClick(e, "#hero")}
              className="text-left transition hover:opacity-85"
            >
              <p className="font-display text-sm font-semibold tracking-wide text-white">
                {content.brand.shortName || content.brand.name || "BuiltBy.sh"}
              </p>
            </a>

            <div className="hidden items-center gap-6 md:flex">
              <nav className="flex items-center gap-6">
                {content.navigation.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="text-xs font-medium text-[#D8CCE0] transition hover:text-[#FF77B8]"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <a
                href={content.brand.navCtaHref || "#contact"}
                onClick={(e) => handleNavClick(e, content.brand.navCtaHref || "#contact")}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#FF77B8]/30 bg-[#FF77B8]/10 px-3.5 py-1 text-xs font-semibold text-[#FF77B8] transition hover:bg-[#FF77B8] hover:text-[#0A050E]"
              >
                <span>{content.brand.navCtaLabel || "Say Hello"}</span>
                <span>↗</span>
              </a>
            </div>

            <button
              type="button"
              aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileNavOpen}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#FF77B8]/30 bg-[#250823]/60 text-white transition hover:border-[#FF77B8] md:hidden"
              onClick={() => setMobileNavOpen((prev) => !prev)}
            >
              <span className="relative block h-3 w-4">
                <span
                  className={`absolute left-0 top-0 block h-[1.5px] w-4 rounded-full bg-white transition-transform duration-300 ${
                    mobileNavOpen ? "translate-y-[5px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[5px] block h-[1.5px] w-4 rounded-full bg-white transition-opacity duration-300 ${
                    mobileNavOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 top-[10px] block h-[1.5px] w-4 rounded-full bg-white transition-transform duration-300 ${
                    mobileNavOpen ? "-translate-y-[5px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileNavOpen ? (
          <div className="fixed inset-0 z-[58] md:hidden">
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.nav
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-4 top-20 rounded-3xl border border-[#9056A2]/30 bg-[#1C1326] p-5 shadow-2xl"
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#FF77B8] font-semibold font-mono">
                  Navigation
                </p>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-xs text-zinc-400"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-1.5">
                {content.navigation.map((item) => (
                  <a
                    key={`mobile-${item.href}`}
                    href={item.href}
                    className="rounded-xl px-4 py-3 font-display text-lg text-white transition hover:bg-white/5 hover:text-[#FF77B8]"
                    onClick={(e) => handleNavClick(e, item.href)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </motion.nav>
          </div>
        ) : null}
      </AnimatePresence>

      <main className="w-full px-4 pb-20 pt-32 sm:pt-36 md:pt-40 lg:pt-44 md:px-8 lg:px-12 max-w-7xl mx-auto">
        {/* HERO SECTION - SIMPLE, CONFIDENT, HIGH-TRUST PRO SHOWCASE */}
        {/* Inspired by Ardian Prasetyo, Matteo Backer & Michael references */}
        <section
          id="hero"
          ref={heroRef}
          className="relative min-h-[calc(100vh-6rem)] flex flex-col justify-between pt-4 pb-12 sm:pb-16 overflow-hidden"
        >
          {/* Deep Purple & Black Atmosphere Canvas */}
          <div className="pointer-events-none absolute -inset-x-8 sm:-inset-x-12 -top-36 sm:-top-44 bottom-0 -z-10 overflow-hidden">
            {/* Deep Black Foundation */}
            <div className="absolute inset-0 bg-[#0B0610]" />
            {/* Rich Plum & Royal Purple Saturated Ambient Wash */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_15%,rgba(49,18,46,0.75),transparent_75%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(56,14,53,0.55),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,rgba(144,86,162,0.18),transparent_55%)]" />
            
            {/* Precision Architectural Hairline Grid with Crosshairs (Michael reference) */}
            <div
              className="absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,119,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,119,184,0.12) 1px, transparent 1px)",
                backgroundSize: "64px 64px",
              }}
            />
            {/* Smooth bottom fade into deep base */}
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0B0610] via-[#0B0610]/80 to-transparent" />
          </div>

          {/* Top Eyebrow Bar: Live Status & Disciplines */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 pt-2">
            <div className="inline-flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="font-mono text-xs font-medium text-white tracking-wide">
                {content.hero.availabilityText || "Available for Select Projects"}
              </span>
              <span className="text-white/20">/</span>
              <span className="font-mono text-xs text-[#D8CCE0]">
                {content.hero.locationText || "India · Worldwide"}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] tracking-wider text-[#D8CCE0]">
              <span className="text-[#FF77B8] font-semibold">01</span>
              <span>{content.hero.rolePrimary || "Frontend Engineering"}</span>
              <span className="text-white/20">·</span>
              <span className="text-[#FF77B8] font-semibold">02</span>
              <span>{content.hero.roleSecondary || "Visual Systems"}</span>
              <span className="text-white/20">·</span>
              <span className="text-[#FF77B8] font-semibold">03</span>
              <span>{content.hero.roleMorph || "Motion UI"}</span>
            </div>
          </div>

          {/* Center Stage: The Ardian & Michael Typographic + Portrait Centerpiece */}
          <div className="relative z-10 my-auto pt-2 pb-6 sm:py-12 flex flex-col items-center">
            {/* Giant Architectural Headline Name: SHARUKH */}
            <div className="w-full text-center select-none overflow-visible pt-1 pb-2 sm:py-0">
              <h1 className="font-display text-4xl xs:text-5xl sm:text-7xl md:text-8xl lg:text-[9.5rem] xl:text-[11.5rem] font-extrabold uppercase tracking-[0.14em] sm:tracking-[0.22em] text-white leading-tight sm:leading-none drop-shadow-2xl">
                {content.hero.displayName || "SHARUKH"}
              </h1>
            </div>

            {/* Portrait Stage: Centerpiece Authentic Subject with Michael-style Floating Cards */}
            <div className="relative mt-2 sm:-mt-10 md:-mt-16 w-full max-w-[310px] sm:max-w-[420px] md:max-w-[480px]">
              {/* Portrait Container Frame */}
              <div className="group relative overflow-hidden rounded-[1.8rem] sm:rounded-[2.5rem] border border-white/15 bg-gradient-to-b from-[#250A24]/90 to-[#110C17]/95 p-2 sm:p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition duration-500 hover:border-[#FF77B8]/40">
                <div className="relative h-[290px] xs:h-[320px] sm:h-[400px] md:h-[460px] w-full overflow-hidden rounded-[1.4rem] sm:rounded-[2rem] bg-[#0B0610]">
                  <MediaThumb
                    kind="image"
                    url={content.hero.portraitUrl || content.about.imageUrl}
                    alt={`${content.hero.displayName} - ${content.hero.rolePrimary} & ${content.hero.roleSecondary}`}
                    className="h-full w-full object-cover object-[center_top] transition-transform duration-700 group-hover:scale-105"
                    priority
                    loading="eager"
                  />
                  {/* Subtle dark gradient along bottom for clean visual integration */}
                  <div className="absolute inset-x-0 bottom-0 h-28 sm:h-32 bg-gradient-to-t from-[#110C17] via-[#110C17]/60 to-transparent" />
                </div>
              </div>

              {/* Floating Card 1: Top-Right Visual Showcase (Michael reference "ZENTIX /Design" style) */}
              <a
                href="#featured-works"
                onClick={(e) => handleNavClick(e, "#featured-works")}
                className="group absolute -right-2 sm:-right-8 top-6 sm:top-10 z-20 flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-white/20 bg-[#16081A]/95 p-2 sm:p-3 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#FF77B8] hover:scale-105"
              >
                <div className="h-9 w-9 sm:h-12 sm:w-12 overflow-hidden rounded-xl border border-white/10 bg-black/60">
                  <Image
                    src={content.hero.archiveThumbnailUrl || content.about.posterImageUrl || "/uploads/1781775293542-artboard-1-300x.png"}
                    alt="Studio Archive Work"
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-left pr-1">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-[#FF77B8] font-semibold">
                    Studio Archive
                  </p>
                  <p className="font-display text-xs sm:text-sm font-bold text-white group-hover:text-[#FF77B8] transition-colors">
                    {content.about.posterCredit || "Graphndo"} ↗
                  </p>
                </div>
              </a>

              {/* Floating Card 2: Bottom-Left Let's Connect Card (Michael reference "Let's Talk" style) */}
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, "#contact")}
                className="group absolute -left-2 sm:-left-8 bottom-4 sm:bottom-6 z-20 flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-white/20 bg-[#16081A]/95 px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#FF77B8] hover:scale-105"
              >
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-[#FF77B8]/15 text-[#FF77B8] font-bold text-xs transition-colors group-hover:bg-[#FF77B8] group-hover:text-[#0B0610]">
                  SH
                </div>
                <div className="text-left">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-[#FF77B8] font-semibold">
                    {content.hero.rolePrimary} &amp; Design
                  </p>
                  <p className="font-display text-xs sm:text-sm font-bold text-white">
                    Let&apos;s Connect ↗
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Bottom Editorial Split: Inspired by Ardian Prasetyo (Headlines + Story + Actions) */}
          <div className="relative z-10 grid gap-8 md:grid-cols-2 md:gap-12 border-t border-white/10 pt-8 sm:pt-10">
            {/* Left Column: Bold Editorial Headline */}
            <div className="space-y-3">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF77B8] font-semibold">
                {content.hero.rolePrimary} &amp; {content.hero.roleSecondary}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.12]">
                {content.hero.headline ? (
                  content.hero.headline
                ) : (
                  <>
                    Designing products that shape experiences. Engineering code that{" "}
                    <span className="text-[#FF77B8]">connects</span>.
                  </>
                )}
              </h2>
            </div>

            {/* Right Column: Authentic Story, Action Buttons & Email */}
            <div className="space-y-6">
              <p className="text-base sm:text-lg text-[#D8CCE0] leading-relaxed font-normal">
                {content.hero.story ||
                  "From concept to creation. I combine intentional graphic design with modern frontend engineering (React, Next.js, TypeScript) to craft digital products that blend form, function, and emotion—turning ideas into designs that earn trust."}
              </p>

              {/* Actions: Ardian Prasetyo Pill Button + Contact Button */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                {/* Primary Pill Button (Ardian Prasetyo style) */}
                <a
                  href={content.hero.primaryCtaHref || "#featured-works"}
                  onClick={(e) => handleNavClick(e, content.hero.primaryCtaHref || "#featured-works")}
                  data-cursor="interactive"
                  className="group inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-[#0B0610] shadow-xl transition-all duration-300 hover:bg-[#FF77B8] hover:text-[#0B0610] hover:scale-[1.02]"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0B0610] text-white transition-transform duration-300 group-hover:translate-x-0.5">
                    →
                  </span>
                  <span>{content.hero.primaryCtaLabel || "See My Work"}</span>
                </a>

                {/* Secondary Ghost Button */}
                <a
                  href={content.hero.secondaryCtaHref || "#contact"}
                  onClick={(e) => handleNavClick(e, content.hero.secondaryCtaHref || "#contact")}
                  data-cursor="interactive"
                  className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#16081A]/80 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md transition-all duration-300 hover:border-[#FF77B8] hover:text-[#FF77B8] hover:bg-[#FF77B8]/10"
                >
                  <span>{content.hero.secondaryCtaLabel || "Start a Project"}</span>
                  <span className="text-[#FF77B8] transition-transform duration-300 group-hover:translate-x-0.5">↗</span>
                </a>

                {/* Email Copy Trigger */}
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  data-cursor="interactive"
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-xs text-[#D8CCE0] transition hover:text-[#FF77B8]"
                  title="Copy email to clipboard"
                >
                  <span>✉</span>
                  <span className="font-mono text-xs">{copiedEmail ? "Copied to clipboard!" : content.contact.email || "studio.graphndo@gmail.com"}</span>
                </button>
              </div>

              {/* Dynamic Trust Metrics Strip (reads from content.numbers) */}
              <div className="flex flex-wrap items-center gap-6 sm:gap-8 border-t border-white/10 pt-4">
                {(content.numbers && content.numbers.length > 0 ? content.numbers.slice(0, 3) : [
                  { id: "def-1", value: 3, suffix: "+", label: "Years Crafting" },
                  { id: "def-2", value: 20, suffix: "+", label: "Projects Shipped" },
                  { id: "def-3", value: 100, suffix: "%", label: "Commitment" },
                ]).map((metric, idx) => (
                  <div key={metric.id || idx} className="flex items-center gap-6 sm:gap-8">
                    <div>
                      <span className={`font-display text-xl font-bold ${idx === 2 ? "text-[#FF77B8]" : "text-white"}`}>
                        {metric.value}{metric.suffix}
                      </span>
                      <span className="ml-2 font-mono text-[11px] uppercase tracking-wider text-[#D8CCE0]">
                        {metric.label}
                      </span>
                    </div>
                    {idx < 2 ? <div className="text-white/20">|</div> : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION - THE STORY: VISUAL HERITAGE TO CODE CRAFT */}
        <section
          id="about"
          className="reveal-up mt-24 grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]"
        >
          {/* Visual Showcase Card: Sharukh's Graphndo Studio Artboard */}
          <div className="group relative mx-auto w-full max-w-[480px] overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-[#220926]/80 to-[#120516]/90 p-3 sm:p-4 shadow-2xl backdrop-blur-xl">
            <div className="relative h-[380px] sm:h-[460px] w-full overflow-hidden rounded-2xl bg-[#0B0610]">
              <Image
                src={content.about.posterImageUrl || "/uploads/1781775293542-artboard-1-300x.png"}
                alt={content.about.posterTag || "Graphndo Studio Design Poster"}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 94vw, 480px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#110C17] via-transparent to-transparent opacity-60" />
            </div>

            <div className="mt-3 flex items-center justify-between px-2 pt-1 text-xs">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#FF77B8] font-semibold">
                {content.about.posterTag || "Visual Archive 01 / Graphic Poster System"}
              </span>
              <span className="font-mono text-[10px] text-[#D8CCE0]">
                {content.about.posterCredit || "Graphndo Studio"}
              </span>
            </div>
          </div>

          {/* Editorial Narrative */}
          <div className="rounded-3xl border border-white/10 bg-[#16081A]/70 p-7 sm:p-9 backdrop-blur-xl shadow-xl">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF77B8] font-semibold">
              {content.about.title || "The Evolution / From Visual Craft to Living Code"}
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              {content.about.heading}
            </h2>
            <div className="mt-5 space-y-4 text-sm sm:text-base leading-relaxed text-[#D8CCE0]">
              <p>{content.about.description}</p>
              {content.about.storyParagraphTwo ? (
                <p>{content.about.storyParagraphTwo}</p>
              ) : (
                <p>
                  To bring those designs to life, I expanded into modern frontend engineering. Today, I build responsive, production-ready web applications using React, Next.js, TypeScript, and fluid GSAP motion—delivering products where aesthetic finesse and technical performance work seamlessly together.
                </p>
              )}
            </div>

            {/* 3 Pillars */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/10 pt-6">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#FF77B8] font-bold">
                  {content.about.pillarOneTitle || "01 / Visual Heritage"}
                </span>
                <p className="mt-1 text-xs font-semibold text-white">
                  {content.about.pillarOneDesc || "Brand & Typography"}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#FF77B8] font-bold">
                  {content.about.pillarTwoTitle || "02 / Technical Craft"}
                </span>
                <p className="mt-1 text-xs font-semibold text-white">
                  {content.about.pillarTwoDesc || "Next.js & TypeScript"}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#FF77B8] font-bold">
                  {content.about.pillarThreeTitle || "03 / Fluid Motion"}
                </span>
                <p className="mt-1 text-xs font-semibold text-white">
                  {content.about.pillarThreeDesc || "GSAP & Interaction"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* EXPERIENCE & EDUCATION SECTION */}
        <section id="experience" className="mt-24 space-y-8">
          <div className="reveal-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-white/10 pb-5">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF77B8] font-semibold">
                Trajectory &amp; Foundation
              </p>
              <h2 className="mt-1 font-display text-4xl md:text-5xl font-bold text-white">
                Experience &amp; Education
              </h2>
            </div>

            {/* Segmented Switcher */}
            <div className="flex w-full sm:w-auto rounded-2xl sm:rounded-full border border-white/15 bg-[#140718]/90 p-1 backdrop-blur-xl shadow-lg">
              <button
                type="button"
                onClick={() => setExperienceActiveTab("work")}
                className={`flex-1 sm:flex-initial text-center rounded-xl sm:rounded-full px-3.5 sm:px-5 py-2.5 sm:py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  experienceActiveTab === "work"
                    ? "bg-[#FF77B8] text-[#0B0610] shadow-md"
                    : "text-[#D8CCE0] hover:text-white"
                }`}
              >
                <span>Work Experience ({content.experience.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setExperienceActiveTab("education")}
                className={`flex-1 sm:flex-initial text-center rounded-xl sm:rounded-full px-3.5 sm:px-5 py-2.5 sm:py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  experienceActiveTab === "education"
                    ? "bg-[#FF77B8] text-[#0B0610] shadow-md"
                    : "text-[#D8CCE0] hover:text-white"
                }`}
              >
                <span className="sm:hidden">Education ({(content.education?.length ?? 0) + (content.certifications?.length ?? 0)})</span>
                <span className="hidden sm:inline">Education &amp; Credentials ({(content.education?.length ?? 0) + (content.certifications?.length ?? 0)})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: WORK EXPERIENCE */}
          {experienceActiveTab === "work" ? (
            <div ref={experienceTimelineRef} className="relative pl-6 sm:pl-8 md:pl-10">
              <div className="pointer-events-none absolute bottom-8 left-0 top-8">
                <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-brand-border to-transparent" />
                <motion.div
                  className="absolute left-0 -translate-x-[1px] w-[3px] rounded-full bg-gradient-to-b from-transparent via-brand-accent to-transparent blur-[0.4px]"
                  style={{
                    top: experienceGlowTop,
                    opacity: experienceGlowOpacity,
                    height: "6.5rem",
                    boxShadow: "0 0 24px rgba(144,86,162,0.92)",
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
                    className="relative rounded-2xl border border-brand-border bg-brand-bg-secondary/70 p-4 sm:p-5 md:p-6 backdrop-blur-xl shadow-lg transition-all duration-300 hover:border-[#FF77B8]/40"
                  >
                    <motion.span
                      className="absolute -left-[1.85rem] sm:-left-[2.35rem] md:-left-[2.85rem] top-8 h-3 w-3 rounded-full bg-brand-accent"
                      animate={{
                        opacity: 0.28,
                        scale: 0.72,
                        boxShadow: "0 0 8px rgba(144,86,162,0.4)",
                      }}
                      whileInView={{
                        opacity: 1,
                        scale: 1,
                        boxShadow: "0 0 22px rgba(144,86,162,0.95)",
                      }}
                      viewport={{ amount: 0.7 }}
                      transition={{
                        duration: 0.28,
                        ease: "easeOut",
                        delay: index * 0.1,
                      }}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#FF77B8] font-bold">
                        {item.year}
                      </p>
                      <span className="font-mono text-[10px] text-zinc-400">
                        {item.organization}
                      </span>
                    </div>

                    <h3 className="mt-1 font-display text-2xl font-bold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-[#FF77B8]/80 font-medium">{item.organization}</p>
                    <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-[#D8CCE0]">{item.summary}</p>

                    {item.gallery && item.gallery.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => openExperienceGallery(item.id)}
                        data-cursor="interactive"
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-border bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.14em] text-white transition hover:border-[#FF77B8] hover:text-[#FF77B8] hover:bg-[#FF77B8]/10"
                      >
                        <span>Show Work ({item.gallery.length})</span>
                        <span>→</span>
                      </button>
                    ) : null}
                  </motion.article>
                ))}
              </div>
            </div>
          ) : (
            /* TAB 2: EDUCATION & CREDENTIALS */
            <div className="space-y-10">
              {/* Academic Programs Timeline */}
              <div className="grid gap-4 sm:grid-cols-2">
                {(content.education && content.education.length > 0
                  ? content.education
                  : [
                      {
                        id: "edu-1",
                        year: "2025 – 2027",
                        degree: "Master of Science in Computer Science (M.Sc.)",
                        institution: "United College of Arts and Science, Tamil Nadu",
                        summary: "Advanced computer science, software architecture, algorithm design, and distributed systems.",
                        honors: "Postgraduate Degree · Advanced CS",
                      },
                      {
                        id: "edu-2",
                        year: "2022 – 2025",
                        degree: "Bachelor of Science in Computer Science (B.Sc.)",
                        institution: "Nilgiri College of Arts and Science, Tamil Nadu",
                        summary: "Rigorous academic foundation in software development, data structures, and web technologies. Awarded Media Supporter Award.",
                        honors: "Media Supporter Award Winner",
                      },
                      {
                        id: "edu-3",
                        year: "2024 – Present",
                        degree: "Advanced Frontend Development Program (CCBP 4.0)",
                        institution: "NxtWave CCBP 4.0 Academy",
                        summary: "Comprehensive training in React.js, Next.js, JavaScript, Responsive Web Design, Git, and REST APIs.",
                        honors: "Official NxtWave Hall of Fame Member",
                      },
                      {
                        id: "edu-4",
                        year: "2023 – 2024",
                        degree: "Professional Graphic Design Training",
                        institution: "Artisto Picasso E-Learning Pvt. Ltd.",
                        summary: "Certified training in Adobe Photoshop, Illustrator, Adobe XD, layout hierarchy, and brand systems.",
                        honors: "Certified Graphic Designer (2023)",
                      },
                      {
                        id: "edu-5",
                        year: "2020 – 2022",
                        degree: "Higher Secondary Certificate (Class XII)",
                        institution: "GTMO Matric Higher Secondary School, Gudalur",
                        summary: "Tamil Nadu State Board secondary education with focus on foundational computer science and mathematics.",
                        honors: "Tamil Nadu State Board",
                      },
                    ]
                ).map((edu, idx) => (
                  <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#16081A]/70 p-5 sm:p-6 backdrop-blur-xl shadow-lg transition-all duration-300 hover:border-[#FF77B8]/40 hover:bg-[#1E0922]/80"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FF77B8]">
                          {edu.year}
                        </span>
                        {edu.honors ? (
                          <span className="inline-flex rounded-full border border-[#FF77B8]/30 bg-[#FF77B8]/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#FF77B8]">
                            {edu.honors}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-2 font-display text-xl font-bold text-white group-hover:text-[#FF77B8] transition-colors">
                        {edu.degree}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm font-medium text-[#D8CCE0]">
                        {edu.institution}
                      </p>
                      <p className="mt-3 text-xs sm:text-sm leading-relaxed text-zinc-400">
                        {edu.summary}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Verified Certifications & Accolades Grid */}
              <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-[#120516]/80 p-4 sm:p-6 md:p-8 backdrop-blur-xl shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                      Certifications &amp; Accolades
                    </h3>
                    <p className="text-xs text-[#D8CCE0] mt-0.5">
                      Verified professional credentials, workshops, and recognition
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#FF77B8]">
                    {content.certifications?.length ?? 5} Verified Credentials
                  </span>
                </div>

                <div className="mt-5 sm:mt-6 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {(content.certifications && content.certifications.length > 0
                    ? content.certifications
                    : [
                        {
                          id: "cert-1",
                          name: "Certified Graphic Designer",
                          issuer: "Artisto Picasso E-Learning Pvt. Ltd.",
                          year: "2023",
                          imageUrl: "https://images.unsplash.com/photo-1589330694653-dad6bc0140ad?auto=format&fit=crop&w=1600&q=80",
                        },
                        {
                          id: "cert-2",
                          name: "Web Development Internship Certificate",
                          issuer: "Skypark IT Tech, Coimbatore",
                          year: "2024",
                          imageUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=1600&q=80",
                        },
                        {
                          id: "cert-3",
                          name: "Frontend Development Program (CCBP 4.0)",
                          issuer: "NxtWave CCBP 4.0 Academy",
                          year: "2024",
                          imageUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1600&q=80",
                        },
                        {
                          id: "cert-4",
                          name: "AWS Mega Workshop on Cloud Applications",
                          issuer: "NxtWave CCBP 4.0 Academy",
                          year: "2024",
                          imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
                        },
                        {
                          id: "cert-5",
                          name: "XPM 4.0 Fundamentals",
                          issuer: "NxtWave CCBP 4.0 Academy",
                          year: "2024",
                          imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80",
                        },
                      ]
                  ).map((cert, index) => (
                    <div
                      key={cert.id || index}
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveCertificateId(cert.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActiveCertificateId(cert.id);
                        }
                      }}
                      data-cursor="interactive"
                      className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#16081A]/70 p-4 sm:p-5 backdrop-blur-xl text-left cursor-pointer transition-all duration-300 hover:border-[#FF77B8]/60 hover:bg-[#200A25]/90 hover:shadow-[0_0_24px_rgba(255,119,184,0.18)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#FF77B8]/50"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-[#FF77B8] font-bold">
                            {cert.year}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
                            <span>✓</span> Certified
                          </span>
                        </div>

                        <h4 className="mt-2.5 text-sm sm:text-base font-bold text-white group-hover:text-[#FF77B8] transition-colors leading-snug">
                          {cert.name}
                        </h4>
                        <p className="mt-1 text-xs text-[#D8CCE0]">{cert.issuer}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#FF77B8] group-hover:underline">
                          <span>View Certificate</span>
                          <span className="transition-transform duration-300 group-hover:translate-x-0.5">↗</span>
                        </span>

                        {cert.credentialUrl ? (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="font-mono text-[10px] text-zinc-400 hover:text-white hover:underline"
                            title="Verify credential online"
                          >
                            Verify Link ↗
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* FEATURED WORKS SECTION */}
        <section id="featured-works" className="mt-24 space-y-10">
          <h2 className="reveal-up font-display text-4xl md:text-5xl">Featured Works</h2>
          {content.featuredWorks.map((work, workIndex) => (
            <article
              key={work.id}
              className="reveal-up group grid gap-4 rounded-[2rem] border border-brand-border bg-brand-bg-secondary/70 p-4 md:gap-6 md:p-5 lg:min-h-[82vh] lg:grid-cols-[1.2fr_0.8fr]"
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
              <div className="flex flex-col justify-between rounded-[1.45rem] border border-brand-border bg-black/35 p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-accent">{work.subtitle}</p>
                  <h3 className="mt-2 font-display text-3xl md:text-4xl">{work.title}</h3>
                  <div className="mt-5 space-y-3 text-sm leading-7 text-brand-muted">
                    <p><span className="font-semibold text-brand-text">Challenge:</span> {work.challenge}</p>
                    <p><span className="font-semibold text-brand-text">Research:</span> {work.research}</p>
                    <p><span className="font-semibold text-brand-text">Design:</span> {work.design}</p>
                    <p><span className="font-semibold text-brand-text">Result:</span> {work.result}</p>
                  </div>
                </div>

                <div className="mt-6 border-t border-brand-border/60 pt-4">
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
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleFeaturedWorkClick(work)}
                      data-cursor="interactive"
                      className="rounded-full border border-brand-border bg-black/55 px-5 py-2.5 text-xs uppercase tracking-[0.16em] text-brand-text transition hover:border-brand-accent/70 hover:text-brand-accent"
                    >
                      View Case Study
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* SERVICES SECTION */}
        <section
          id="services"
          className="mt-24 rounded-[2rem] border border-brand-border bg-[radial-gradient(120%_120%_at_0%_0%,rgba(144,86,162,0.18),transparent_55%),linear-gradient(180deg,rgba(28,19,38,0.86),rgba(17,12,23,0.95))] p-6 md:p-8"
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
                <p className="font-numbers text-[0.68rem] uppercase tracking-[0.18em] text-brand-accent/90">
                  Service {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 font-display text-[1.9rem] leading-tight">{service.title}</h3>
                <p className="mt-3 text-sm leading-7 text-brand-text/78">{service.description}</p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* TOOLBOX SECTION */}
        <section
          id="toolbox"
          className="mt-24 rounded-[2rem] border border-brand-border bg-[radial-gradient(100%_120%_at_100%_0%,rgba(144,86,162,0.2),transparent_55%),linear-gradient(180deg,rgba(28,19,38,0.86),rgba(17,12,23,0.95))] p-6 md:p-8"
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

        {/* WHY WORK WITH ME */}
        <section className="mt-24 rounded-[2rem] border border-brand-border bg-[radial-gradient(120%_120%_at_50%_0%,rgba(144,86,162,0.18),transparent_56%),linear-gradient(180deg,rgba(28,19,38,0.88),rgba(17,12,23,0.95))] p-6 md:p-8">
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

        {/* NUMBERS SECTION */}
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

        {/* TESTIMONIALS PLACEHOLDER */}
        <section className="mt-24 rounded-[2rem] border border-dashed border-brand-border bg-brand-bg-secondary/45 p-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-accent">Testimonials</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Client voices coming soon.</h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-brand-muted">
            This section is reserved for upcoming testimonials and collaborator reviews.
          </p>
        </section>

        {/* QUICK SHOWCASE INFINITE MARQUEE */}
        <section className="mt-24 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-3xl md:text-4xl">Quick Showcase</h2>
            <p className="text-sm text-brand-muted">Visual snapshots across recent projects</p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-brand-border bg-brand-bg-secondary/65 py-5">
            <motion.div
              className="flex w-max gap-4 px-4 md:px-6"
              animate={prefersReducedMotion ? { x: "0%" } : { x: ["0%", "-50%"] }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 28, repeat: Infinity, ease: "linear" }
              }
            >
              {marqueeItems.map((item, index) => (
                <article
                  key={`${item.key}-${index}`}
                  className="w-[260px] shrink-0 overflow-hidden rounded-2xl border border-brand-border bg-black/35 md:w-[320px]"
                >
                  <MediaThumb
                    kind={item.mediaKind}
                    url={item.mediaUrl}
                    alt={item.title}
                    className="h-44 w-full object-cover"
                    sizes="(max-width: 768px) 260px, 320px"
                  />
                  <div className="space-y-1 p-3">
                    <h3 className="line-clamp-1 text-sm font-semibold text-brand-text">{item.title}</h3>
                    <p className="line-clamp-1 text-xs text-brand-muted">{item.subtitle}</p>
                  </div>
                </article>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="mt-24 rounded-[2rem] border border-brand-border bg-brand-bg-secondary/75 p-8 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-accent">Contact</p>
          <h2 className="mt-3 font-display text-4xl leading-tight md:text-6xl">{content.contact.title}</h2>
          <p className="mt-5 max-w-[60ch] text-base leading-8 text-brand-muted">{content.contact.description}</p>

          <div className="mt-8 grid gap-3 text-sm md:grid-cols-3">
            <a
              href={`mailto:${content.contact.email}`}
              className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text transition hover:border-brand-accent/50"
            >
              <span className="block text-xs uppercase tracking-[0.14em] text-brand-accent mb-1">Email</span>
              {content.contact.email}
            </a>
            <a
              href={`tel:${content.contact.phone}`}
              className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text transition hover:border-brand-accent/50"
            >
              <span className="block text-xs uppercase tracking-[0.14em] text-brand-accent mb-1">Phone</span>
              {content.contact.phone}
            </a>
            <div className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-brand-text">
              <span className="block text-xs uppercase tracking-[0.14em] text-brand-accent mb-1">Location</span>
              {content.contact.location}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {content.contact.instagramUrl ? (
              <a
                href={content.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="interactive"
                className="inline-flex items-center gap-2 rounded-full border border-brand-border px-4 py-2 text-xs uppercase tracking-[0.14em] text-brand-text transition hover:border-brand-accent/70 hover:text-brand-accent"
              >
                <span className="font-semibold text-brand-accent">IG</span>
                Instagram
              </a>
            ) : null}
            {content.contact.linkedinUrl ? (
              <a
                href={content.contact.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="interactive"
                className="inline-flex items-center gap-2 rounded-full border border-brand-border px-4 py-2 text-xs uppercase tracking-[0.14em] text-brand-text transition hover:border-brand-accent/70 hover:text-brand-accent"
              >
                <span className="font-semibold text-brand-accent">IN</span>
                LinkedIn
              </a>
            ) : null}
            {content.contact.whatsappUrl ? (
              <a
                href={content.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="interactive"
                className="inline-flex items-center gap-2 rounded-full border border-brand-border px-4 py-2 text-xs uppercase tracking-[0.14em] text-brand-text transition hover:border-brand-accent/70 hover:text-brand-accent"
              >
                <span className="font-semibold text-brand-accent">WA</span>
                WhatsApp
              </a>
            ) : null}
            {content.contact.githubUrl ? (
              <a
                href={content.contact.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="interactive"
                className="inline-flex items-center gap-2 rounded-full border border-brand-border px-4 py-2 text-xs uppercase tracking-[0.14em] text-brand-text transition hover:border-brand-accent/70 hover:text-brand-accent"
              >
                <span className="font-semibold text-brand-accent">GH</span>
                GitHub
              </a>
            ) : null}
            {content.contact.behanceUrl ? (
              <a
                href={content.contact.behanceUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="interactive"
                className="inline-flex items-center gap-2 rounded-full border border-brand-border px-4 py-2 text-xs uppercase tracking-[0.14em] text-brand-text transition hover:border-brand-accent/70 hover:text-brand-accent"
              >
                <span className="font-semibold text-brand-accent">BE</span>
                Behance
              </a>
            ) : null}
          </div>

          <a
            href={content.contact.projectCtaHref}
            onClick={(e) => handleNavClick(e, content.contact.projectCtaHref)}
            data-cursor="interactive"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-accent px-7 py-3.5 text-sm font-bold text-[#110C17] shadow-[0_0_30px_rgba(144,86,162,0.45)] transition hover:brightness-110 hover:scale-[1.02]"
          >
            {content.contact.projectCtaLabel}
            <span>→</span>
          </a>
        </section>
      </main>

      <footer className="mt-14 border-t border-brand-border px-4 py-10 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <p className="font-display text-xl">{content.footer.lineOne}</p>
          <p className="text-sm text-brand-muted">{content.footer.lineTwo}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-brand-accent">{content.footer.credit}</p>
        </div>
      </footer>
    </div>
  );
}
