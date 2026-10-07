"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { useLanguage } from "@/i18n/LanguageContext";

export function IntroStatement() {
  const root = useRef<HTMLElement>(null);
  const { t, language } = useLanguage();

  const lines =
    (t("intro.lines", {
      returnObjects: true,
    }) as unknown as string[]) || [
      "We don't just develop",
      "buildings.",
      "We develop the way",
      "people experience space.",
    ];

  useEffect(() => {
    const section = root.current;

    if (!section || prefersReducedMotion()) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled || !root.current) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        /*
         * Get ONLY the lines inside this section.
         * Nothing outside IntroStatement is affected.
         */

        const lineElements = section.querySelectorAll(
          "[data-stmt-line]"
        );

        if (!lineElements.length) return;

        /*
         * Initial state
         */

        gsap.set(lineElements, {
          yPercent: 105,
        });

        /*
         * IntroStatement animation
         *
         * Completely independent ScrollTrigger.
         * No pin.
         * No scrub.
         * No relation to Hero.
         */

        gsap.to(lineElements, {
          yPercent: 0,
          duration: 1,
          ease: "expo.out",
          stagger: 0.08,

          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
          },
        });
      }, section);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [language]);

  return (
    <section
      ref={root}
      id="vision"
      className="
  mx-auto
  max-w-[1680px]
  px-5
  pt-[8vh]
  pb-0
  md:px-10
  md:py-[24vh]
"
    >
      <div className="grid gap-10 md:grid-cols-12">
        <p
          className="
            meta
            font-medium
            tracking-[0.2em]
            text-[#9e825e]
            md:col-span-3
          "
        >
          {t("intro.sectionNum")}
        </p>

        <h2
          className="
            text-[8.2vw]
            font-medium
            leading-[1.15]
            text-[#182220]
            md:col-span-9
            md:text-[4.6vw]
          "
        >
          {lines.map((line, index) => (
            <span
              key={`${language}-${index}-${line}`}
              className="line-mask block overflow-hidden"
            >
              <span
                data-stmt-line
                className="block will-change-transform"
              >
                {line}
              </span>
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}