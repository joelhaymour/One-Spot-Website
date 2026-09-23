"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { HERO } from "@/content/copy";
import { EASE, gsap } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { easeInOutCubic, easeOutCubic, segment } from "@/lib/math";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useExperience } from "@/state/experience";
import { useOnScreen, useSvgUnit } from "@/components/process/hooks";
import diagram from "@/components/process/diagram.module.css";
import css from "./hero.module.css";
import { ToolGlyph } from "./ToolGlyph";
import { DWELL, HOPS, HUB, RING_RADIUS, THREADS, TOOLS, VIEW, YOU, lerpPt, threadPath, translate } from "./layout";

/**
 * Same eight tools, two companies, on a clock.
 *
 *   before  a tangle, and attention jumping between tools
 *   morph   one 1.5 s move, driven by a single number (tiles glide, lines relax, the middle changes hands)
 *   after   agents sit on the connections, "You" are connected to the centre by one line, work flows in calmly
 *   fade    the whole drawing goes dark: the company is never seen tangling back up
 *   in      the drawing returns, already a tangle again, and the loop repeats
 *
 * Time-based, never scroll-driven. One timer sets a discrete phase; CSS and one gsap tween do the motion
 * inside it. The loop waits for the opening logo sequence to lift, then holds (timer cleared, picture kept)
 * off screen, in a hidden tab and under "Pause motion". Reduced motion shows the after state as a still.
 * Server HTML is the before still, plus an after still that CSS shows instead under reduced motion.
 */

type Phase = "before" | "morph" | "after" | "fade" | "in";

/** Held phases, ms. The morph has no entry: it lasts as long as its tween (MORPH_SECONDS). */
const DURATION: Record<Exclude<Phase, "morph">, number> = { before: 2600, after: 6500, fade: 600, in: 600 };
const NEXT: Record<Phase, Phase> = { before: "morph", morph: "after", after: "fade", fade: "in", in: "before" };
const MORPH_SECONDS = 1.5;
const THREAD = "rgba(255, 255, 255, 0.17)";
const STATES = ["before", "after"] as const;

const markTransform = (scale: number) => `${translate(HUB.b)} scale(${scale.toFixed(3)})`;

const subscribeHidden = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};
const useDocumentHidden = () =>
  useSyncExternalStore(
    subscribeHidden,
    () => document.hidden,
    () => false,
  );

/** A tool tile with its label. `index` marks the live copy the morph moves (and gives it its flash ring). */
function TileNode({ tool, at, index }: { tool: (typeof TOOLS)[number]; at: readonly [number, number]; index?: number }) {
  return (
    <g data-tile={index} transform={translate(at)}>
      <g className={diagram.glyph}>
        <rect x="-26" y="-26" width="52" height="52" rx="13" fill="var(--bg-2)" stroke="var(--line-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {index !== undefined && (
          <rect data-flash x="-26" y="-26" width="52" height="52" rx="13" fill="none" stroke="var(--text-0)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" style={{ opacity: 0 }} />
        )}
        <ToolGlyph name={tool.label} />
      </g>
      <text className={diagram.label} textAnchor="middle" style={{ transform: "translate(0, calc(var(--k) * 26px + var(--u) * 15px))" }}>
        {tool.label}
      </text>
    </g>
  );
}

/** One Spot, in the middle. */
function MarkGlyph() {
  return (
    <>
      <g className={diagram.glyph}>
        <circle r="36" fill="rgba(var(--spot-rgb), 0.05)" />
        <circle r="23" fill="var(--void)" stroke="var(--text-0)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        <circle r="5.8" fill="var(--spot)" />
      </g>
      <text className={cn(diagram.label, diagram.labelStrong)} style={{ transform: "translate(calc(var(--k) * 23px + var(--u) * 9px), calc(var(--u) * 3.5px))" }}>
        One Spot
      </text>
    </>
  );
}

/** The owner. */
function YouGlyph() {
  return (
    <>
      <g className={diagram.glyph}>
        <circle r="13" fill="var(--void)" />
        <circle r="6.5" fill="var(--text-0)" />
      </g>
      <text className={cn(diagram.label, diagram.labelStrong)} style={{ transform: "translate(calc(var(--k) * 6.5px + var(--u) * 8px), calc(var(--u) * 3.5px))" }}>
        You
      </text>
    </>
  );
}

/** An agent's spot on a connection. */
function AgentDot() {
  return (
    <g className={diagram.glyph}>
      <circle r="7" fill="rgba(var(--spot-rgb), 0.1)" />
      <circle r="2.6" fill="var(--spot)" />
    </g>
  );
}

export function HeroTools({ className }: { className?: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const morph = useRef({ p: 0 });
  const tween = useRef<gsap.core.Tween | null>(null);
  // The clock's own copy of the phase: what a resume continues from, read only outside render.
  const phaseRef = useRef<Phase>("before");
  // What the morph does when it lands: the running clock's own step to `after`. Null while the clock is stopped.
  const morphDone = useRef<(() => void) | null>(null);

  const reduced = useReducedMotion();
  const hidden = useDocumentHidden();
  const paused = useExperience((s) => s.paused);
  const intro = useExperience((s) => s.intro);
  const { onScreen } = useOnScreen(frame);
  useSvgUnit(frame, VIEW.w);

  const [phase, setPhase] = useState<Phase>("before");
  // True once the morph has landed. The after-state details wait for it, however the clock was interrupted.
  const [formed, setFormed] = useState(false);
  // True once the morph has passed its midpoint: the caption swaps there, not when the move ends.
  const [half, setHalf] = useState(false);

  /** One frame of the morph. Every sub-move is a window on the same clock. */
  const apply = useCallback((p: number) => {
    const root = svg.current;
    if (!root) return;
    const lift = easeInOutCubic(segment(p, 0, 0.55));
    const glide = easeInOutCubic(segment(p, 0.08, 0.9));
    const melt = 1 - segment(p, 0.62, 0.92);
    const arrive = easeOutCubic(segment(p, 0.66, 1));

    root.querySelector("[data-you]")?.setAttribute("transform", translate(lerpPt(YOU.a, YOU.b, lift)));
    root.querySelectorAll("[data-tile]").forEach((el, i) => el.setAttribute("transform", translate(lerpPt(TOOLS[i].a, TOOLS[i].b, glide))));
    root.querySelectorAll("[data-thread]").forEach((el, i) => {
      el.setAttribute("d", threadPath(THREADS[i], glide));
      if (THREADS[i].kind === "cross") el.setAttribute("opacity", melt.toFixed(3));
    });
    const mark = root.querySelector("[data-mark]");
    mark?.setAttribute("transform", markTransform(0.84 + 0.16 * arrive));
    mark?.setAttribute("opacity", arrive.toFixed(3));
    root.querySelector("[data-orbit]")?.setAttribute("opacity", arrive.toFixed(3));
  }, []);

  /** The move, from wherever p is now to 1. Time is proportional, so a resumed morph keeps its pace. */
  const startMorph = useCallback(() => {
    const state = morph.current;
    tween.current?.kill();
    let past = false;
    tween.current = gsap.to(state, {
      p: 1,
      duration: Math.max(0.05, MORPH_SECONDS * (1 - state.p)),
      ease: "none",
      onUpdate: () => {
        apply(state.p);
        if (!past && state.p >= 0.5) {
          past = true;
          setHalf(true);
        }
      },
      onComplete: () => {
        tween.current = null;
        setFormed(true);
        // The picture and the phase share one clock: `after` begins when the move has landed, not on a timer.
        morphDone.current?.();
      },
    });
  }, [apply]);

  const running = intro === "done" && onScreen && !hidden && !paused && !reduced;

  // The clock. Each held phase is one timer; the morph ends when its tween lands. A pause clears the timer
  // and keeps the picture; a resume restarts the current held phase in full, or lets a paused morph play on.
  useEffect(() => {
    if (!running) return;
    let timer = 0;
    const go = (next: Phase) => {
      if (next === "in") {
        // invisible now: cut straight back to the tangle
        tween.current?.kill();
        tween.current = null;
        morph.current.p = 0;
        apply(0);
        setFormed(false);
        setHalf(false);
      }
      phaseRef.current = next;
      setPhase(next);
      if (next === "morph") startMorph();
      else timer = window.setTimeout(() => go(NEXT[next]), DURATION[next]);
    };
    morphDone.current = () => go("after");
    const current = phaseRef.current;
    if (current === "morph") {
      if (tween.current) tween.current.play();
      else startMorph();
    } else {
      timer = window.setTimeout(() => go(NEXT[current]), DURATION[current]);
    }
    return () => {
      window.clearTimeout(timer);
      morphDone.current = null;
      tween.current?.pause();
    };
  }, [running, apply, startMorph]);

  // Reduced motion: the after geometry, as a still (the render shows its details from `reduced` alone).
  // Should the preference lift again, the picture goes back to whatever phase the clock will resume.
  useEffect(() => {
    if (!reduced) return;
    const state = morph.current;
    tween.current?.kill();
    tween.current = null;
    state.p = 1;
    apply(1);
    return () => {
      const current = phaseRef.current;
      if (current === "before" || current === "in") {
        state.p = 0;
        apply(0);
      }
    };
  }, [reduced, apply]);

  useEffect(
    () => () => {
      tween.current?.kill();
    },
    [],
  );

  // Before: attention jumps from tool to tool. Quick slews, uneven dwell, never at rest.
  // (The reduced-motion still is the after state whatever phase the clock stopped in, so no attention there.)
  const tangled = !reduced && (phase === "before" || phase === "in");
  const frantic = running && tangled;
  useEffect(() => {
    const root = svg.current;
    const focus = root?.querySelector("[data-focus]");
    if (!frantic || !root || !focus) return;
    const flashes = Array.from(root.querySelectorAll("[data-flash]"));
    gsap.set(focus, { x: TOOLS[0].a[0], y: TOOLS[0].a[1] });
    const tl = gsap.timeline({ repeat: -1 });
    let at = 0;
    HOPS.forEach((tool, n) => {
      at += DWELL[n % DWELL.length];
      tl.to(focus, { x: TOOLS[tool].a[0], y: TOOLS[tool].a[1], duration: 0.16, ease: EASE.ui }, at);
      at += 0.16;
      if (flashes[tool]) tl.fromTo(flashes[tool], { opacity: 0.85 }, { opacity: 0, duration: 0.45, ease: "power1.out", immediateRender: false }, at);
    });
    return () => {
      tl.kill();
      gsap.set(flashes, { opacity: 0 });
    };
  }, [frantic]);

  // After: one piece of work at a time travels from a tool, through its agent, to the centre.
  // It keeps going under the fade, so nothing vanishes mid-flight; the reset clears it unseen.
  const flowing = running && formed && (phase === "after" || phase === "fade");
  useEffect(() => {
    const bead = svg.current?.querySelector("[data-bead]");
    if (!flowing || !bead) return;
    const tl = gsap.timeline({ repeat: -1, delay: 1.6 });
    TOOLS.forEach((tool, i) => {
      const at = i * 1.8;
      tl.set(bead, { x: tool.b[0], y: tool.b[1] }, at)
        .to(bead, { opacity: 1, duration: 0.25, ease: "power1.out" }, at)
        .to(bead, { x: HUB.b[0], y: HUB.b[1], duration: 1.25, ease: "power2.inOut" }, at)
        .to(bead, { opacity: 0, duration: 0.25, ease: "power1.in" }, at + 1);
    });
    return () => {
      tl.kill();
      gsap.set(bead, { opacity: 0 });
    };
  }, [flowing]);

  const settled = reduced || formed;
  // The fade is a live phase only: a pause during it brings the picture back rather than freezing it dark.
  const out = running && phase === "fade";
  const current = reduced || phase === "after" || phase === "fade" || (phase === "morph" && half) ? "after" : "before";

  /** An after-state detail: fades in with a stagger once the morph lands, cuts out behind the fade. */
  const detail = (delay: number): CSSProperties => ({
    opacity: settled ? 1 : 0,
    transitionDelay: settled ? `${delay}ms` : "0ms",
    transitionDuration: settled ? undefined : "0ms",
  });

  return (
    <div className={cn(css.root, className)}>
      {/* the drawing is hidden from assistive tech; this is the whole of it */}
      <p className="sr-only">{HERO.overview}</p>

      <div ref={frame} className={cn(diagram.frame, css.drawing, out && css.drawingOut)}>
        <svg ref={svg} viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className={diagram.svg} aria-hidden focusable="false">
          {/* Reduced motion: the after picture as server HTML, so the script's arrival changes nothing on screen.
              CSS swaps this group in for the live one (hero.module.css). */}
          <g className={css.still}>
            <circle cx={HUB.b[0]} cy={HUB.b[1]} r={RING_RADIUS} fill="none" stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            {TOOLS.map((tool) => (
              <line key={tool.label} x1={HUB.b[0]} y1={HUB.b[1]} x2={tool.b[0]} y2={tool.b[1]} stroke={THREAD} strokeWidth="1" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            ))}
            <line x1={YOU.b[0]} y1={YOU.b[1]} x2={HUB.b[0]} y2={HUB.b[1]} stroke="rgba(var(--spot-rgb), 0.5)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            {TOOLS.map((tool) => (
              <g key={tool.label} transform={translate(tool.agentAt)}>
                <AgentDot />
              </g>
            ))}
            {TOOLS.map((tool) => (
              <TileNode key={tool.label} tool={tool} at={tool.b} />
            ))}
            <g transform={markTransform(1)}>
              <MarkGlyph />
            </g>
            <g transform={translate(YOU.b)}>
              <YouGlyph />
            </g>
          </g>

          <g className={css.live}>
          <circle
            data-orbit
            cx={HUB.b[0]}
            cy={HUB.b[1]}
            r={RING_RADIUS}
            fill="none"
            stroke="var(--line)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            opacity="0"
          />

          {THREADS.map((thread) => (
            <path
              key={thread.id}
              data-thread={thread.id}
              d={threadPath(thread, 0)}
              fill="none"
              stroke={THREAD}
              strokeWidth="1"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              opacity="1"
            />
          ))}

          {/* the one line that is left between you and the company */}
          <line
            x1={YOU.b[0]}
            y1={YOU.b[1]}
            x2={HUB.b[0]}
            y2={HUB.b[1]}
            stroke="rgba(var(--spot-rgb), 0.5)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            className={diagram.fade}
            style={detail(200)}
          />

          {TOOLS.map((tool) => (
            <g key={tool.label} transform={translate(tool.agentAt)} className={diagram.fade} style={detail(500 + tool.index * 90)}>
              <AgentDot />
            </g>
          ))}

          <circle data-bead r="3" fill="var(--spot)" opacity="0" />

          {TOOLS.map((tool) => (
            <TileNode key={tool.label} tool={tool} at={tool.a} index={tool.index} />
          ))}

          <g data-mark transform={markTransform(0.84)} opacity="0">
            <MarkGlyph />
          </g>

          <g data-you transform={translate(YOU.a)}>
            <YouGlyph />
          </g>

          {/* attention: fades out as the morph begins, and is simply there again after the cut */}
          <g className={diagram.fade} style={{ opacity: tangled ? 1 : 0, transitionDuration: tangled ? "0ms" : undefined }}>
            <g data-focus transform={translate(TOOLS[0].a)}>
              <g className={diagram.glyph}>
                <circle cx="21" cy="-21" r="8" fill="rgba(var(--spot-rgb), 0.14)" />
                <circle cx="21" cy="-21" r="3.4" fill="var(--spot)" />
              </g>
            </g>
          </g>
          </g>
        </svg>
      </div>

      {/* the caption, a picture's title: the SR line above already says all of it */}
      <div aria-hidden className={css.caption}>
        {STATES.map((key) => (
          <p key={key} className={cn(css.state, key === "after" ? css.stateAfter : css.stateBefore, current === key && css.stateOn)}>
            <span className="t-label">{HERO.states[key].label}</span>
            <span className={css.stateText}>{HERO.states[key].text}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
