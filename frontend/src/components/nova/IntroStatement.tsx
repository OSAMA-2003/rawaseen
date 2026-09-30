"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { useLanguage } from "@/i18n/LanguageContext";

export function IntroStatement() {
  const root = useRef<HTMLElement>(null);
  const { t, language } = useLanguage();

  const lines = (t("intro.lines", { returnObjects: true }) as unknown as string[]) || [
    "We don't just develop",
    "buildings.",
    "We develop the way",
    "people experience space.",
  ];

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

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
        gsap.fromTo(
          "[data-stmt] span",
          { yPercent: 105 },
          {
            yPercent: 0,
            duration: 1.2,
            ease: "expo.out",
            stagger: 0.09,
            scrollTrigger: { trigger: root.current!, start: "top 72%" },
          },
        );
      }, root);
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
      className="mx-auto max-w-[1680px] px-5 py-[16vh] md:px-10 md:py-[24vh]"
    >
      <div className="grid gap-10 md:grid-cols-12">
        <p className="meta md:col-span-3 text-[#9e825e] font-medium tracking-[0.2em]">{t("intro.sectionNum")}</p>
        <h2 className="text-[8.2vw] font-medium leading-[1.15] md:col-span-9 md:text-[4.6vw] text-[#182220]">
          {lines.map((line, index) => (
            <span key={`${language}-${index}-${line}`} data-stmt className="line-mask">
              <span className="block will-change-transform">{line}</span>
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}
