"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { setIntroDone } from "@/lib/intro";
import { Mark } from "@/components/ui/Mark";
import { useLenis } from "@/components/motion/SmoothScroll";

/**
 * The opening logo sequence.
 *
 *   cover (in the server HTML, shown by the boot script before first paint)
 *   -> the mark grows in at the centre (a CSS animation, so it starts at first paint, before hydration)
 *   -> the mark slides left as the wordmark arrives; the pair holds as one lockup
 *   -> the lockup travels to the nav's logo (a FLIP onto its measured rect) while the cover fades
 *   -> the nav logo takes over in place; the page is interactive
 *
 * The lockup is the nav lockup, same DOM and classes, scaled up, so landing on it is a transform.
 * Everything here is gated by html[data-intro="on"]: reduced motion, no JS and a boot that never
 * finished all leave that attribute off and never see any of this (see layout.tsx and globals.css).
 */

/** The cover lockup is the nav lockup, this many times larger. Mirrors --intro-scale in globals.css. */
const SCALE = 2.4;
const MARK_IN = "intro-mark-in";
const MARK_IN_MS = 850;
/** Hard ceiling on the sequence, ms. Past it the finish state is forced, whatever happened. */
const FAILSAFE = 7000;
const SCROLL_KEYS = new Set([" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"]);

type Lenis = NonNullable<ReturnType<typeof useLenis>>;

/** Milliseconds until the mark's CSS entrance is over, timed from when it actually began. */
function markRemaining(mark: HTMLElement): number {
  try {
    const anim = mark.getAnimations().find((a) => "animationName" in a && (a as CSSAnimation).animationName === MARK_IN);
    const paint = performance.getEntriesByType("paint").find((e) => e.name === "first-contentful-paint")?.startTime ?? 0;
    const began = anim && typeof anim.startTime === "number" ? anim.startTime : paint;
    return Math.max(0, began + MARK_IN_MS - performance.now());
  } catch {
    return 0;
  }
}

export function Intro() {
  const layerRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const lockupRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  const lenis = useLenis();
  const lenisRef = useRef<Lenis | null>(null);
  const locked = useRef(false);
  useEffect(() => {
    lenisRef.current = lenis;
    if (lenis && locked.current) lenis.stop();
  }, [lenis]);

  useEffect(() => {
    const root = document.documentElement;
    const layer = layerRef.current;
    const cover = coverRef.current;
    const lockup = lockupRef.current;
    const mark = markRef.current;
    const word = wordRef.current;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || root.dataset.intro !== "on" || !layer || !cover || !lockup || !mark || !word) {
      delete root.dataset.intro;
      setIntroDone();
      return;
    }

    let alive = true;
    let done = false;
    let timeline: gsap.core.Timeline | null = null;
    let failsafe = 0;
    let timer = 0;

    locked.current = true;
    lenisRef.current?.stop();

    // Nothing under the cover may take focus while it is up.
    const shielded = Array.from(document.body.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== layer && !el.hasAttribute("inert"),
    );
    shielded.forEach((el) => {
      el.inert = true;
    });

    const block = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    const blockKeys = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.has(event.key)) event.preventDefault();
    };
    layer.addEventListener("wheel", block, { passive: false });
    layer.addEventListener("touchmove", block, { passive: false });
    window.addEventListener("keydown", blockKeys);

    const release = () => {
      layer.removeEventListener("wheel", block);
      layer.removeEventListener("touchmove", block);
      window.removeEventListener("keydown", blockKeys);
      shielded.forEach((el) => {
        el.inert = false;
      });
      locked.current = false;
      lenisRef.current?.start();
    };

    const finish = () => {
      if (done) return;
      done = true;
      window.clearTimeout(failsafe);
      window.clearTimeout(timer);
      timeline?.kill();
      release();
      setIntroDone();
      delete root.dataset.intro;
      layer.style.visibility = "hidden";
      layer.style.pointerEvents = "none";
    };

    const centre = () => {
      const b = layer.getBoundingClientRect();
      return { cx: b.width / 2, cy: b.height / 2, vh: b.height };
    };

    const handoff = () => {
      if (!alive || done) return;
      locked.current = false;
      lenisRef.current?.start();

      const { cx, cy, vh } = centre();
      const w = lockup.getBoundingClientRect().width / SCALE;

      let target: DOMRect | null = null;
      try {
        const rect = document.querySelector<HTMLElement>("header [data-logo]")?.getBoundingClientRect();
        if (rect && rect.width > 0 && rect.top >= 0 && rect.bottom <= vh) target = rect;
      } catch {
        target = null;
      }

      timeline = gsap.timeline({ onComplete: finish });
      if (target) {
        timeline.to(lockup, { x: target.left - cx, y: target.top - cy, scale: target.width / w, duration: 1.2, ease: "power2.inOut" }, 0);
      } else {
        timeline.to(lockup, { opacity: 0, duration: 0.7, ease: "power2.out" }, 0.2);
      }
      // The page is released as the cover starts to go, so the hero enters while the logo travels.
      timeline.call(setIntroDone, [], 0.3);
      timeline.to(cover, { opacity: 0, duration: 1.0, ease: "power2.inOut" }, 0.25);
    };

    const slide = () => {
      if (!alive || done) return;
      const r = lockup.getBoundingClientRect();
      const w = r.width / SCALE;
      const h = r.height / SCALE;
      const m = mark.getBoundingClientRect();
      const mx = (m.left + m.width / 2 - r.left) / SCALE;
      const my = (m.top + m.height / 2 - r.top) / SCALE;

      gsap.set(lockup, { x: -mx * SCALE, y: -my * SCALE, scale: SCALE, transformOrigin: "0 0" });
      gsap.set(word, { opacity: 0, x: 10 });

      timeline = gsap.timeline();
      timeline.to(lockup, { x: -(w / 2) * SCALE, y: -(h / 2) * SCALE, duration: 0.8, ease: "power2.inOut" }, 0);
      timeline.to(word, { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" }, 0.15);
      timeline.call(handoff, [], "+=0.55");
    };

    const start = () => {
      if (!alive || done) return;
      failsafe = window.setTimeout(finish, FAILSAFE);
      timer = window.setTimeout(slide, markRemaining(mark) + 160);
    };

    // A tab opened in the background has no frames to animate with. Wait, and play when it is looked at.
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      document.removeEventListener("visibilitychange", onVisible);
      start();
    };
    if (document.visibilityState === "hidden") document.addEventListener("visibilitychange", onVisible);
    else start();

    return () => {
      alive = false;
      document.removeEventListener("visibilitychange", onVisible);
      window.clearTimeout(failsafe);
      window.clearTimeout(timer);
      timeline?.kill();
      if (!done) {
        layer.removeEventListener("wheel", block);
        layer.removeEventListener("touchmove", block);
        window.removeEventListener("keydown", blockKeys);
        shielded.forEach((el) => {
          el.inert = false;
        });
        locked.current = false;
      }
    };
  }, []);

  return (
    <div ref={layerRef} aria-hidden className="intro fixed inset-0 z-[100]">
      <div ref={coverRef} className="absolute inset-0 bg-[var(--paper)]" />
      {/* The nav's lockup, exactly (ui/Mark Lockup), so the hand-off is a transform and nothing else. */}
      <div ref={lockupRef} className="intro-lockup flex items-center gap-2.5 whitespace-nowrap text-[var(--ink)]">
        <span ref={markRef} className="intro-mark">
          <Mark size={26} />
        </span>
        <span ref={wordRef} className="intro-word text-[1.0625rem] font-semibold leading-[26px] tracking-[-0.03em]">
          One Spot
        </span>
      </div>
    </div>
  );
}
