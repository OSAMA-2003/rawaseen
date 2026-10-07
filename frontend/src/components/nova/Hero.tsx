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

      const isMobile = window.matchMedia(
        "(max-width: 768px)"
      ).matches;

      ctx = gsap.context(() => {
        /*
         * INITIAL STATES
         */

        gsap.set(contentRef.current, {
          autoAlpha: 1,
          opacity: 1,
          y: 0,
          scale: 1,
        });

        gsap.set(buildingRef.current, {
          yPercent: isMobile ? 40 : 46,
          scale: isMobile ? 0.98 : 0.96,
        });

        gsap.set(imageRef.current, {
          scale: 1,
        });

        gsap.set(metaRef.current, {
          autoAlpha: 1,
          opacity: 1,
          y: 0,
        });

        gsap.set(backgroundRef.current, {
          scale: 1,
          y: 0,
        });

        /*
         * LIGHT INTRO
         */

        const intro = gsap.timeline({
          defaults: {
            ease: "power3.out",
          },
        });

        intro.fromTo(
          "[data-hero-reveal]",
          {
            autoAlpha: 0,
            y: 28,
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.1,
            delay: 0.05,
            clearProps: "opacity,visibility,transform",
          }
        );

        intro.fromTo(
          metaRef.current,
          {
            autoAlpha: 0,
            y: 10,
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            clearProps: "opacity,visibility",
          },
          "-=0.4"
        );

        /*
         * SMOOTH SCROLL
         */

        /*
        * SMOOTH SCROLL
        *
        * Shorter scroll distance + faster scrub
        * = smoother and more responsive movement.
        */

        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",

            // Shorter distance so the animation finishes faster.
            end: isMobile ? "+=55%" : "+=65%",

            pin: true,

            // Lower value = follows the user's scroll more directly.
            scrub: isMobile ? 0.1 : 0.15,

            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        /*
         * BACKGROUND
         */

        scrollTl.to(
          backgroundRef.current,
          {
            scale: isMobile ? 1.018 : 1.025,
            yPercent: isMobile ? 0.5 : 1,
            duration: 1,
            ease: "none",
          },
          0
        );

        /*
         * CONTENT
         *
         * Very subtle movement.
         * No opacity so the text never disappears.
         */

        scrollTl.to(
          contentRef.current,
          {
            y: isMobile ? -8 : -18,
            scale: isMobile ? 0.995 : 0.985,
            duration: 1,
            ease: "none",
          },
          0
        );

        /*
         * BUILDING
         *
         * Smaller movement than before.
         * This makes the building feel premium instead of
         * looking like it's being pulled upward.
         */

        scrollTl.to(
          buildingRef.current,
          {
            yPercent: isMobile ? 12 : 8,
            scale: isMobile ? 1.008 : 1.015,
            duration: 1,
            ease: "none",
          },
          0
        );

        /*
         * BUILDING IMAGE
         */

        scrollTl.to(
          imageRef.current,
          {
            scale: isMobile ? 1.01 : 1.02,
            duration: 1,
            ease: "none",
          },
          0
        );

        /*
         * BOTTOM META
         */

        scrollTl.to(
          metaRef.current,
          {
            y: isMobile ? -5 : -10,
            opacity: 0.92,
            duration: 1,
            ease: "none",
          },
          0
        );

        /*
         * BOTTOM META
         *
         * تظل ظاهرة ولا تختفي.
         */

        scrollTl.to(
          metaRef.current,
          {
            y: isMobile ? -8 : -14,
            opacity: 0.9,
            duration: 0.7,
            ease: "none",
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
      duration: 1,
      offset: 0,
    });
  };

  return (
    <section
      ref={rootRef}
      id="top"
      className="
        relative h-screen min-h-screen w-full
        overflow-hidden bg-[#eff3f5] select-none
      "
    >
      {/* BACKGROUND */}
      <div
        ref={backgroundRef}
        className="
          absolute inset-[-4%] z-0
          overflow-hidden
          will-change-transform
          transform-gpu
        "
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/etqan-sky.jpg"
          className="
            pointer-events-none
            h-full w-full
            object-cover object-center
          "
        >
          <source src="/hero-vid.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-white/10" />

        <div
          className="
            absolute inset-x-0 top-0 h-[45%]
            bg-gradient-to-b
            from-white/45
            via-white/15
            to-transparent
          "
        />

        <div
          className="
            absolute inset-x-0 bottom-0 h-[65%]
            bg-gradient-to-t
            from-[#f8f6f2]
            via-[#f8f6f2]/40
            to-transparent
          "
        />
      </div>

      {/* HERO CONTENT */}
      <div
        ref={contentRef}
        className="
          absolute inset-x-0 top-0 z-30 mx-auto
          flex h-full w-full max-w-[1500px]
          flex-col items-center
          px-6 pt-[9vh]
          text-center
          will-change-transform
          transform-gpu
          sm:px-10 sm:pt-[11vh]
          md:pt-[13vh]
        "
      >
        {/* LOGO */}
        <div
          data-hero-reveal
          className="
            mt-8 mb-4
            flex items-center justify-center
            sm:mt-10 sm:mb-5
          "
        >
          <img
            src="/logo-black.png"
            alt="Rawasin"
            className="
              h-32 w-auto object-contain
              transition-transform duration-300
              hover:scale-105
              sm:h-36
              lg:h-42
            "
            loading="eager"
            fetchPriority="high"
          />
        </div>

        {/* EYEBROW */}
        <div
          data-hero-reveal
          className="
            mb-4 flex items-center gap-3
            text-[9px] uppercase
            tracking-[0.28em]
            text-[#556763]
            sm:mb-5
            sm:text-[10px]
            sm:tracking-[0.32em]
          "
        >
          <span className="h-px w-6 bg-[#556763]/30 sm:w-7" />

          <span>
            {isArabic
              ? "مساحات تستحق أن تُعاش"
              : "Spaces Worth Living"}
          </span>

          <span className="h-px w-6 bg-[#556763]/30 sm:w-7" />
        </div>

        {/* DESCRIPTION */}
        <p
          data-hero-reveal
          className="
            mt-4 max-w-[340px]
            text-[12px] leading-7
            text-[#4a5854]
            sm:mt-6 sm:max-w-xl
            sm:text-base sm:leading-8
            md:text-lg
          "
        >
          {isArabic
            ? "مشاريع عقارية مختارة بعناية، ووحدات تناسب احتياجاتك، وتجربة أبسط للوصول إلى المكان المناسب."
            : "Discover carefully selected developments and properties designed around the way you want to live."}
        </p>

        {/* BUTTONS */}
        <div
          data-hero-reveal
          className="
            mt-6 flex flex-col
            items-center gap-3
            sm:mt-8 sm:flex-row sm:gap-4
          "
        >
          <Link
            href="/projects"
            className="
              group inline-flex items-center gap-4
              rounded-full
              bg-[#182422]
              px-6 py-3.5
              text-xs font-semibold
              tracking-wide
              text-[#f8f6f2]
              shadow-md shadow-black/10
              transition-all duration-300
              hover:-translate-y-0.5
              hover:bg-[#253633]
              hover:shadow-lg
              active:scale-[0.98]
              sm:px-8 sm:py-4
            "
          >
            <span>
              {t("hero.exploreBtn") ||
                (isArabic
                  ? "استكشف المشاريع"
                  : "Explore Projects")}
            </span>

            <ArrowDown
              className="
                h-4 w-4
                transition-transform duration-300
                group-hover:translate-y-1
              "
              strokeWidth={1.5}
            />
          </Link>

          <Link
            href="/units"
            className="
              group inline-flex items-center gap-2
              rounded-full
              border border-[#182422]/10
              bg-white/50
              px-5 py-3.5
              text-xs font-medium
              text-[#2d3e3a]
              shadow-xs
              backdrop-blur-md
              transition-all duration-300
              hover:border-[#182422]/20
              hover:bg-white/90
            "
          >
            <span>
              {isArabic
                ? "تصفح الوحدات"
                : "Browse Properties"}
            </span>

            <ArrowUpLeft
              className={`
                h-3.5 w-3.5
                transition-transform duration-300
                group-hover:-translate-y-0.5
                ${isRTL ? "-rotate-90" : ""}
              `}
              strokeWidth={1.5}
            />
          </Link>
        </div>
      </div>

      {/* BUILDING */}
      <div
        ref={buildingRef}
        className="
          absolute inset-x-0 bottom-[10%] z-20 mx-auto
          flex w-full justify-center
          
        
         
          lg:bottom-[-10%]
        "
        style={{
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
        }}
      >
        <div
          className="
            relative w-[106%] max-w-[1500px]
            sm:w-[103%]
            lg:w-[96%]
          "
        >
          <img
            ref={imageRef}
            src="/hero-building.avif"
            alt={
              isArabic
                ? "مشروع عقاري"
                : "Featured real estate development"
            }
            className="
              block h-auto w-full
              origin-center object-contain
            

            "
            loading="eager"
            fetchPriority="high"
            style={{
              transform: "translate3d(0, 0, 0)",
              backfaceVisibility: "hidden",
            }}
          />

          {/* GROUND FADE */}
          <div
            className="
              pointer-events-none
              absolute inset-x-0 bottom-0
              z-20 h-[35%]
              bg-gradient-to-t
              from-[#f8f6f2]
              via-[#f8f6f2]/40
              to-transparent
            "
          />

          {/* ATMOSPHERIC LIGHT */}
          <div
            className="
              pointer-events-none
              absolute inset-x-0 top-0
              z-20 h-28
              bg-gradient-to-b
              from-white/20
              to-transparent
            "
          />
        </div>
      </div>





    </section>
  );
}
