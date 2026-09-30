"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { useLanguage } from "@/i18n/LanguageContext";

export function Stats() {
  const root = useRef<HTMLElement>(null);
  const { t, language } = useLanguage();

  const stats = [
    { value: 12, suffix: "+", label: t("stats.projects") },
    { value: 2.4, suffix: "M+", label: t("stats.sqm"), decimals: 1 },
    { value: 18, suffix: "", label: t("stats.years") },
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
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const target = Number(el.dataset["count"]);
          const decimals = Number(el.dataset["decimals"] ?? 0);
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target,
            duration: 1.6,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
            onUpdate: () => {
              el.textContent = obj.v.toFixed(decimals);
            },
          });
        });
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
      className="border-t border-line bg-background px-5 py-[12vh] md:px-10 md:py-[18vh]"
    >
      <div className="mx-auto grid max-w-[1680px] gap-12 md:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-[18vw] font-medium leading-[0.8] tracking-tight md:text-[7vw]">
              <span data-count={s.value} data-decimals={s.decimals ?? 0}>
                {s.decimals ? s.value.toFixed(s.decimals) : s.value}
              </span>
              <span className="text-metal">{s.suffix}</span>
            </p>
            <p className="meta mt-5">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
