"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { prefersReducedMotion } from "@/lib/motion";

const ThreeScene = dynamic(() => import("./ThreeScene"), { ssr: false });

export function ThreeDArchitecture() {
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [ready, setReady] = useState(false);
  const [isTwilight, setIsTwilight] = useState(false);

  // Mount the 3D scene only when the section approaches the viewport.
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          setReady(true);
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Scroll progress kept outside React state to avoid re-renders.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      progress.current = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={root}
      className={`relative border-t transition-colors duration-700 ${
        isTwilight ? "border-white/10 bg-[#0d1017] text-white" : "border-line bg-[#efece6] text-ink"
      }`}
      style={{ height: "260svh" }}
      aria-label="Interactive Rawasin architectural model"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* Background layer */}
        <div
          className={`absolute inset-0 transition-colors duration-700 ${
            isTwilight ? "bg-[#0d1017]" : "bg-[#efece6]"
          }`}
          aria-hidden
        />

        {ready && (
          <Suspense fallback={null}>
            <ThreeScene progress={progress} isTwilight={isTwilight} />
          </Suspense>
        )}

        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-[1680px] flex-col justify-between px-5 py-8 md:px-10 md:py-12">
          {/* Header row with structural tags & lighting toggle */}
          <div className="flex items-start justify-between">
            <div>
              <p className="meta">(04) — Architectural Model</p>
              <p
                className={`font-mono text-[0.65rem] tracking-[0.2em] uppercase mt-1 ${
                  isTwilight ? "text-white/60" : "text-muted-foreground"
                }`}
              >
                Rawasin Pavilion — New Sohag City
              </p>
            </div>

            {/* Interactive lighting switcher */}
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTwilight((prev) => !prev)}
                className={`flex items-center gap-2.5 rounded-full border px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] transition-all duration-300 ${
                  isTwilight
                    ? "border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20"
                    : "border-ink/20 bg-background/70 text-ink backdrop-blur hover:bg-background"
                }`}
                aria-label="Toggle day or twilight lighting"
              >
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    isTwilight ? "bg-amber-400 shadow-[0_0_8px_#f59e0b]" : "bg-ink/70"
                  }`}
                />
                {isTwilight ? "Sohag Twilight" : "Studio Light"}
              </button>
            </div>
          </div>

          {/* Bottom description & exploded view indicators */}
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div
              className={`max-w-[44ch] p-5 md:p-6 backdrop-blur-md rounded-lg transition-colors duration-500 ${
                isTwilight
                  ? "bg-[#0d1017]/60 border border-white/10"
                  : "bg-[#efece6]/70 border border-ink/10"
              }`}
            >
              <h2 className="text-[8.5vw] font-medium leading-[0.92] md:text-[3.2vw]">
                Scale & Proportion
              </h2>
              <p
                className={`mt-3 text-sm leading-relaxed ${
                  isTwilight ? "text-white/80" : "text-muted-foreground"
                }`}
              >
                Floor-to-ceiling glass showroom, dark aluminum spandrels, warm
                interior illumination, landscaped perimeter gardens, and a floating
                cantilevered parapet separate in an exploded axonometric study.
              </p>
            </div>

            <div
              className={`flex flex-col gap-2.5 font-mono text-[0.68rem] tracking-[0.18em] uppercase p-4 md:p-5 rounded-lg backdrop-blur-md transition-colors duration-500 ${
                isTwilight
                  ? "bg-[#0d1017]/60 text-white/70 border border-white/10"
                  : "bg-[#efece6]/70 text-muted-foreground border border-ink/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isTwilight ? "text-white" : "text-ink"}>Ground + 5 Levels</span>
                <span>•</span>
                <span>Commercial & Retail</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Scroll to explore structural layers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
