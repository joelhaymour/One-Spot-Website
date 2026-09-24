"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

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

export const getLenis = () => current;

/**
 * Owns scrolling. Lenis runs on the GSAP ticker so ScrollTrigger and smooth scroll share one clock.
 * Touch devices and reduced-motion visitors keep native scrolling; every sticky scene still works.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Tells the boot script in the root layout that the app is alive (see layout.tsx).
    (window as Window & { __osReady?: boolean }).__osReady = true;
    ScrollTrigger.clearScrollMemory("manual");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    const instance = new Lenis({
      autoRaf: false,
      lerp: 0.1,
      wheelMultiplier: 0.95,
      smoothWheel: true,
      syncTouch: false,
    });
    instance.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => instance.raf(time * 1000);
    // prioritized: Lenis moves the page before any tween reads it
    gsap.ticker.add(tick, false, true);
    gsap.ticker.lagSmoothing(0);
    publish(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      publish(null);
    };
  }, []);

  return <>{children}</>;
}

// power3.inOut
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Scroll to an in-page section and hand it focus, as a native fragment link would. */
export function scrollToId(id: string) {
  const el = id === "top" ? document.body : document.getElementById(id);
  if (!el) return;
  const top = id === "top" ? 0 : Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(top, { immediate: reduce, force: true, duration: 1.4, easing: easeInOut });
  else window.scrollTo({ top, behavior: reduce ? "instant" : "smooth" });

  if (id !== "top") {
    if (!el.hasAttribute("tabindex")) {
      el.setAttribute("tabindex", "-1");
      el.style.outline = "none";
    }
    el.focus({ preventScroll: true });
  }
  window.history.replaceState(null, "", id === "top" ? window.location.pathname : `#${id}`);
}
