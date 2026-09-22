"use client";

import { HERO } from "@/content/copy";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { CEO, type AgentMood } from "@/content/departments";
import { RECOMMENDATIONS } from "@/content/hud";
import { AgentSlot } from "@/components/agent/AgentSlot";
import { ToolGlyph } from "@/components/beforeafter/ToolGlyph";
import { useSvgUnit } from "@/components/process/hooks";
import diagram from "@/components/process/diagram.module.css";
import { StatusChip } from "@/components/ui/Panel";
import { TypedText } from "@/components/ui/TypedText";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useExperience } from "@/state/experience";
import css from "./overview.module.css";
import { AGENT_FOOT_Y, AGENT_RING_FRONT, CARD_TOP_Y, HUB, HUB_GLOW_R, HUB_R, ORBIT, STEM_END_Y, TOOLS, VIEW, translate } from "./overviewLayout";

/**
 * The connected business, in nine seconds, without reading: the software you already have feeds one
 * hub, the hub feeds the CEO Agent, the CEO Agent hands you one recommendation.
 *
 *   rest     the tools stand on the floor (server HTML)
 *   enter    threads draw on from each tool to the hub, staggered
 *   flow     beads travel the threads in; the hub's glow rises as they land
 *   rise     the stem connects hub and agent; one bead climbs it; the agent thinks
 *   deliver  the agent transmits; the recommendation slides in and is typed
 *   hold     nothing moves
 *   reset    the card and the glow let go; the loop returns to `flow`, threads staying drawn
 *
 * Time-based, never scroll-driven. One timer sets a discrete phase; CSS does the motion inside it.
 * Off-screen, hidden tab, "Pause motion" and reduced motion all show the final still instead.
 */

type Phase = "rest" | "enter" | "flow" | "rise" | "deliver" | "hold" | "reset";

const ORDER: readonly Phase[] = ["rest", "enter", "flow", "rise", "deliver", "hold", "reset"];
const DURATION: Record<Phase, number> = { rest: 250, enter: 950, flow: 2800, rise: 1200, deliver: 3800, hold: 2500, reset: 700 };
const NEXT: Record<Phase, Phase> = { rest: "enter", enter: "flow", flow: "rise", rise: "deliver", deliver: "hold", hold: "reset", reset: "flow" };

const reached = (phase: Phase, at: Phase) => ORDER.indexOf(phase) >= ORDER.indexOf(at);

interface Loop {
  phase: Phase;
  /** times `flow` has begun; from the second pass every line is already drawn */
  pass: number;
  /** one halo stroke on the agent each time a recommendation lands */
  pulses: number;
  /** the observation has finished typing; the action line may follow */
  typed: boolean;
}

const AT_REST: Loop = { phase: "rest", pass: 0, pulses: 0, typed: false };

function advance(s: Loop, phase: Phase, resume: boolean): Loop {
  return {
    phase,
    pass: phase === "flow" ? Math.max(s.pass + 1, resume ? 2 : 0) : s.pass,
    pulses: phase === "deliver" ? s.pulses + 1 : s.pulses,
    typed: phase === "flow" ? false : s.typed,
  };
}

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

const ACTIONS = ["Approve", "Review", "Not now"] as const;
const RECOMMENDATION = RECOMMENDATIONS[0];

const STAGE_VARS = {
  "--foot": AGENT_FOOT_Y,
  "--stem": STEM_END_Y - AGENT_FOOT_Y,
  "--ring-front": AGENT_RING_FRONT,
  "--card-top": VIEW.h - CARD_TOP_Y,
} as CSSProperties;

export function HeroOverview({ className }: { className?: string }) {
  const id = useId();
  const frame = useRef<HTMLDivElement>(null);
  useSvgUnit(frame, VIEW.w);

  const reduced = useReducedMotion();
  const hidden = useDocumentHidden();
  const paused = useExperience((s) => s.paused);
  /** null until the observer has spoken: the loop may start before it does, never the still. */
  const [seen, setSeen] = useState<boolean | null>(null);
  const [loop, setLoop] = useState<Loop>(AT_REST);
  // True once the drawing has been shown with its lines on (a first pass, or any final still).
  const started = useRef(false);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setSeen(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const final = reduced || paused || hidden || seen === false;

  useEffect(() => {
    if (final) {
      started.current = true;
      return;
    }
    const resume = started.current;
    let timer = 0;
    const go = (phase: Phase) => {
      if (phase === "flow") started.current = true;
      setLoop((s) => advance(s, phase, resume));
      timer = window.setTimeout(() => go(NEXT[phase]), DURATION[phase]);
    };
    timer = window.setTimeout(() => go(resume ? "flow" : "enter"), resume ? 0 : DURATION.rest);
    return () => window.clearTimeout(timer);
  }, [final]);

  const onTyped = useCallback(() => setLoop((s) => (s.typed ? s : { ...s, typed: true })), []);

  const { phase, pass, pulses, typed } = loop;
  const live = !final;
  const drawn = final || phase !== "rest";
  const stemOn = final || pass >= 2 || reached(phase, "rise");
  const flowing = live && phase === "flow";
  const rising = live && phase === "rise";
  const landed = live && (phase === "deliver" || phase === "hold");
  const fed = live && reached(phase, "flow") && phase !== "reset";
  const cardOn = final || phase === "deliver" || phase === "hold";
  const cardOut = live && phase === "reset";
  const typing = final || reached(phase, "deliver");
  const showAction = final || typed;
  const mood: AgentMood = final ? "idle" : phase === "flow" ? "observe" : phase === "rise" ? "think" : phase === "deliver" || phase === "hold" ? "transmit" : "idle";

  return (
    <div className={cn(css.root, className)}>
      <p className="sr-only">{HERO.overview}</p>

      <div ref={frame} className={css.frame}>
        <div
          className={cn(
            css.stage,
            drawn && css.drawn,
            flowing && css.flowing,
            fed && css.fed,
            rising && css.rising,
            landed && css.landed,
            // The floor dims while the live loop delivers; the final still keeps every tool legible.
            live && cardOn && css.receded,
            cardOn && css.cardOn,
            cardOut && css.cardOut,
          )}
          style={STAGE_VARS}
        >
          <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className={css.svg} aria-hidden focusable="false">
            <defs>
              <radialGradient id={`${id}-glow`}>
                <stop offset="0" style={{ stopColor: "rgb(var(--spot-rgb))", stopOpacity: 0.14 }} />
                <stop offset="0.45" style={{ stopColor: "rgb(var(--spot-rgb))", stopOpacity: 0.05 }} />
                <stop offset="1" style={{ stopColor: "rgb(var(--spot-rgb))", stopOpacity: 0 }} />
              </radialGradient>
            </defs>

            <g className={css.floor}>
              {/* the floor ring the tools stand on */}
              <ellipse cx={HUB[0]} cy={HUB[1]} rx={ORBIT.rx} ry={ORBIT.ry} fill="none" stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />

              {TOOLS.map((tool) => (
                <path key={tool.label} d={tool.path} pathLength={1} fill="none" strokeLinecap="round" className={css.thread} style={{ "--i": tool.order } as CSSProperties} />
              ))}

              {/* beads run under the tiles and into the hub */}
              {TOOLS.map((tool) => (
                <circle key={tool.label} r="3" fill="var(--spot)" className={css.bead} style={{ "--i": tool.order, offsetPath: `path("${tool.path}")` } as CSSProperties} />
              ))}

              {TOOLS.map((tool) => (
                <g key={tool.label} transform={translate(tool.at)}>
                  <g className={diagram.glyph}>
                    <rect x="-26" y="-26" width="52" height="52" rx="13" fill="var(--bg-2)" stroke="var(--line-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                    <ToolGlyph name={tool.label} />
                  </g>
                  <text className={diagram.label} textAnchor="middle" style={{ transform: "translate(0, calc(var(--k) * 26px + var(--u) * 15px))" }}>
                    {tool.label}
                  </text>
                </g>
              ))}
            </g>

            {/* the hub: the mark, slightly larger than a tile, with a soft glow that rises as it is fed */}
            <g transform={translate(HUB)}>
              <g className={diagram.glyph}>
                <circle r={HUB_GLOW_R} fill={`url(#${id}-glow)`} />
                <circle r={HUB_GLOW_R} fill={`url(#${id}-glow)`} className={css.glowUp} />
                <circle r={HUB_R} fill="var(--void)" stroke="var(--text-0)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
                <circle r="6.4" fill="var(--spot)" />
              </g>
              <text className={cn(diagram.label, diagram.labelStrong)} style={{ transform: `translate(calc(var(--k) * ${HUB_R}px + var(--u) * 9px), calc(var(--u) * 3.5px))` }}>
                One Spot
              </text>
            </g>
          </svg>

          {/* the CEO Agent stands at the back of the floor */}
          <div className={css.agent}>
            <AgentSlot agent="ceo" mood={mood} pulseCount={pulses} className="h-full w-full" deferMs={600} />
          </div>

          {/* the stem: hub to the front of the register ring, over the glass, as in the network */}
          <div className={cn(css.stem, stemOn && css.stemOn)} aria-hidden>
            <div className={css.rise} />
            <div className={css.dock} />
          </div>

          {/* the recommendation. A picture of a decision, not a control: nothing here takes focus. */}
          <div className={css.cardHost}>
            <div role="group" aria-label={`To you, from the ${CEO.name}`} className={cn("glass rounded-[14px] p-4", css.card)}>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2.5">
                  <span className="spot" />
                  <span className="t-label !text-[var(--text-0)]">To you</span>
                </span>
                <span className="t-label">{CEO.name}</span>
              </div>
              <div className="mt-2.5">
                <StatusChip tone="neutral">{RECOMMENDATION.tag}</StatusChip>
              </div>
              <p className="t-num mt-2.5 leading-snug tracking-[-0.01em] text-[var(--text-1)]" style={{ fontSize: "var(--fs)" }}>
                {final ? RECOMMENDATION.observation : <TypedText text={RECOMMENDATION.observation} active={typing} speed={70} delay={0.32} onDone={onTyped} />}
              </p>
              <p
                className={cn(
                  "mt-1.5 font-medium leading-snug tracking-[-0.012em] text-[var(--text-0)] transition-opacity duration-[480ms] ease-[var(--ease-out)]",
                  showAction ? "opacity-100" : "opacity-0",
                )}
                style={{ fontSize: "var(--fs)" }}
              >
                {RECOMMENDATION.action}
              </p>
              {/* A picture of a decision: the description and the typed recommendation already carry the meaning. */}
              <div aria-hidden className="mt-3.5 flex flex-wrap gap-2">
                {ACTIONS.map((label, i) => (
                  <span
                    key={label}
                    className={cn(
                      "h-7 cursor-default whitespace-nowrap rounded-[7px] border px-2.5 text-[0.75rem]",
                      i === 0 ? "border-transparent bg-[var(--text-0)] font-medium text-[#08090b]" : "border-[var(--line-strong)] text-[var(--text-1)]",
                    )}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
