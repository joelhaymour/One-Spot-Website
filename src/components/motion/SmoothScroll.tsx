"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { detectTier } from "@/lib/capabilities";
import { useExperience } from "@/state/experience";

// Lenis is an external system, so it lives in a tiny external store rather than React state.
let current: Lenis | null = null;
const listeners = new Set<() => void>();
const publish = (next: Lenis | null) => {
  current = next;
  listeners.forEach((fn) => fn());
};
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

/** The active Lenis instance, or null when smooth scrolling is off (touch, reduced motion). */
export const useLenis = () =>
  useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );

/**
 * Owns scrolling for the whole experience.
 * - Lenis is driven by the GSAP ticker so ScrollTrigger and smooth scroll share one clock.
 * - Touch devices and reduced-motion visitors keep native scrolling; sticky stories still work.
 * - On route change we reset (or restore, when returning to the HUD) and re-measure triggers.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenis = useLenis();
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
      stopInertiaOnNavigate: true,
    });
    instance.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => instance.raf(time * 1000);
    // prioritized: Lenis moves the page before any tween or WebGL frame reads it
    gsap.ticker.add(tick, false, true);
    gsap.ticker.lagSmoothing(0);
    publish(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      publish(null);
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

  return <>{children}</>;
}
