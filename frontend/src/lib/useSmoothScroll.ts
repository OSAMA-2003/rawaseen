"use client";

import { useEffect } from "react";
import type Lenis from "lenis";
import { prefersReducedMotion } from "./motion";

let lenisInstance: Lenis | null = null;

/**
 * Access the active Lenis smooth scroll instance.
 */
export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * Programmatically scroll to a selector, element, or pixel offset smoothly.
 */
export function scrollToTarget(
  target: string | HTMLElement | number,
  options?: {
    offset?: number;
    duration?: number;
    immediate?: boolean;
  }
) {
  if (typeof window === "undefined") return;

  if (lenisInstance) {
    lenisInstance.scrollTo(target, {
      offset: options?.offset ?? 0,
      duration: options?.duration ?? 1.4,
      immediate: options?.immediate ?? false,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    return;
  }

  // Fallback for native scrolling
  if (typeof target === "number") {
    window.scrollTo({
      top: target + (options?.offset ?? 0),
      behavior: options?.immediate ? "auto" : "smooth",
    });
  } else {
    const el =
      typeof target === "string" ? document.querySelector(target) : target;
    if (el) {
      el.scrollIntoView({
        behavior: options?.immediate ? "auto" : "smooth",
      });
    }
  }
}

/**
 * Initializes buttery-smooth inertial scrolling via Lenis, synchronized
 * with GSAP ScrollTrigger ticker and refresh events.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    let destroy: (() => void) | undefined;
    let cancelled = false;

    const start = async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] =
        await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);

      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      // Create Lenis instance with luxury inertial easing curve
      const lenis = new Lenis({
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
      });

      lenisInstance = lenis;
      if (typeof window !== "undefined") {
        (window as unknown as { __lenis: Lenis }).__lenis = lenis;
      }

      // Sync Lenis scroll updates with ScrollTrigger
      lenis.on("scroll", ScrollTrigger.update);

      // Connect Lenis RAF to GSAP Ticker for frame-perfect lockstep animation
      const tick = (time: number) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // Recompute ScrollTrigger measurements now that Lenis scroll driver is connected
      ScrollTrigger.refresh();

      destroy = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        lenisInstance = null;
        if (typeof window !== "undefined") {
          delete (window as unknown as { __lenis?: Lenis }).__lenis;
        }
      };
    };

    void start();

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);
}
