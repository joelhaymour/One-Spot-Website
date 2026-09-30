"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { WEBSITES } from "@/content/site";
import { gsap } from "@/lib/gsap";
import { AfterStore, BeforeStore, MOCK_H, MOCK_W } from "./StoreMocks";

/**
 * Before and after, one store. The "after" layer is clipped from the handle to the right edge. A native
 * range input covers the frame, so dragging, clicking and the arrow keys all move the handle. The first
 * time it comes into view the handle sweeps once to show that it moves.
 */
export function StoreCompare() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);
  const [pos, setPos] = useState(50);
  const touched = useRef(false);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / MOCK_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // One gentle sweep on first view, unless the visitor gets there first.
  useEffect(() => {
    const el = frameRef.current;
    if (!el || document.documentElement.dataset.motion !== "on") return;
    let tween: gsap.core.Timeline | null = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const state = { v: 50 };
        tween = gsap
          .timeline({ delay: 0.5, onUpdate: () => !touched.current && setPos(state.v) })
          .to(state, { v: 78, duration: 0.9, ease: "power2.inOut" })
          .to(state, { v: 22, duration: 1.3, ease: "power2.inOut" })
          .to(state, { v: 50, duration: 0.9, ease: "power2.inOut" });
      },
      { threshold: 0.55 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      tween?.kill();
    };
  }, []);

  return (
    <figure className="m-0">
      <div
        ref={frameRef}
        className="relative w-full select-none overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--card)] shadow-[var(--shadow-lift)]"
        style={{ aspectRatio: `${MOCK_W} / ${MOCK_H}` }}
      >
        <div aria-hidden className="absolute left-0 top-0 origin-top-left" style={{ width: MOCK_W, height: MOCK_H, transform: `scale(${scale})` }}>
          <BeforeStore />
        </div>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ clipPath: `inset(0 0 0 ${pos}%)` } as CSSProperties}
        >
          <div className="absolute left-0 top-0 origin-top-left" style={{ width: MOCK_W, height: MOCK_H, transform: `scale(${scale})` }}>
            <AfterStore />
          </div>
        </div>

        {/* labels */}
        <span aria-hidden style={{ opacity: pos < 14 ? 0 : 1 }} className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-[var(--ink)] transition-opacity duration-300 px-2.5 py-0.5 text-[0.7rem] font-medium text-[var(--paper)] sm:px-3 sm:py-1 sm:text-[0.75rem] sm:bottom-4 sm:left-4">
          {WEBSITES.compare.before}
        </span>
        <span aria-hidden style={{ opacity: pos > 86 ? 0 : 1 }} className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-[var(--spot)] transition-opacity duration-300 px-2.5 py-0.5 text-[0.7rem] font-medium text-white sm:px-3 sm:py-1 sm:text-[0.75rem] sm:bottom-auto sm:right-4 sm:top-12">
          {WEBSITES.compare.after}
        </span>

        {/* handle */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0" style={{ left: `${pos}%` }}>
          <span className="absolute inset-y-0 -left-px w-[2px] bg-white shadow-[0_0_0_1px_rgba(21,23,27,0.12)]" />
          <span className="absolute left-0 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[var(--ink)] shadow-[var(--shadow-lift)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
            </svg>
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(pos)}
          aria-label={WEBSITES.compare.label}
          aria-valuetext={`${Math.round(100 - pos)}% after`}
          onChange={(e) => {
            touched.current = true;
            setPos(Number(e.target.value));
          }}
          onPointerDown={() => {
            touched.current = true;
          }}
          className="compare-range absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <figcaption className="t-small mt-4">{WEBSITES.compare.caption}</figcaption>
    </figure>
  );
}
