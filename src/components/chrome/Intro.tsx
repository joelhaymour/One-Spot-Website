"use client";

import { useEffect, useRef } from "react";
import { gsap, EASE } from "@/lib/gsap";
import { SITE } from "@/content/copy";
import { Mark } from "@/components/agent/AgentSvg";
import { useLenis } from "@/components/motion/SmoothScroll";
import { useExperience } from "@/state/experience";

/**
 * The opening logo sequence.
 *
 *   cover (in the server HTML, shown by the boot script before first paint)
 *   -> the mark grows in at the centre (a CSS animation, so it starts at first paint, before hydration;
 *      the script joins in once its 500 ms are over, timed from first paint)
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
/** The mark's CSS entrance (globals.css): its keyframes name and how long it runs. The slide starts when it is over. */
const MARK_IN = "intro-mark-in";
const MARK_IN_MS = 500;
/** Hard ceiling on the sequence, ms. Past it the finish state is forced, whatever happened. */
const FAILSAFE = 4500;
/** Keys that scroll the document: swallowed while the cover is up, so nothing moves under it. */
const SCROLL_KEYS = new Set([" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

type Lenis = NonNullable<ReturnType<typeof useLenis>>;

/**
 * Milliseconds until the mark's CSS entrance is over. It began when the layer was first rendered, which may
 * be well before this script ran: the animation's own start time says exactly when, with first paint as
 * the fallback. A timer from that moment is deterministic where an animation event is not (background
 * tabs and headless renderers can hold the event back).
 */
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

/** Mounted once in the root layout. Runs on the first mount only, which is once per page load. */
export function Intro() {
  const layerRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const lockupRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  // Lenis may arrive after the sequence has started (its owner's effect runs after ours) or after it
  // has ended. `locked` says whether the sequence still wants scrolling held.
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
    const { setIntroDone } = useExperience.getState();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Not armed (reduced motion, or the boot failsafe already fired): nothing to play.
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

    // Nothing under the cover may take focus while it is up: a Tab (from the page or the address bar)
    // would land on invisible controls, and Enter on one would move the page under the cover.
    const shielded = Array.from(document.body.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== layer && !el.hasAttribute("inert"),
    );
    shielded.forEach((el) => {
      el.inert = true;
    });
    if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) document.activeElement.blur();

    // Touch devices have no Lenis to stop, and once Lenis is running again (handoff) it must not hear
    // the wheel either: swallow scrolling input at the cover for as long as it is up.
    const block = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    const blockKeys = (event: KeyboardEvent) => {
      if (!SCROLL_KEYS.has(event.key)) return;
      if (event.target instanceof HTMLElement && event.target.matches("input, textarea, select, [contenteditable]")) return;
      event.preventDefault();
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

    // The end state, from any path: the nav logo shows where the lockup landed and the cover is gone
    // (html without data-intro hides the layer entirely, see globals.css).
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

    // Geometry in the lockup's own, unscaled pixels. The lockup sits at the layer's centre, so its
    // x/y are offsets from that point; a target rect converts by subtracting the centre.
    const centre = () => {
      const b = layer.getBoundingClientRect();
      return { cx: b.width / 2, cy: b.height / 2, vh: b.height };
    };

    const handoff = () => {
      if (!alive || done) return;
      // Scrolling comes back before the measure. Where the scrollbar has width, its return reflows
      // the page, and that now happens under the still-opaque cover, not as a jolt at the end.
      locked.current = false;
      lenisRef.current?.start();

      const { cx, cy, vh } = centre();
      const w = lockup.getBoundingClientRect().width / SCALE;

      let target: DOMRect | null = null;
      try {
        const rect = document.querySelector<HTMLElement>("header [data-logo]")?.getBoundingClientRect();
        // A deep link can load with the bar hidden or slid away: then there is nothing to land on.
        if (rect && rect.width > 0 && rect.top >= 0 && rect.bottom <= vh) target = rect;
      } catch {
        target = null;
      }

      timeline = gsap.timeline({ onComplete: finish });
      if (target) {
        // FLIP: same DOM as the nav lockup, origin top left, so the landing is a scale and a move.
        timeline.to(lockup, { x: target.left - cx, y: target.top - cy, scale: target.width / w, duration: 0.85, ease: EASE.camera }, 0);
      } else {
        timeline.to(lockup, { opacity: 0, duration: 0.5, ease: EASE.settle }, 0.1);
      }
      // The page under the cover is released as the cover starts to go, so it enters while the logo travels.
      timeline.call(setIntroDone, [], 0.1);
      timeline.to(cover, { opacity: 0, duration: 0.7, ease: "power2.inOut" }, 0.1);
    };

    const slide = () => {
      if (!alive || done) return;
      const r = lockup.getBoundingClientRect();
      const w = r.width / SCALE;
      const h = r.height / SCALE;
      // The mark's entrance scales it about its own centre, so that centre is exact at any moment.
      const m = mark.getBoundingClientRect();
      const mx = (m.left + m.width / 2 - r.left) / SCALE;
      const my = (m.top + m.height / 2 - r.top) / SCALE;

      // Exactly where the CSS starting transform put it (mark centred), now under GSAP's control.
      gsap.set(lockup, { x: -mx * SCALE, y: -my * SCALE, scale: SCALE, transformOrigin: "0 0" });
      gsap.set(word, { opacity: 0, x: 6 });

      timeline = gsap.timeline();
      timeline.to(lockup, { x: -(w / 2) * SCALE, y: -(h / 2) * SCALE, duration: 0.45, ease: EASE.enter }, 0);
      timeline.to(word, { opacity: 1, x: 0, duration: 0.45, ease: EASE.enter }, 0.06);
      timeline.call(handoff, [], "+=0.35");
    };

    const start = () => {
      if (!alive || done) return;
      failsafe = window.setTimeout(finish, FAILSAFE);
      timer = window.setTimeout(slide, markRemaining(mark) + 40);
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

  // Identical on server and client; html[data-intro="on"] alone makes it show.
  return (
    <div ref={layerRef} aria-hidden className="intro fixed inset-0 z-[100]">
      <div ref={coverRef} className="absolute inset-0 bg-[var(--void)]" />
      {/* The nav's lockup, exactly (see Nav.tsx), so the hand-off is a transform and nothing else. */}
      <div ref={lockupRef} className="intro-lockup flex items-center gap-2.5 whitespace-nowrap text-[var(--text-0)]">
        <span ref={markRef} className="intro-mark">
          <span className="intro-glow" />
          <Mark size={22} className="relative block" />
        </span>
        <span ref={wordRef} className="intro-word text-[0.9375rem] font-medium tracking-[-0.02em]">
          {SITE.name}
        </span>
      </div>
    </div>
  );
}
