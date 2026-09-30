"use client";

import { useEffect, useRef } from "react";
import horizon from "@/assets/horizon.jpg";
import { prefersReducedMotion } from "@/lib/motion";
import { useLanguage } from "@/i18n/LanguageContext";

const horizonSrc = typeof horizon === "string" ? horizon : horizon.src;

/**
 * Technical elevation drawing. Kept to a small number of paths so the draw
 * animation is stroke-based rather than thousands of DOM nodes.
 */
export function BlueprintSection() {
  const root = useRef<HTMLElement>(null);
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    let io: IntersectionObserver | undefined;

    const init = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const paths = gsap.utils.toArray<SVGPathElement | SVGLineElement>("[data-draw]");
        paths.forEach((p) => {
          const len = (p as SVGPathElement).getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });

        gsap
          .timeline({
            scrollTrigger: {
              trigger: root.current!,
              start: "top 68%",
              end: "bottom 60%",
              scrub: 0.6,
            },
          })
          .to(paths, { strokeDashoffset: 0, duration: 1, stagger: 0.04, ease: "none" })
          .to("[data-annotation]", { opacity: 1, duration: 0.3, stagger: 0.05 }, 0.5)
          .to("[data-blueprint-photo]", { opacity: 1, duration: 0.8 }, 0.75)
          .to("[data-blueprint-svg]", { opacity: 0.22, duration: 0.8 }, 0.75);
      }, root);
    };

    io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io?.disconnect();
          void init();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);

    return () => {
      cancelled = true;
      io?.disconnect();
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={root}
      className="border-y border-line bg-background px-5 py-[14vh] md:px-10 md:py-[20vh]"
    >
      <div className="mx-auto max-w-[1680px]">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <p className="meta">{t("blueprint.sectionNum")}</p>
          <p className="meta">{t("blueprint.sheet")}</p>
        </div>

        <div className="relative aspect-[16/9] w-full bg-stone-warm">
          <img
            data-blueprint-photo
            src={horizonSrc}
            alt="The Horizon by Rawasin, realised elevation"
            width={1920}
            height={1080}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-0"
          />

          <svg
            data-blueprint-svg
            viewBox="0 0 1600 900"
            className="absolute inset-0 h-full w-full"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            aria-label="Architectural elevation drawing of The Horizon"
            role="img"
          >
            <g className="text-ink/70">
              {/* ground line */}
              <line data-draw x1="80" y1="780" x2="1520" y2="780" strokeWidth="1.5" />
              {/* main mass */}
              <path data-draw d="M480 780 L480 180 L880 120 L880 780" />
              <path data-draw d="M880 780 L880 320 L1180 300 L1180 780" />
              <path data-draw d="M480 780 L200 780 L200 520 L480 500" />
              {/* core */}
              <path data-draw d="M640 780 L640 160" strokeDasharray="0" />
              <path data-draw d="M760 780 L760 140" />
              {/* floor plates */}
              {Array.from({ length: 11 }).map((_, i) => (
                <line
                  key={i}
                  data-draw
                  x1="480"
                  y1={220 + i * 52}
                  x2={i > 3 ? 1180 : 880}
                  y2={220 + i * 52}
                  className="text-ink/35"
                />
              ))}
              {/* podium */}
              <path data-draw d="M200 780 L1400 780 L1400 700 L1180 700" />
              {/* section markers */}
              <circle data-draw cx="1400" cy="660" r="16" />
              <line data-draw x1="1400" y1="676" x2="1400" y2="700" />
            </g>

            <g className="fill-ink/70 font-mono" fontSize="16" stroke="none">
              <text data-annotation x="200" y="830" opacity="0">
                {isRTL ? "المحور أ" : "GRID A"}
              </text>
              <text data-annotation x="880" y="830" opacity="0">
                {isRTL ? "المحور د" : "GRID D"}
              </text>
              <text data-annotation x="1230" y="420" opacity="0">
                {isRTL ? "+148.00 م" : "+148.00 M"}
              </text>
              <text data-annotation x="1230" y="700" opacity="0">
                {isRTL ? "المنصة +12.00 م" : "PODIUM +12.00 M"}
              </text>
              <text data-annotation x="120" y="480" opacity="0">
                24°42′ N
              </text>
              <text data-annotation x="120" y="510" opacity="0">
                46°43′ E
              </text>
            </g>
          </svg>
        </div>

        <div className="mt-6 grid gap-4 text-sm text-muted-foreground md:grid-cols-4">
          <p>{t("blueprint.structure")}</p>
          <p>{t("blueprint.facade")}</p>
          <p>{t("blueprint.orientation")}</p>
          <p>{t("blueprint.shading")}</p>
        </div>
      </div>
    </section>
  );
}
