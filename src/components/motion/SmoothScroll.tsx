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
  const lastPath = useRef(pathname);
  const setTier = useExperience((s) => s.setTier);

  useEffect(() => {
    const tier = detectTier();
    setTier(tier);
    // Tells the boot script in the root layout that the app is alive (see layout.tsx).
    (window as Window & { __osReady?: boolean }).__osReady = true;

    // ScrollTrigger re-applies its own cached restoration mode after every refresh, so set it through
    // ScrollTrigger rather than on history directly.
    ScrollTrigger.clearScrollMemory("manual");

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

  // Remember where the visitor was on the homepage whenever they walk into a department by any door
  // (the display, the loop grid, the footer, the phone list), so Back returns them to that spot.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (window.location.pathname !== "/" || e.defaultPrevented) return;
      const link = (e.target as Element | null)?.closest?.('a[href^="/departments/"]');
      if (link) useExperience.getState().setHomeScrollY(window.scrollY);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    // Only a real route change may move the page. Lenis arriving a tick after mount is not one.
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    const { homeScrollY, setHomeScrollY } = useExperience.getState();
    const home = pathname === "/";
    if (home) setHomeScrollY(null);

    // Wait one frame so the new route's sticky stories have laid out before we jump and re-measure.
    const id = requestAnimationFrame(() => {
      let target = 0;
      if (home && homeScrollY !== null) target = homeScrollY;
      else if (window.location.hash.length > 1) {
        const el = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
        if (el) target = el.getBoundingClientRect().top + window.scrollY;
      }
      if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
      else window.scrollTo(0, target);
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, lenis]);

  return <>{children}</>;
}
