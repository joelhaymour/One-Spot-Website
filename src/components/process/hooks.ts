"use client";

import { useEffect, useState, type RefObject } from "react";
import { clamp } from "@/lib/math";

interface Visibility {
  /** intersecting the viewport right now */
  onScreen: boolean;
  /** has intersected at least once (latches, for one-time entrances) */
  seen: boolean;
}

/**
 * Viewport visibility of an element. Ambient loops gate on `onScreen` so nothing runs for a diagram
 * nobody can see (a sticky story keeps its last step long after it has scrolled away).
 */
export function useOnScreen<T extends Element>(ref: RefObject<T | null>, rootMargin = "0px"): Visibility {
  const [state, setState] = useState<Visibility>({ onScreen: false, seen: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const onScreen = entry.isIntersecting;
        setState((prev) => (prev.onScreen === onScreen && (prev.seen || !onScreen) ? prev : { onScreen, seen: prev.seen || onScreen }));
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return state;
}

/**
 * Keeps SVG labels and small glyphs legible at any rendered size.
 *
 * A diagram drawn in a 720-unit viewBox renders anywhere from 300px to 800px wide, so text sized in
 * user units would swing from 4px to 11px. This writes two unitless custom properties on the element:
 *   --u  user units per CSS pixel: `font-size: calc(10px * var(--u))` is always 10px on screen
 *   --k  a gentler factor for glyphs, so dots and rings grow a little on phones without crowding
 * They are set imperatively (no React state); the stylesheet carries breakpoint defaults for first paint.
 */
export function useSvgUnit<T extends HTMLElement>(ref: RefObject<T | null>, viewWidth: number) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const write = (width: number) => {
      if (width <= 0) return;
      const u = clamp(viewWidth / width, 0.8, 2.6);
      el.style.setProperty("--u", u.toFixed(3));
      el.style.setProperty("--k", clamp(0.55 + 0.45 * u, 1, 1.7).toFixed(3));
    };
    write(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => write(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, viewWidth]);
}
