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

  const lenisRef = useRef<Lenis | null>(null);
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

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      gestureOrientation: "vertical",
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

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

      {/* Editorial architectural background with royal purple & plum ambience */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[#110C17]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_50%_-15%,rgba(144,86,162,0.22),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_90%_100%,rgba(49,18,46,0.5),transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(144,86,162,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(144,86,162,0.06) 1px, transparent 1px)",
            backgroundSize: "68px 68px",
            maskImage: "radial-gradient(ellipse at 50% 35%, black 45%, transparent 80%)",
          }}
        />
        <motion.div
          className="absolute left-[8%] top-[15%] h-80 w-80 rounded-full bg-[#9056A2]/15 blur-[120px]"
          style={{ x: orbAX, y: orbAY }}
        />
        <motion.div
          className="absolute right-[10%] top-[25%] h-96 w-96 rounded-full bg-[#31122E]/80 blur-[130px]"
          style={{ x: orbBX, y: orbBY }}
        />
      </div>

      {/* Floating navigation header */}
      <header className="fixed left-1/2 top-5 z-50 w-[min(900px,92vw)] -translate-x-1/2">
        <div className="relative rounded-full border border-[#9056A2]/25 bg-[#110C17]/80 px-5 py-2.5 backdrop-blur-xl shadow-[0_12px_40px_rgba(17,12,23,0.9)]">
          <div className="flex items-center justify-between gap-4">
            <a
              href="#hero"
              onClick={(e) => handleNavClick(e, "#hero")}
              className="text-left transition hover:opacity-85"
            >
              <p className="font-display text-sm font-semibold tracking-wide text-brand-text">
                {content.brand.name}
              </p>
            </a>

            <button
              type="button"
              aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileNavOpen}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#9056A2]/30 bg-[#31122E]/50 text-brand-text transition hover:border-brand-accent/60 md:hidden"
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

            <nav className="hidden items-center gap-6 md:flex">
              {content.navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="text-xs font-medium text-[#A89CB2] transition hover:text-[#FFFBFC]"
                >
                  {item.label}
                </a>
              ))}
            </nav>
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
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#c084fc] font-semibold font-mono">
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
                    className="rounded-xl px-4 py-3 font-display text-lg text-white transition hover:bg-white/5 hover:text-[#c084fc]"
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

      <main className="w-full px-4 pb-20 pt-28 sm:pt-36 md:px-8 lg:px-12 max-w-7xl mx-auto">
        {/* HERO SECTION - THE STORY EVOLUTION (ORIGIN ➔ PRESENT) */}
        <section
          id="hero"
          className="relative min-h-[calc(100vh-8rem)] flex flex-col justify-center pb-12 pt-4 lg:pt-8"
        >
          {/* Subtle Grid Crosshairs & Architectural Watermark (Ref 1 & Ref 3) */}
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
            <span className="font-display text-[14vw] font-black uppercase tracking-tighter text-[#9056A2]/[0.05] select-none whitespace-nowrap">
              BUILTBY_SH
            </span>
          </div>

          {/* Top Story Meta Bar (Reference 1 & 3: Location, Live Clock, Availability, Year) */}
          <div className="reveal-up mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#9056A2]/15 pb-4 text-xs">
            <div className="flex items-center gap-3">
              {/* Availability Beacon */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-[11px] text-emerald-300 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="font-medium tracking-wide">Available for Work</span>
              </div>

              {/* Story Journey Tag */}
              <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#9056A2]/25 bg-[#31122E]/40 px-3 py-1 text-[11px] text-[#FFFBFC]">
                <span className="text-[#c084fc] font-semibold font-mono">The Story:</span>
                <span className="text-zinc-300">Design ➔ Code Evolution</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[#A89CB2] font-mono text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#9056A2]" />
                <span>{content.contact.location || "India"}</span>
              </div>
              {currentTime ? (
                <div className="border-l border-[#9056A2]/20 pl-4">
                  <span className="text-[#FFFBFC] font-medium">{currentTime}</span>
                </div>
              ) : null}
              <div className="hidden md:block border-l border-[#9056A2]/20 pl-4 text-zinc-500">
                ©2026 / SHARUKH H.
              </div>
            </div>
          </div>

          {/* Main Hero Grid: Left Narrative + Right Interactive Story Stage */}
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            {/* Left Column: Bold Typography & Story Evolution */}
            <div className="reveal-up space-y-6">
              {/* Origin Badge */}
              <div className="inline-flex items-center gap-2 rounded-lg border border-[#9056A2]/30 bg-[#31122E]/60 px-3.5 py-1.5 text-xs text-[#FFFBFC] backdrop-blur-md">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#c084fc] font-semibold">
                  Creative Evolution
                </span>
                <span className="text-[#9056A2]">/</span>
                <span className="text-zinc-300">From Visual Craft to Living Code</span>
              </div>

              {/* Giant Poster-Grade Typography (Ref 1 & 3) */}
              <div className="space-y-3">
                <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-[#FFFBFC] leading-[0.92]">
                  {content.hero.displayName}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-lg sm:text-xl md:text-2xl font-display font-medium text-zinc-300">
                  <span className="text-[#c084fc] font-semibold">{content.hero.rolePrimary}</span>
                  <span className="text-[#9056A2]">➔</span>
                  <span className="text-white font-semibold">{content.hero.roleSecondary}</span>
                </div>
              </div>

              {/* The Narrative: "What I was and what I am today" */}
              <p className="max-w-[48ch] text-base sm:text-lg text-[#A89CB2] leading-relaxed">
                {content.hero.subheadline || "Designing visuals that connect. Developing experiences that perform."}
              </p>

              {/* Story Bridge Strip: The Dual Superpower */}
              <div className="grid grid-cols-2 gap-3 max-w-lg rounded-2xl border border-[#9056A2]/20 bg-[#31122E]/30 p-3.5 backdrop-blur-md">
                <div className="space-y-1 border-r border-[#9056A2]/20 pr-3">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#c084fc] font-semibold">
                    01 • Visual Heritage
                  </p>
                  <p className="text-xs text-zinc-300 leading-snug">
                    Brand systems, poster composition, typography & aesthetic hierarchy.
                  </p>
                </div>
                <div className="space-y-1 pl-1">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#c084fc] font-semibold">
                    02 • Technical Craft
                  </p>
                  <p className="text-xs text-zinc-300 leading-snug">
                    Next.js, React, TypeScript, fluid GSAP motion & high-performance UI.
                  </p>
                </div>
              </div>

              {/* Action Buttons (Ref 1 & 3) */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={content.hero.primaryCtaHref}
                  onClick={(e) => handleNavClick(e, content.hero.primaryCtaHref)}
                  data-cursor="interactive"
                  className="inline-flex items-center gap-2.5 rounded-full bg-gradient-accent px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-[#110C17] shadow-[0_0_28px_rgba(144,86,162,0.45)] transition hover:brightness-110 hover:scale-[1.02]"
                >
                  <span>{content.hero.primaryCtaLabel || "Explore Works"}</span>
                  <span className="text-sm">→</span>
                </a>

                <a
                  href="#contact"
                  onClick={(e) => handleNavClick(e, "#contact")}
                  data-cursor="interactive"
                  className="inline-flex items-center gap-2 rounded-full border border-[#9056A2]/30 bg-[#31122E]/50 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#FFFBFC] backdrop-blur-md transition hover:bg-[#9056A2]/20 hover:border-[#9056A2]/60"
                >
                  <span>Start a Project ↗</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  data-cursor="interactive"
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-xs text-[#A89CB2] transition hover:text-[#FFFBFC]"
                  title="Copy email to clipboard"
                >
                  <span className="text-sm">✉</span>
                  <span>{copiedEmail ? "Copied!" : "Copy Email"}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Creative Minimalist Kinetic Engine (Interactive & Animated) */}
            <div className="relative mx-auto flex w-full max-w-[480px] items-center justify-center py-6 lg:py-0">
              <motion.div
                ref={cardRef}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                style={
                  enableInteractiveMotion
                    ? {
                        rotateX: smoothTiltX,
                        rotateY: smoothTiltY,
                        transformStyle: "preserve-3d",
                      }
                    : undefined
                }
                className="relative flex aspect-square w-full max-w-[420px] items-center justify-center select-none"
              >
                {/* Soft Ambient Orchid & Plum Aura */}
                <div className="pointer-events-none absolute inset-4 rounded-full bg-gradient-to-tr from-[#31122E]/80 via-[#9056A2]/25 to-transparent blur-[80px]" />

                {/* Outer Concentric Orbit - Rotating Clockwise */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-dashed border-[#9056A2]/30"
                >
                  {/* Orbiting Satellite Dot */}
                  <span className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#9056A2] shadow-[0_0_12px_#9056A2]" />
                </motion.div>

                {/* Middle Kinetic Ring - Rotating Counter-Clockwise */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-9 rounded-full border border-[#c084fc]/25"
                  style={{
                    borderStyle: "dashed",
                    strokeDasharray: "8 12",
                  }}
                >
                  {/* Orbiting Secondary Satellite Dot */}
                  <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#c084fc] shadow-[0_0_10px_#c084fc]" />
                </motion.div>

                {/* Inner Architectural Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-20 rounded-full border border-dotted border-[#9056A2]/35"
                />

                {/* Center Core: Glowing Creative Engine Emblem */}
                <motion.div
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 flex h-32 w-32 flex-col items-center justify-center rounded-full border border-[#9056A2]/45 bg-[#1C1326]/90 shadow-[0_0_50px_rgba(144,86,162,0.45)] backdrop-blur-2xl"
                >
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#c084fc] font-semibold">
                    CREATIVE
                  </span>
                  <span className="font-display text-3xl font-black tracking-tight text-white">
                    SH
                  </span>
                  <div className="mt-1 flex items-center gap-1.5 rounded-full bg-emerald-950/60 px-2 py-0.5 border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-[8px] text-emerald-300 uppercase tracking-widest">
                      ACTIVE
                    </span>
                  </div>
                </motion.div>

                {/* Floating Magnetic Story Badges (Minimal, Kinetic, Interactive) */}
                {/* Badge 1: Top Right - Visual Systems */}
                <motion.div
                  animate={{ y: [0, -9, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{ scale: 1.08 }}
                  className="absolute -top-3 right-2 z-20 cursor-default rounded-xl border border-[#9056A2]/30 bg-[#31122E]/80 px-3.5 py-2 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all hover:border-[#9056A2] hover:shadow-[0_0_20px_rgba(144,86,162,0.4)]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[#c084fc] text-xs">✦</span>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-[#A89CB2]">
                        Origin
                      </p>
                      <p className="font-display text-xs font-semibold text-white">
                        Visual Systems
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Badge 2: Bottom Left - Modern Frontend */}
                <motion.div
                  animate={{ y: [0, 9, 0] }}
                  transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                  whileHover={{ scale: 1.08 }}
                  className="absolute -bottom-3 left-2 z-20 cursor-default rounded-xl border border-[#9056A2]/30 bg-[#1C1326]/90 px-3.5 py-2 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all hover:border-[#9056A2] hover:shadow-[0_0_20px_rgba(144,86,162,0.4)]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 text-xs">⚡</span>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-[#A89CB2]">
                        Code Craft
                      </p>
                      <p className="font-display text-xs font-semibold text-white">
                        Next.js 16 & React
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Badge 3: Top Left - Fluid Motion */}
                <motion.div
                  animate={{ x: [0, -8, 0] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                  whileHover={{ scale: 1.08 }}
                  className="absolute top-1/4 -left-6 z-20 cursor-default rounded-xl border border-[#9056A2]/30 bg-[#31122E]/80 px-3 py-1.5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all hover:border-[#9056A2] hover:shadow-[0_0_20px_rgba(144,86,162,0.4)]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#c084fc] text-xs">✹</span>
                    <span className="font-mono text-[11px] font-medium text-white">GSAP Motion</span>
                  </div>
                </motion.div>

                {/* Badge 4: Bottom Right - Creative Direction */}
                <motion.div
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
                  whileHover={{ scale: 1.08 }}
                  className="absolute bottom-1/4 -right-6 z-20 cursor-default rounded-xl border border-[#9056A2]/30 bg-[#1C1326]/90 px-3 py-1.5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all hover:border-[#9056A2] hover:shadow-[0_0_20px_rgba(144,86,162,0.4)]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#c084fc] text-xs">★</span>
                    <span className="font-mono text-[11px] font-medium text-white">Pixel Precision</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Core Disciplines Strip (Ref 1: Matteo Backer Services List) */}
          <div className="reveal-up mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 border-t border-[#9056A2]/15 pt-8">
            {[
              {
                num: "01",
                label: "Frontend Engineering",
                desc: "High-performance web applications built with Next.js, React, and TypeScript.",
              },
              {
                num: "02",
                label: "Visual Design & Identity",
                desc: "Impactful brand systems, art direction, and poster-level typography.",
              },
              {
                num: "03",
                label: "Motion & Micro-interactions",
                desc: "Fluid animation storytelling powered by GSAP, Lenis, and Framer Motion.",
              },
              {
                num: "04",
                label: "UI/UX & Design Systems",
                desc: "User-centered design components with pixel-perfect responsive layouts.",
              },
            ].map((discipline) => (
              <div
                key={discipline.num}
                className="group rounded-2xl border border-[#9056A2]/15 bg-[#31122E]/20 p-4 transition hover:border-[#9056A2]/40 hover:bg-[#31122E]/40"
              >
                <span className="font-mono text-xs font-semibold text-[#c084fc]">
                  {discipline.num} /
                </span>
                <h3 className="mt-1 font-display text-base font-semibold text-white">
                  {discipline.label}
                </h3>
                <p className="mt-1 text-xs text-[#A89CB2] leading-relaxed">
                  {discipline.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ABOUT SECTION */}
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

        {/* EXPERIENCE SECTION */}
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
                  className="relative rounded-2xl border border-brand-border bg-brand-bg-secondary/70 p-5"
                >
                  <motion.span
                    className="absolute -left-[2.35rem] top-8 h-3 w-3 rounded-full bg-brand-accent md:-left-[2.85rem]"
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
                    <span>→</span>
                  </button>
                </motion.article>
              ))}
            </div>
          </div>
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
