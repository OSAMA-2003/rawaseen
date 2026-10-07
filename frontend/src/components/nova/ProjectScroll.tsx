"use client";

import { useEffect, useRef, useState } from "react";
import p1 from "@/assets/project-1.jpg";
import p2 from "@/assets/project-2.jpg";
import p3 from "@/assets/project-3.jpg";
import p4 from "@/assets/project-4.jpg";
import { isMobileViewport, prefersReducedMotion } from "@/lib/motion";
import { useLanguage } from "@/i18n/LanguageContext";

const getImgSrc = (img: any) => (typeof img === "string" ? img : img.src);
const IMAGES = [p1, p2, p3, p4];

interface Chapter {
  n: string;
  title: string;
  body: string;
}

export function ProjectScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const { t, isRTL } = useLanguage();

  const rawChapters =
    (t("projectScroll.chapters", { returnObjects: true }) as unknown as Chapter[]) || [
      {
        n: "01",
        title: "Vision",
        body: "Every development begins as a question about the city it will belong to.",
      },
      {
        n: "02",
        title: "Form",
        body: "Mass, shadow and proportion, calibrated against the light of the peninsula.",
      },
      {
        n: "03",
        title: "Space",
        body: "Interiors drawn around stillness — daylight, stone and generous volume.",
      },
      {
        n: "04",
        title: "Experience",
        body: "A place is finished only when people stop noticing the architecture.",
      },
    ];

  const chapters = rawChapters.map((c, i) => ({
    ...c,
    img: IMAGES[i] || p1,
  }));

  // --- GSAP SCROLLTRIGGER SETUP ---
  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track || prefersReducedMotion()) return;

    let gsapCtx: { revert: () => void } | undefined;
    let destroyed = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (destroyed || !containerRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      gsapCtx = gsap.context(() => {
        const isMobile = isMobileViewport();
        const direction = isRTL ? -1 : 1;
        const total = chapters.length;
        const segmentCount = total - 1; // number of transitions

        const imgs = imageRefs.current.filter(Boolean) as HTMLImageElement[];
        const texts = textRefs.current.filter(Boolean) as HTMLDivElement[];
        if (!imgs.length || !texts.length) return;

        // --- INITIAL STATES ---
        imgs.forEach((img, i) => {
          gsap.set(img, {
            autoAlpha: i === 0 ? 1 : 0,
            scale: i === 0 ? 1 : 1.08,
            xPercent: i === 0 ? 0 : 8 * direction,
            zIndex: i === 0 ? 2 : 1,
          });
        });

        texts.forEach((el, i) => {
          gsap.set(el, {
            autoAlpha: i === 0 ? 1 : 0,
            y: i === 0 ? 0 : 40,
            zIndex: i === 0 ? 2 : 1,
          });
        });

        // --- MASTER TIMELINE ---
        const master = gsap.timeline({
          defaults: { ease: "power3.inOut" },
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: "bottom bottom",
            pin: track,
            pinSpacing: false,
            scrub: isMobile ? 0.25 : 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const idx = Math.min(
                total - 1,
                Math.round(self.progress * segmentCount)
              );
              setActiveIndex((prev) => (prev === idx ? prev : idx));
            },
          },
        });

        // --- BUILD TRANSITIONS ---
        for (let i = 1; i < total; i++) {
          const prevImg = imgs[i - 1];
          const currImg = imgs[i];
          const prevTxt = texts[i - 1];
          const currTxt = texts[i];
          const label = `transition-${i}`;

          // Exit previous image
          master.to(
            prevImg,
            {
              autoAlpha: 0,
              scale: 1.05,
              xPercent: -8 * direction,
              duration: 0.5,
            },
            label
          );

          // Exit previous text
          master.to(
            prevTxt,
            {
              autoAlpha: 0,
              y: -30,
              duration: 0.4,
            },
            label
          );

          // Enter current image
          master.fromTo(
            currImg,
            {
              autoAlpha: 0,
              scale: 1.08,
              xPercent: 8 * direction,
            },
            {
              autoAlpha: 1,
              scale: 1,
              xPercent: 0,
              duration: 0.6,
            },
            `${label}+=0.2`
          );

          // Enter current text
          master.fromTo(
            currTxt,
            {
              autoAlpha: 0,
              y: 45,
            },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.55,
            },
            `${label}+=0.25`
          );

          // Add spacing before next transition
          master.to({}, { duration: 0.15 }, `${label}+=0.8`);
        }
      }, containerRef);
    })();

    return () => {
      destroyed = true;
      gsapCtx?.revert();
    };
  }, [chapters.length, isRTL]);

  // --- CLICK TO NAVIGATE ---
  const goToChapter = (index: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY + rect.top;
    const scrollableHeight = container.offsetHeight - window.innerHeight;
    const target =
      scrollTop + (index / (chapters.length - 1)) * scrollableHeight;

    window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <section
      ref={containerRef}
      id="projects-scroll"
      className="relative"
      style={{
        height: `${(chapters.length - 1) * 55 + 100}vh`,
      }}
    >
      <div
        ref={trackRef}
        className="sticky top-0 h-[100svh] w-full overflow-hidden bg-[#f4f0e8]"
      >
        <div className="mx-auto grid h-full w-full max-w-[1680px] grid-cols-1 gap-4 px-5 pt-14 pb-20 md:grid-cols-12 md:gap-0 md:px-10 md:py-0">
          {/* ============ IMAGE PANEL ============ */}
          <div className="relative col-span-1 h-[40svh] w-full self-center overflow-hidden rounded-xl shadow-sm md:col-span-7 md:h-[68svh] md:rounded-none md:shadow-none mt-10">
            {chapters.map((c, i) => (
              <img
                key={c.n}
                ref={(el) => {
                  imageRefs.current[i] = el;
                }}
                src={getImgSrc(c.img)}
                alt={`${c.title} — Rawasin architecture`}
                width={1280}
                height={1600}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover will-change-transform"
              />
            ))}

            {/* Grid overlay */}
            <div
              className="pointer-events-none absolute inset-0 z-20"
              aria-hidden
            >
              <div className="absolute left-1/3 top-0 h-full w-px bg-white/20" />
              <div className="absolute left-2/3 top-0 h-full w-px bg-white/20" />
              <div className="absolute inset-0 bg-black/[0.03]" />
            </div>

            {/* Counter badge */}
            <div className="absolute bottom-3 left-3 z-30 rounded bg-black/40 px-2.5 py-1 backdrop-blur-md font-mono text-[10px] tracking-[0.25em] text-white md:bottom-6 md:left-6 md:bg-transparent md:p-0 md:text-white/80 md:backdrop-blur-none">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(chapters.length).padStart(2, "0")}
            </div>
          </div>

          {/* ============ TEXT PANEL ============ */}
          <div
            className={`relative col-span-1 flex h-[35svh] items-center md:col-span-5 md:h-auto ${
              isRTL ? "md:pr-16" : "md:pl-16"
            }`}
          >
            <div className="relative h-full w-full">
              {chapters.map((c, i) => (
                <div
                  key={c.n}
                  ref={(el) => {
                    textRefs.current[i] = el;
                  }}
                  className="absolute inset-x-0 top-1/2 -translate-y-1/2 will-change-transform"
                >
                  <div className="mb-2 flex items-center gap-3 md:mb-4 md:gap-4">
                    <span className="font-mono text-[0.7rem] tracking-[0.2em] text-[#9e825e]">
                      {c.n}
                    </span>
                    <span className="h-px w-8 bg-[#182220]/20" />
                  </div>

                  <h3 className="max-w-[700px] text-[8vw] font-medium leading-[1.05] tracking-[-0.03em] text-[#182220] sm:text-[6vw] md:text-[3.8vw] lg:text-[3.4vw]">
                    {c.title}
                  </h3>

                  <p className="mt-3 max-w-[38ch] text-xs leading-relaxed text-[#50605c] sm:text-sm md:mt-5 md:text-base md:leading-7">
                    {c.body}
                  </p>

                  <div className="mt-4 text-[9px] uppercase tracking-[0.25em] text-[#182220]/40 md:mt-7">
                    Rawasin Development
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============ PROGRESS BAR ============ */}
        <div className="absolute bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-black/5 bg-white/60 px-4 py-1.5 shadow-xs backdrop-blur-md md:bottom-6 md:border-none md:bg-transparent md:shadow-none md:backdrop-blur-none">
          {chapters.map((c, i) => (
            <button
              key={c.n}
              onClick={() => goToChapter(i)}
              title={`Go to ${c.title}`}
              aria-label={`Go to chapter ${c.n}: ${c.title}`}
              className="group relative cursor-pointer py-1.5 focus:outline-none"
            >
              <div className="h-[3px] w-7 overflow-hidden rounded-full bg-[#182220]/15 transition-all duration-300 group-hover:bg-[#182220]/30 md:w-10">
                <div
                  className="h-full origin-left bg-[#182220] transition-transform duration-500 ease-out"
                  style={{
                    transform:
                      activeIndex === i ? "scaleX(1)" : "scaleX(0)",
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}