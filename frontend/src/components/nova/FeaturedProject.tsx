"use client";

import { useEffect, useRef } from "react";
import horizon from "@/assets/horizon.jpg";
import { prefersReducedMotion } from "@/lib/motion";
import { useLanguage } from "@/i18n/LanguageContext";

const horizonSrc = typeof horizon === "string" ? horizon : horizon.src;

export function FeaturedProject() {
  const root = useRef<HTMLElement>(null);
  const { t } = useLanguage();

  const facts = [
    [t("featured.facts.project"), "R—007"],
    [t("featured.facts.location"), t("featured.facts.locationVal")],
    [t("featured.facts.completion"), "2027"],
    [t("featured.facts.area"), "410,000 SQM"],
    [t("featured.facts.architecture"), t("featured.facts.architectureVal")],
  ];

  useEffect(() => {
    if (!root.current || prefersReducedMotion()) return;
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
          "[data-parallax]",
          { yPercent: -8, scale: 1.14 },
          {
            yPercent: 8,
            scale: 1.14,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-frame]",
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
        gsap.fromTo(
          "[data-frame]",
          { clipPath: "inset(14% 8% 14% 8%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: {
              trigger: "[data-frame]",
              start: "top 85%",
              end: "top 25%",
              scrub: true,
            },
          },
        );
      }, root);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={root}
      id="about"
      className="bg-background px-5 py-[12vh] md:px-10 md:py-[18vh]"
    >
      <div className="mx-auto max-w-[1680px]">
        <div className="mb-8 flex items-end justify-between">
          <p className="meta">{t("featured.sectionNum")}</p>
          <p className="meta hidden md:block">{t("featured.status")}</p>
        </div>

        <h2 className="text-[16vw] font-medium leading-[0.95] md:text-[11vw]">
          {t("featured.title")}
        </h2>

        <div
          data-frame
          className="mt-10 aspect-[16/10] w-full overflow-hidden md:aspect-[16/7]"
        >
          <img
            data-parallax
            src={"./feature.jpg"}
            alt={t("featured.title")}
            width={1920}
            height={1080}
            loading="lazy"
            decoding="async"
            className="h-full w-full scale-[1.14] object-cover will-change-transform"
          />
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-5">
          {facts.map(([k, v]) => (
            <div key={k} className="rule-top pt-4">
              <dt className="meta">{k}</dt>
              <dd className="mt-2 text-base md:text-lg">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
