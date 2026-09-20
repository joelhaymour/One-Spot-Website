"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { detectTier } from "@/lib/capabilities";
import { useExperience } from "@/state/experience";

const LenisContext = createContext<Lenis | null>(null);

/** The active Lenis instance, or null when smooth scrolling is off (touch, reduced motion). */
export const useLenis = () => useContext(LenisContext);

/**
 * Owns scrolling for the whole experience.
 * - Lenis is driven by the GSAP ticker so ScrollTrigger and smooth scroll share one clock.
 * - Touch devices and reduced-motion visitors keep native scrolling; sticky stories still work.
 * - On route change we reset (or restore, when returning to the HUD) and re-measure triggers.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();
  const firstPath = useRef(true);
  const setTier = useExperience((s) => s.setTier);

  useEffect(() => {
    const tier = detectTier();
    setTier(tier);

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (tier === "static" || coarse) return;

    const instance = new Lenis({
      autoRaf: false,
      lerp: 0.11,
      wheelMultiplier: 0.9,
      smoothWheel: true,
      syncTouch: false,
    });
    instance.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, [setTier]);

  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    const { homeScrollY, setHomeScrollY } = useExperience.getState();
    const target = pathname === "/" && homeScrollY !== null ? homeScrollY : 0;
    if (pathname === "/") setHomeScrollY(null);

    // Wait one frame so the new route's sticky stories have laid out before we jump and re-measure.
    const id = requestAnimationFrame(() => {
      if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
      else window.scrollTo(0, target);
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, lenis]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
