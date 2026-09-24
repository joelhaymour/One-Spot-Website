"use client";

import { useRef, type CSSProperties } from "react";
import { BOARD, HERO, type BoardChip, type Lane } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { onIntroDone } from "@/lib/intro";
import { cn } from "@/lib/cn";
import { Split } from "@/components/motion/Split";
import { AnchorButton } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icons";

/**
 * The opening: a busy owner's desk. Ten loose pieces of work float around the pitch. Scrolling sorts
 * them into three lanes (handled, sent to the right person, waiting on you), each one's second line
 * turning from where it came from into what happened to it.
 *
 * The sorted board is the natural layout (it is what no-JS and reduced-motion visitors see, stacked
 * under the pitch). With motion, each chip is transformed from a loose spot on the desk back to its
 * own slot, FLIP style, scrubbed by scroll through a CSS-sticky track. No pins.
 */

export const LANE_STYLE: Record<Lane, { color: string; soft: string; glyph: IconName }> = {
  handled: { color: "var(--done)", soft: "var(--done-soft)", glyph: "check" },
  routed: { color: "var(--spot)", soft: "var(--spot-soft)", glyph: "arrow" },
  you: { color: "var(--wait)", soft: "var(--wait-soft)", glyph: "clock" },
};

interface Loose {
  /** Centre of the chip on the desk, as a fraction of the stage. */
  x: number;
  y: number;
  /** Degrees. */
  r: number;
}

/** Tablet and up: the margins around the pitch, a couple peeking in top and bottom. */
const LOOSE_WIDE: Record<string, Loose> = {
  report: { x: 0.2, y: 0.15, r: 3 },
  renewal: { x: 0.8, y: 0.15, r: -3 },
  invoice: { x: 0.1, y: 0.33, r: -6 },
  quote: { x: 0.9, y: 0.31, r: 5 },
  call: { x: 0.075, y: 0.56, r: 3 },
  schedule: { x: 0.93, y: 0.54, r: -4 },
  timesheets: { x: 0.12, y: 0.8, r: 4 },
  stock: { x: 0.88, y: 0.79, r: -5 },
  order: { x: 0.29, y: 0.97, r: -3 },
  prices: { x: 0.72, y: 0.975, r: 4 },
};

/** Phones: the pitch fills the screen, so the work waits just off the edges and flies in. */
const LOOSE_NARROW: Record<string, Loose> = {
  invoice: { x: -0.42, y: 0.22, r: -8 },
  call: { x: 1.42, y: 0.34, r: 7 },
  quote: { x: -0.42, y: 0.5, r: 6 },
  schedule: { x: 1.42, y: 0.62, r: -6 },
  order: { x: 0.5, y: 1.0, r: -3 },
  stock: { x: 1.42, y: 0.86, r: 5 },
};

const FALLBACK: Loose = { x: 0.5, y: 1.4, r: 0 };

const LANE_ORDER: Lane[] = ["handled", "routed", "you"];

/** Fly order: the lanes fill side by side, top slot first, so the board builds evenly. */
const FLY_ORDER = (() => {
  const seen: Record<string, number> = {};
  const rank = new Map<string, number>();
  BOARD.chips.forEach((chip) => {
    const slot = (seen[chip.lane] = (seen[chip.lane] ?? -1) + 1);
    rank.set(chip.id, slot * 3 + LANE_ORDER.indexOf(chip.lane));
  });
  return rank;
})();

function Chip({ chip }: { chip: BoardChip }) {
  const lane = LANE_STYLE[chip.lane];
  return (
    <div className="chip">
      <span className="chip-icon">
        <Icon name={chip.icon} size={18} />
        <span className="chip-tint grid place-items-center" style={{ background: lane.soft, color: lane.color }}>
          <Icon name={chip.icon} size={18} />
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="chip-title block">{chip.title}</span>
        <span className="chip-lines mt-[3px]">
          <span aria-hidden className="chip-sub chip-raw text-[var(--ink-3)]">
            {chip.raw}
          </span>
          <span className="chip-sub chip-status flex items-center gap-1.5 font-medium" style={{ color: lane.color }}>
            <Icon name={lane.glyph} size={13} strokeWidth={2.2} className="shrink-0" />
            <span className="truncate">{chip.status}</span>
          </span>
        </span>
      </span>
    </div>
  );
}

export function Hero() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      const stage = stageRef.current;
      if (!track || !stage || document.documentElement.dataset.motion !== "on") return;

      const wide = () => window.matchMedia("(min-width: 768px)").matches;
      const loose = (el: HTMLElement) => (wide() ? LOOSE_WIDE : LOOSE_NARROW)[el.dataset.chip ?? ""] ?? FALLBACK;

      // Offset from the chip's own slot to its loose spot on the desk, in px. Slots never move (the
      // mover inside them does), so their rects are the true sorted positions at any scroll.
      const offset = (el: HTMLElement, axis: "x" | "y") => {
        const s = stage.getBoundingClientRect();
        const slot = (el.parentElement ?? el).getBoundingClientRect();
        const p = loose(el);
        return axis === "x" ? p.x * s.width - (slot.left - s.left + slot.width / 2) : p.y * s.height - (slot.top - s.top + slot.height / 2);
      };

      const movers = gsap.utils.toArray<HTMLElement>(".chip-mover", stage);
      const inners = gsap.utils.toArray<HTMLElement>(".chip-inner", stage);

      stage.classList.add("hero-loose");
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => stage.classList.toggle("hero-loose", self.progress < 0.025),
        },
      });

      tl.to(cueRef.current, { opacity: 0, duration: 0.04 }, 0);
      tl.to(copyRef.current, { opacity: 0, y: -80, scale: 0.97, duration: 0.2, ease: "power1.in" }, 0.02);

      movers.forEach((mover) => {
        const at = 0.05 + (FLY_ORDER.get(mover.dataset.chip ?? "") ?? 0) * 0.022;
        tl.fromTo(
          mover,
          {
            x: () => offset(mover, "x"),
            y: () => offset(mover, "y"),
            rotation: () => loose(mover).r,
            scale: () => (wide() ? 0.86 : 0.92),
          },
          { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.4, ease: "power2.inOut", immediateRender: true },
          at,
        );
      });

      tl.fromTo(".board-head", { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.16, ease: "power2.out" }, 0.4);
      tl.fromTo(".lane-head", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.1, stagger: 0.04, ease: "power2.out" }, 0.47);
      tl.to(".chip-raw", { opacity: 0, duration: 0.07, stagger: 0.016 }, 0.6);
      tl.to(".chip-status", { opacity: 1, duration: 0.07, stagger: 0.016 }, 0.62);
      tl.to(".chip-tint", { opacity: 1, duration: 0.07, stagger: 0.016 }, 0.62);
      // hold the sorted board for the last stretch of the track
      tl.to({}, { duration: 0.16 });

      stage.dataset.ready = "";

      // The desk fills once the logo has lifted.
      gsap.set(inners, { opacity: 0, y: 26, scale: 0.94 });
      gsap.set(cueRef.current, { opacity: 0 });
      const stop = onIntroDone(() => {
        gsap.to(inners, { opacity: 1, y: 0, scale: 1, duration: 1.3, ease: "expo.out", stagger: { each: 0.07, from: "random" }, delay: 0.45 });
        gsap.to(cueRef.current, { opacity: 1, duration: 1, delay: 1.6 });
      });

      // The spot follows a fine pointer across the desk.
      const glow = glowRef.current;
      let off = () => {};
      if (glow && window.matchMedia("(pointer: fine)").matches) {
        const xTo = gsap.quickTo(glow, "x", { duration: 1.1, ease: "power3" });
        const yTo = gsap.quickTo(glow, "y", { duration: 1.1, ease: "power3" });
        const onMove = (event: PointerEvent) => {
          const r = stage.getBoundingClientRect();
          xTo(event.clientX - r.left);
          yTo(event.clientY - r.top);
          gsap.to(glow, { opacity: 1, duration: 0.8, overwrite: "auto" });
        };
        const onLeave = () => gsap.to(glow, { opacity: 0, duration: 0.8, overwrite: "auto" });
        gsap.set(glow, { x: stage.clientWidth / 2, y: stage.clientHeight / 2 });
        stage.addEventListener("pointermove", onMove);
        stage.addEventListener("pointerleave", onLeave);
        off = () => {
          stage.removeEventListener("pointermove", onMove);
          stage.removeEventListener("pointerleave", onLeave);
        };
      }

      return () => {
        stop();
        off();
      };
    },
    { scope: stageRef },
  );

  return (
    <section id="top" ref={trackRef} aria-label="Introduction" className="hero-track relative">
      <div ref={stageRef} className="hero-stage relative">
        {/* the planning table */}
        <div aria-hidden className="dot-grid absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_45%,#000_20%,transparent_80%)]" />
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 -ml-[360px] -mt-[360px] h-[720px] w-[720px] rounded-full opacity-0 [background:radial-gradient(circle,rgba(45,74,224,0.11),rgba(45,74,224,0)_62%)]"
        />

        {/* The pitch */}
        <div
          ref={copyRef}
          className="hero-copy flex flex-col items-center justify-center px-[var(--gutter)] pb-16 pt-[calc(var(--nav-h)+28px)] text-center max-md:min-h-[100svh] md:min-h-[100svh] md:pt-[calc(var(--nav-h)+40px)]"
        >
          <p className="t-eyebrow max-sm:text-[0.64rem] max-sm:tracking-[0.1em]" data-reveal style={{ "--reveal-delay": "0.05s" } as CSSProperties}>
            {HERO.eyebrow}
          </p>
          <Split as="h1" lines={HERO.headline} accent={HERO.accentLine} className="t-hero mt-6 md:mt-8" delay={0.1} />
          <p className="t-lead mt-7 max-w-[40rem] md:mt-9" data-reveal style={{ "--reveal-delay": "0.45s" } as CSSProperties}>
            {HERO.lead}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3" data-reveal style={{ "--reveal-delay": "0.6s" } as CSSProperties}>
            <AnchorButton href={HERO.primary.href}>{HERO.primary.label}</AnchorButton>
            <AnchorButton href={HERO.secondary.href} variant="ghost" arrow="down">
              {HERO.secondary.label}
            </AnchorButton>
          </div>
          <p className="t-small mt-6" data-reveal style={{ "--reveal-delay": "0.75s" } as CSSProperties}>
            {HERO.reassurance}
          </p>
        </div>

        {/* The sorted board */}
        <div className="hero-board flex flex-col items-center justify-center px-[var(--gutter)] pb-10 pt-[calc(var(--nav-h)+8px)] max-md:pb-6">
          <div className="board-head text-center">
            <p className="t-eyebrow">{BOARD.eyebrow}</p>
            <h2 className="t-h3 mt-3 md:mt-4 md:text-[clamp(2.4rem,3.7vw,3.4rem)]">
              {BOARD.headline[0]} <em>{BOARD.headline[1]}</em>
            </h2>
            <p className="t-body mx-auto mt-3 max-w-[36rem] max-md:hidden [@media(max-height:720px)]:hidden">{BOARD.lead}</p>
          </div>

          <div className="mt-6 grid w-full max-w-[1060px] gap-x-5 gap-y-4 md:mt-9 md:grid-cols-3">
            {BOARD.lanes.map((lane) => (
              <div key={lane.id}>
                <h3 className="lane-head mb-2.5 flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-2)] md:mb-3.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: LANE_STYLE[lane.id].color }} />
                  {lane.title}
                </h3>
                <ul className="grid gap-2 md:gap-2.5">
                  {BOARD.chips
                    .filter((chip) => chip.lane === lane.id)
                    .map((chip) => (
                      <li key={chip.id} className={cn(chip.desktopOnly && "max-md:hidden")}>
                        <div className="chip-mover will-change-transform" data-chip={chip.id}>
                          <div className="chip-drift" style={{ "--drift-delay": `${(FLY_ORDER.get(chip.id) ?? 0) * -0.9}s` } as CSSProperties}>
                            <div className="chip-inner">
                              <Chip chip={chip} />
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div ref={cueRef} aria-hidden className="hero-cue pointer-events-none absolute inset-x-0 bottom-6 z-[4] flex flex-col items-center gap-2 max-md:hidden">
          <span className="text-[0.78rem] tracking-[-0.005em] text-[var(--ink-3)]">{HERO.cue}</span>
          <span className="cue-bob grid h-8 w-8 place-items-center rounded-full border border-[var(--line-strong)] text-[var(--ink-2)]">
            <Icon name="arrowDown" size={14} strokeWidth={1.8} />
          </span>
        </div>
      </div>
    </section>
  );
}
