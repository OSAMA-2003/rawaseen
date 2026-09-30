"use client";

import React, { useEffect, useRef } from "react";
import { ArrowDown, ArrowUpLeft } from "lucide-react";
import { prefersReducedMotion } from "@/lib/motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { scrollToTarget } from "@/lib/useSmoothScroll";
import Link from "next/link";

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const buildingRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  const { t, language, isRTL } = useLanguage();

  const isArabic = language === "ar";

  useEffect(() => {
    const root = rootRef.current;

    if (!root || prefersReducedMotion()) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled || !rootRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        // -----------------------------------------
        // INITIAL STATES
        // -----------------------------------------

        gsap.set(contentRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
        });

        gsap.set(buildingRef.current, {
          yPercent: 45,
          scale: 0.96,
        });

        gsap.set(imageRef.current, {
          scale: 1,
        });

        gsap.set(metaRef.current, {
          opacity: 1,
          y: 0,
        });

        gsap.set(backgroundRef.current, {
          scale: 1,
          y: 0,
        });

        // -----------------------------------------
        // ENTRANCE
        // -----------------------------------------

        const intro = gsap.timeline({
          defaults: {
            ease: "power3.out",
          },
        });

        intro.fromTo(
          contentRef.current,
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            delay: 0.1,
          }
        );

        intro.fromTo(
          metaRef.current,
          {
            opacity: 0,
            y: 15,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
          },
          "-=0.75"
        );

        // -----------------------------------------
        // CINEMATIC SCROLL — Seamless & Harmonic
        // -----------------------------------------

        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: "+=140%",
            pin: true,
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        });

        // Background — very gentle, organic perspective shift
        scrollTl.fromTo(
          backgroundRef.current,
          {
            scale: 1,
            yPercent: 0,
          },
          {
            scale: 1.06,
            yPercent: 3,
            duration: 1.0,
            ease: "none",
          },
          0
        );

        // Text — moves gently upward and ALWAYS stays 100% visible (never hides when scrolling up or down)
        scrollTl.fromTo(
          contentRef.current,
          {
            y: 0,
            scale: 1,
            opacity: 1,
          },
          {
            y: -50,
            scale: 0.965,
            opacity: 1,
            duration: 0.7,
            ease: "power1.out",
          },
          0
        );

        // Building — continuous, non-overlapping keyframes (zero jitter)
        scrollTl.to(
          buildingRef.current,
          {
            keyframes: [
              {
                yPercent: 15,
                scale: 0.985,
                duration: 0.38,
                ease: "power1.out",
              },
              {
                yPercent: -3,
                scale: 1,
                duration: 0.34,
                ease: "sine.inOut",
              },
              {
                yPercent: -11,
                scale: 1.025,
                duration: 0.28,
                ease: "sine.inOut",
              },
            ],
            ease: "none",
          },
          0.03
        );

        // Subtle building image perspective zoom
        scrollTl.fromTo(
          imageRef.current,
          {
            scale: 1,
          },
          {
            scale: 1.045,
            duration: 1.0,
            ease: "none",
          },
          0
        );

        // Bottom information stays softly visible (never hides on scroll up)
        scrollTl.fromTo(
          metaRef.current,
          {
            y: 0,
            opacity: 1,
          },
          {
            y: -18,
            opacity: 0.7,
            duration: 0.6,
            ease: "power1.out",
          },
          0
        );
      }, rootRef);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [language]);

  const scrollToProjects = (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();
    scrollToTarget("#projects", {
      duration: 1.4,
      offset: 0,
    });
  };

  return (
    <section
      ref={rootRef}
      id="top"
      className="relative h-screen min-h-[680px] w-full overflow-hidden bg-[#eff3f5] select-none"
    >
      {/* BACKGROUND */}
      <div
        ref={backgroundRef}
        className="absolute inset-[-4%] z-0 will-change-transform overflow-hidden"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/etqan-sky.jpg"
          className="h-full w-full object-cover object-center pointer-events-none"
        >
          <source src="/hero-vid.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-white/10" />

        <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/45 via-white/15 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-[#f8f6f2] via-[#f8f6f2]/40 to-transparent" />
      </div>

      {/* HERO CONTENT */}
      <div
        ref={contentRef}
        className="absolute inset-x-0 top-0 z-30 mx-auto flex h-full w-full max-w-[1500px] flex-col items-center px-6 pt-[11vh] text-center will-change-transform sm:px-10 md:pt-[13vh]"
      >
        {/* Brand Logo at Top of Hero */}
        <div className="mt-10 mb-4 sm:mb-5 flex items-center justify-center">
          <img
            src="/logo-black.png"
            alt="Rawasin"
            className="h-42 w-auto object-contain transition-transform duration-300 hover:scale-105"
            loading="eager"
            fetchPriority="high"
          />
        </div>

        {/* Eyebrow */}
        <div className="mb-4 sm:mb-5 flex items-center gap-3 text-[9px] uppercase tracking-[0.32em] text-[#556763] sm:text-[10px]">
          <span className="h-px w-7 bg-[#556763]/30" />

          <span>
            {isArabic
              ? "مساحات تستحق أن تُعاش"
              : "Spaces Worth Living"}
          </span>

          <span className="h-px w-7 bg-[#556763]/30" />
        </div>

        {/* Heading */}
        {/* <h1 className="max-w-5xl font-amiri text-[clamp(2.8rem,6.5vw,6.8rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-[#182422]">
          {isArabic ? (
            <>
              اكتشف
              <br />
              <span className="text-[#9e7f59]">
                مساحتك القادمة
              </span>
            </>
          ) : (
            <>
              Discover
              <br />
              <span className="text-[#9e7f59]">
                Your Next Space
              </span>
            </>
          )}
        </h1> */}

        {/* Description */}
        <p className="mt-6 max-w-xl text-[13px] leading-8 text-[#4a5854] sm:text-base md:text-lg">
          {isArabic
            ? "مشاريع عقارية مختارة بعناية، ووحدات تناسب احتياجاتك، وتجربة أبسط للوصول إلى المكان المناسب."
            : "Discover carefully selected developments and properties designed around the way you want to live."}
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/projects"
            className="group inline-flex items-center gap-4 rounded-full bg-[#182422] px-7 py-4 text-xs font-semibold tracking-wide text-[#f8f6f2] shadow-md shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#253633] hover:shadow-lg active:scale-[0.98] sm:px-8"
          >
            <span>
              {t("hero.exploreBtn") ||
                (isArabic
                  ? "استكشف المشاريع"
                  : "Explore Projects")}
            </span>

            <ArrowDown
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1"
              strokeWidth={1.5}
            />
          </Link>

          <Link
            href="/units"
            className="group inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-xs font-medium text-[#2d3e3a] bg-white/50 hover:bg-white/90 backdrop-blur-md border border-[#182422]/10 transition-all duration-300 hover:border-[#182422]/20 shadow-xs"
          >
            <span>
              {isArabic
                ? "تصفح الوحدات"
                : "Browse Properties"}
            </span>

            <ArrowUpLeft
              className={`h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 ${isRTL ? "-rotate-90" : ""
                }`}
              strokeWidth={1.5}
            />
          </Link>
        </div>
      </div>

      {/* BUILDING */}
      <div
        ref={buildingRef}
        className="absolute inset-x-0 bottom-[-10%] z-20 mx-auto flex w-full justify-center will-change-transform transform-gpu"
        style={{
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
        }}
      >
        <div className="relative w-[112%] max-w-[1500px] sm:w-[105%] lg:w-[96%]">
          <img
            ref={imageRef}
            src="/hero-building.png"
            alt={
              isArabic
                ? "مشروع عقاري"
                : "Featured real estate development"
            }
            className="block h-auto w-full origin-center object-contain drop-shadow-[0_-25px_70px_rgba(0,0,0,0.16)]"
            loading="eager"
            fetchPriority="high"
            style={{
              transform: "translate3d(0, 0, 0)",
              backfaceVisibility: "hidden",
            }}
          />

          {/* Ground fade — gentle mist merging with the page */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[35%] bg-gradient-to-t from-[#f8f6f2] via-[#f8f6f2]/40 to-transparent" />

          {/* Soft atmospheric light */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </div>

      {/* BOTTOM META */}
      <div
        ref={metaRef}
        className="absolute bottom-7 left-0 right-0 z-40 mx-auto flex max-w-[1500px] items-end justify-between px-6 text-[9px] uppercase tracking-[0.22em] text-[#485652]/75 will-change-transform sm:px-10"
      >
        <div className="hidden sm:block">
          <span className="mb-1 block">
            {isArabic
              ? "اكتشف ما يناسبك"
              : "Find What Fits You"}
          </span>

          <span className="text-[#485652]/45">
            01 / 03
          </span>
        </div>

        <div className="text-right">
          <span className="mb-1 block">
            {isArabic
              ? "عقارات مختارة"
              : "Selected Properties"}
          </span>

          <span className="text-[#485652]/45">
            {isArabic
              ? "مشاريع • وحدات • مساحات"
              : "Projects • Units • Spaces"}
          </span>
        </div>
      </div>

      {/* BOTTOM TRANSITION */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 h-28 bg-gradient-to-t from-[#f8f6f2] to-transparent" />
    </section>
  );
}