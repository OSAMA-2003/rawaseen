"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { useLanguage } from "@/i18n/LanguageContext";

export function FinalCTA({
  onOpenInquiry,
}: {
  onOpenInquiry?: () => void;
} = {}) {
  const root = useRef<HTMLElement>(null);
  const cta = useRef<HTMLElement>(null);
  const { t, language, isRTL } = useLanguage();

  const lines = (t("cta.lines", { returnObjects: true }) as unknown as string[]) || [
    "Let's build",
    "what comes next.",
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
          "[data-cta-line] span",
          { yPercent: 105 },
          {
            yPercent: 0,
            duration: 1.2,
            ease: "expo.out",
            stagger: 0.1,
            scrollTrigger: { trigger: root.current!, start: "top 70%" },
          },
        );
      }, root);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [language]);

  // Magnetic CTA — desktop pointers only.
  useEffect(() => {
    const el = cta.current;
    if (!el || prefersReducedMotion()) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
    };
    const onLeave = () => {
      el.style.transform = "translate(0,0)";
    };
    el.addEventListener("mousemove", onMove as EventListener);
    el.addEventListener("mouseleave", onLeave as EventListener);
    return () => {
      el.removeEventListener("mousemove", onMove as EventListener);
      el.removeEventListener("mouseleave", onLeave as EventListener);
    };
  }, []);

  return (
    <section
      ref={root}
      id="contact"
      className="bg-[#f4f1ea] border-t border-[#e2ddd3] px-5 pb-10 pt-[16vh] text-[#182220] md:px-10 md:pt-[24vh]"
    >
      <div className="mx-auto max-w-[1680px]">
        <h2 className="text-[13vw] font-medium leading-[1.1] text-[#182220] md:text-[8vw]">
          {lines.map((l, index) => (
            <span key={`${language}-${index}-${l}`} data-cta-line className="line-mask">
              <span className="block will-change-transform">{l}</span>
            </span>
          ))}
        </h2>

        <div className="mt-14 flex flex-wrap items-center gap-8">
          {onOpenInquiry ? (
            <button
              ref={cta as any}
              type="button"
              onClick={onOpenInquiry}
              className="inline-flex items-center gap-4 bg-[#182220] text-[#f8f6f2] px-9 py-5 rounded-full font-mono text-[0.72rem] uppercase tracking-[0.24em] transition-colors duration-300 hover:bg-[#283834] shadow-md shadow-black/10 cursor-pointer"
              style={{ transition: "transform .5s cubic-bezier(.22,1,.36,1), background-color .3s, color .3s" }}
            >
              {t("cta.startConversation")}
              <span aria-hidden>{isRTL ? "←" : "→"}</span>
            </button>
          ) : (
            <a
              ref={cta as any}
              href="mailto:studio@rawasin.sa"
              className="inline-flex items-center gap-4 bg-[#182220] text-[#f8f6f2] px-9 py-5 rounded-full font-mono text-[0.72rem] uppercase tracking-[0.24em] transition-colors duration-300 hover:bg-[#283834] shadow-md shadow-black/10"
              style={{ transition: "transform .5s cubic-bezier(.22,1,.36,1), background-color .3s, color .3s" }}
            >
              {t("cta.startConversation")}
              <span aria-hidden>{isRTL ? "←" : "→"}</span>
            </a>
          )}
        </div>

        <footer className="mt-[14vh] grid gap-8 border-t border-[#ded9ce] pt-8 md:grid-cols-4">
          <div>
            <img
              src="/logo-black.png"
              alt="Rawasin"
              className="h-9 md:h-10 w-auto object-contain mb-3"
            />
            <p className="meta text-[#6b7b77]">{t("cta.est")}</p>
          </div>
          <div className="meta space-y-2 text-[#556460]">
            <p>{t("cta.address1")}</p>
            <p>{t("cta.address2")}</p>
          </div>
          <div className="meta space-y-2 text-[#556460]">
            <p>studio@rawasin.sa</p>
            <p>+966 11 000 0000</p>
          </div>
          <div className={`meta flex items-end text-[#859591] ${isRTL ? "justify-start md:justify-start" : "justify-start md:justify-end"}`}>
            <p>© {new Date().getFullYear()} {t("cta.copyright")}</p>
          </div>
        </footer>
      </div>
    </section>
  );
}
