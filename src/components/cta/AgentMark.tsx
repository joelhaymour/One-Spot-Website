"use client";

import { useEffect, useRef, useState } from "react";
import { CEO } from "@/content/departments";
import { SITE } from "@/content/copy";
import { AgentSlot } from "@/components/agent/AgentSlot";
import { AgentSvg } from "@/components/agent/AgentSvg";
import { useExperience } from "@/state/experience";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";

/**
 * The closing beat: the CEO Agent becomes the logo.
 *
 *   agent    it stands, idle
 *   forming  it goes still (mood "think"); the mark's ring draws around its Spot; the body lets go
 *   rest     the mark slews down to sit above the copy as the brand, and the wordmark joins it
 *
 * One thing moves at a time.
 */
type Phase = "agent" | "forming" | "rest";

const HOLD_MS = 1300;
const FORM_MS = 1700;

/** Same geometry as <Mark>: r 10.2 in a 24 box. */
const RING_R = 10.2;
const RING_LENGTH = 2 * Math.PI * RING_R;

/** The CEO Agent's Spot sits 23% down its frame (AgentSvg: homeY 92 of 400). The ring forms there. */
const AT_SPOT = "translate3d(calc((var(--w) - var(--m)) / 2), calc(var(--h) * 0.23 - var(--m) / 2), 0)";
const AT_REST = "translate3d(0, calc(var(--h) - var(--m)), 0)";

export function AgentMark({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [phase, setPhase] = useState<Phase>("agent");
  const reduced = useReducedMotion();
  const paused = useExperience((s) => s.paused);
  const tier = useExperience((s) => s.tier);
  // Final state, no journey: reduced motion, "Pause motion", and the static tier.
  const shown: Phase = reduced || paused || tier === "static" ? "rest" : phase;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const timers: number[] = [];

    // The 3D agent is only worth a WebGL context once the visitor is about to see it.
    const approach = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        approach.disconnect();
      },
      { rootMargin: "100% 0px" },
    );
    const arrive = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        arrive.disconnect();
        timers.push(window.setTimeout(() => setPhase("forming"), HOLD_MS));
        timers.push(window.setTimeout(() => setPhase("rest"), HOLD_MS + FORM_MS));
      },
      { threshold: 0.6 },
    );
    approach.observe(el);
    arrive.observe(el);
    return () => {
      approach.disconnect();
      arrive.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const formed = shown !== "agent";
  const resting = shown === "rest";

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`The ${CEO.name} becomes the ${SITE.name} mark`}
      className={cn("relative h-[var(--h)] w-[var(--w)] [--h:160px] [--m:40px] [--w:128px] md:[--h:190px] md:[--m:44px] md:[--w:152px]", className)}
    >
      {!resting && (
        <div
          className="absolute inset-0 origin-[50%_23%] transition-[opacity,transform] duration-[900ms] ease-[var(--ease-in-out)]"
          style={{ opacity: formed ? 0 : 1, transform: formed ? "scale(0.9)" : "none", transitionDelay: formed ? "700ms" : "0ms" }}
        >
          {near ? (
            <AgentSlot agent="ceo" mood={formed ? "think" : "idle"} className="h-full w-full" />
          ) : (
            <AgentSvg agent="ceo" accent={CEO.accent} mood="idle" />
          )}
        </div>
      )}

      <div
        className="absolute left-0 top-0 h-[var(--m)] w-[var(--m)] text-[var(--text-0)] transition-transform duration-[1200ms] ease-[var(--ease-in-out)]"
        style={{ transform: resting ? AT_REST : AT_SPOT }}
      >
        <svg viewBox="0 0 24 24" className="block h-full w-full -rotate-90 overflow-visible">
          <circle
            cx="12"
            cy="12"
            r={RING_R}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeOpacity="0.9"
            strokeDasharray={RING_LENGTH}
            className="transition-[stroke-dashoffset] duration-[1100ms] ease-[var(--ease-in-out)]"
            style={{ strokeDashoffset: formed ? 0 : RING_LENGTH }}
          />
          <circle
            cx="12"
            cy="12"
            r="2.6"
            fill="var(--spot)"
            className="transition-opacity duration-[600ms] ease-[var(--ease-out)]"
            style={{ opacity: formed ? 1 : 0, transitionDelay: formed ? "900ms" : "0ms" }}
          />
        </svg>
      </div>

      <span
        className="absolute bottom-0 left-[calc(var(--m)_+_12px)] flex h-[var(--m)] items-center whitespace-nowrap text-[1.0625rem] font-medium tracking-[-0.02em] text-[var(--text-0)] transition-opacity duration-[480ms] ease-[var(--ease-out)]"
        style={{ opacity: resting ? 1 : 0, transitionDelay: resting ? "900ms" : "0ms" }}
      >
        {SITE.name}
      </span>
    </div>
  );
}
