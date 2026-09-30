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

export function ProjectScroll() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { t, isRTL } = useLanguage();

  const rawChapters =
    (t("projectScroll.chapters", {
      returnObjects: true,
    }) as unknown as Array<{
      n: string;
      title: string;
      body: string;
    }>) || [
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
        const mobile = isMobileViewport();

        ScrollTrigger.create({
          trigger: root.current!,
          start: "top top",
          end: "bottom bottom",
          pin: "[data-pin]",
          pinSpacing: false,

          onUpdate: (self) => {
            const i = Math.min(
              chapters.length - 1,
              Math.floor(self.progress * chapters.length),
            );

            setActive((prev) => (prev === i ? prev : i));
          },
        });

        if (!mobile) {
          gsap.to("[data-lines]", {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: root.current!,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
            },
          });
        }
      }, root);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [chapters.length]);

  return (
    <div
      ref={root}
      id="projects"
      className="relative"
      style={{ height: `${chapters.length * 100}svh` }}
    >
      <div
        data-pin
        className="h-[100svh] w-full overflow-hidden bg-stone-warm"
      >
        <div className="mx-auto grid h-full max-w-[1680px] grid-cols-1 gap-0 px-5 md:grid-cols-12 md:px-10">

          {/* IMAGE */}
          <div className="relative mt-20 col-span-1 h-[46svh] self-center overflow-hidden md:col-span-7 md:mt-0 md:h-[74svh]">
            {chapters.map((c, i) => (
              <img
                key={c.n}
                src={getImgSrc(c.img)}
                alt={`${c.title} — Rawasin architecture`}
                width={1280}
                height={1600}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[1100ms] ease-[cubic-bezier(.22,1,.36,1)]"
                style={{
                  opacity: active === i ? 1 : 0,
                  transform: `scale(${active === i ? 1 : 1.06})`,
                }}
              />
            ))}

            <div
              data-lines
              className="pointer-events-none absolute inset-0 origin-top scale-y-0"
              aria-hidden
            >
              <div className="absolute left-1/3 top-0 h-full w-px bg-white/25" />
              <div className="absolute left-2/3 top-0 h-full w-px bg-white/25" />
            </div>
          </div>

          {/* CONTENT */}
          <div
            className={`
              col-span-1
              flex
              min-h-0
              flex-col
              justify-center
              py-10
              md:col-span-5
              md:py-16
              ${isRTL ? "md:pr-16" : "md:pl-16"}
            `}
          >
            <div className="flex flex-col justify-center">

              {chapters.map((c, i) => {
                const on = active === i;
                const isLast = i === chapters.length - 1;

                return (
                  <div
                    key={c.n}
                    className={`
                      rule-top
                      relative
                      pt-4
                      transition-[opacity,transform]
                      duration-700
                      ease-[cubic-bezier(.22,1,.36,1)]
                      ${isLast ? "pb-4" : "pb-1"}
                    `}
                    style={{
                      opacity: on ? 1 : 0.24,
                      transform: on ? "translateX(0)" : "translateX(0)",
                    }}
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-[0.7rem] tracking-[0.2em] text-metal">
                        {c.n}
                      </span>

                      <h3 className="text-[7vw] font-medium leading-none md:text-[3vw]">
                        {c.title}
                      </h3>
                    </div>

                    <div
                      className="grid transition-[grid-template-rows,opacity] duration-700"
                      style={{
                        gridTemplateRows: on ? "1fr" : "0fr",
                        opacity: on ? 1 : 0,
                      }}
                    >
                      <div className="overflow-hidden">
                        <p className="mt-4 max-w-[38ch] pb-1 text-sm leading-relaxed text-muted-foreground">
                          {c.body}
                        </p>
                      </div>
                    </div>

                    {/* Extra breathing room for the last item */}
                    {isLast && (
                      <div
                        className="pointer-events-none absolute bottom-0 left-0 right-0 h-10"
                        aria-hidden
                      />
                    )}
                  </div>
                );
              })}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}