"use client";

import { memo, useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { SITE } from "@/content/copy";
import { EASE, gsap } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { easeInOutCubic, easeOutCubic, segment } from "@/lib/math";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useExperience } from "@/state/experience";
import { useOnScreen, useSvgUnit } from "./hooks";
import css from "./diagram.module.css";
import pcss from "./process.module.css";
import {
  AGENTS,
  CANDIDATE,
  CLUSTER_LABELS,
  FLOOR_Y,
  FRICTION,
  HANDOFFS,
  HUB,
  LINKS,
  MEMBERS,
  MOVERS,
  NEEDS_YOU,
  NEEDS_YOU_Y,
  PULSE_ROUTES,
  REMEDY,
  REMEDY_COUNT,
  REMEDY_ORDER,
  VIEW,
  linkPath,
  pointOnCubic,
  positionAt,
  translate,
  type FrictionPoint,
  type LinkKind,
  type MapLink,
  type Remedy,
} from "./mapData";

/**
 * One drawing of one company, carried through all six steps.
 * Step state is pure CSS (opacity, colour, small transforms). The only scripted motion is the
 * re-organisation in step 4, where a single number drives every node and link, and the slow pulse in step 6.
 */

const HOURS_RETURNED = 14;

const LINE = "rgba(255, 255, 255, 0.15)";
const LINE_FAINT = "rgba(255, 255, 255, 0.11)";
const LINE_WIRED = "rgba(255, 255, 255, 0.34)";
const LINE_HUB = "rgba(var(--spot-rgb), 0.42)";
const LINE_LIVE = "rgba(var(--accent-rgb), 0.8)";
const LINE_WARN = "rgba(255, 179, 71, 0.6)";

const opacityAfter = (ms: number): CSSProperties => ({ transition: `opacity 480ms var(--ease-out) ${ms}ms` });

const AREAS = CLUSTER_LABELS.length;
const RUNNING_ALONE = MEMBERS.length - NEEDS_YOU.length;
const REMEDY_SUMMARY = REMEDY_ORDER.map((r) => `${REMEDY_COUNT[r]} ${REMEDY_COUNT[r] === 1 ? REMEDY[r].one : REMEDY[r].many}`).join(" · ");

/** One telemetry line per step: the drawing's text equivalent. */
const READOUT: ReadonlyArray<{ label: string; value: string }> = [
  { label: "Learning the business", value: `${AREAS} areas found` },
  { label: "Map complete", value: `${AREAS} areas / ${MEMBERS.length} nodes / ${HANDOFFS} handoffs` },
  { label: "Friction, classified", value: `${FRICTION.length} points` },
  { label: "One place", value: "tasks · approvals · workflows · departments · information" },
  { label: "Work assigned", value: REMEDY_SUMMARY },
  { label: SITE.promise, value: `needs you today: ${NEEDS_YOU.length} · running on its own: ${RUNNING_ALONE}` },
];

const FRICTION_LABEL: Record<FrictionPoint["side"], { anchor: "start" | "middle" | "end"; transform: string }> = {
  left: { anchor: "end", transform: "translate(calc(var(--u) * -13px), calc(var(--u) * 3.4px))" },
  right: { anchor: "start", transform: "translate(calc(var(--u) * 13px), calc(var(--u) * 3.4px))" },
  above: { anchor: "middle", transform: "translate(0, calc(var(--u) * -14px))" },
};

/** Links drawn inside the company (they dim together in step 6) versus the Hub's wiring drawn above it. */
const STRUCTURE: ReadonlySet<LinkKind> = new Set<LinkKind>(["intra", "closing", "relation", "hub"]);
const STRUCTURE_LINKS = LINKS.filter((l) => STRUCTURE.has(l.kind));
const WIRING_LINKS = LINKS.filter((l) => !STRUCTURE.has(l.kind));

interface Phase {
  /** the drawing has entered the viewport */
  seen: boolean;
  /** step 2+: relationships drawn, areas labelled */
  mapped: boolean;
  /** step 3: friction lit and classified */
  friction: boolean;
  /** step 4+: the Hub is in place and the map has re-organised around it */
  built: boolean;
  /** step 5+: agents on the floor, automation and integration marks on the spokes */
  working: boolean;
  /** step 6: the system runs; only what needs the owner rises */
  running: boolean;
}

function Wire({ link, phase }: { link: MapLink; phase: Phase }) {
  const { seen, mapped, friction, built, working, running } = phase;
  const common = { fill: "none", strokeWidth: 1, strokeLinecap: "round" as const, vectorEffect: "non-scaling-stroke" as const, "data-link": link.id, d: linkPath(link, 0) };

  switch (link.kind) {
    case "intra":
    case "closing": {
      const visible = seen && !(link.kind === "closing" && built);
      const delay = !visible ? 0 : link.kind === "closing" ? 1500 : 240 + link.order * 80;
      return <path {...common} stroke={LINE_FAINT} style={{ opacity: visible ? 1 : 0, transition: `opacity 600ms var(--ease-out) ${delay}ms` }} />;
    }
    case "relation": {
      // Handoffs are faint until the map is drawn, amber where they carry friction, and leave once the Hub carries them.
      const on = seen && !built;
      const stroke = friction && link.friction ? LINE_WARN : mapped ? LINE : LINE_FAINT;
      const delay = on ? 700 + (mapped ? link.order * 60 : 0) : 0;
      return <path {...common} stroke={stroke} style={{ opacity: on ? (mapped ? 1 : 0.55) : 0, transition: `opacity 600ms var(--ease-out) ${delay}ms, stroke 480ms var(--ease-out)` }} />;
    }
    case "hub":
      // Spokes arrive last, once the columns have settled beneath the Hub.
      return <path {...common} stroke={LINE_HUB} style={{ opacity: built ? 1 : 0, ...opacityAfter(built ? 1900 + link.order * 60 : 0) }} />;
    case "agent":
      return <path {...common} stroke={LINE_LIVE} style={{ opacity: working ? 1 : 0, ...opacityAfter(working ? 320 + link.order * 140 : 0) }} />;
    case "serve":
      return <path {...common} stroke={LINE_WIRED} style={{ opacity: working ? (running ? 0.7 : 1) : 0, ...opacityAfter(working && !running ? 640 + link.order * 140 : 0) }} />;
    case "candidate":
      return <path {...common} stroke="var(--text-1)" strokeDasharray="3 4" style={{ opacity: running ? 1 : 0, ...opacityAfter(running ? 900 : 0) }} />;
  }
}

/* ------------------------------------------------------------------ */
/* Chips and marks                                                     */
/* ------------------------------------------------------------------ */

const CHIP_H = 12;
const CHIP_GAP = 8;
const chipWidth = (word: string) => word.length * 6 + 10;

/** A tiny mono chip. Authored in screen pixels: render it inside a group scaled by --u. */
function Chip({ word, x, y, strong }: { word: string; x: number; y: number; strong?: boolean }) {
  const w = chipWidth(word);
  return (
    <g>
      <rect x={x} y={y} width={w} height={CHIP_H} rx="2" fill="var(--void)" stroke={strong ? "rgba(255, 255, 255, 0.34)" : "rgba(255, 255, 255, 0.2)"} strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <text className={cn(css.chipText, strong && css.chipTextStrong)} x={x + w / 2} y={y + 8.7} textAnchor="middle">
        {word}
      </text>
    </g>
  );
}

/** Where a friction point's classification chip sits, beside or under its label (screen pixels). */
function chipAt(side: FrictionPoint["side"], word: string): { x: number; y: number } {
  const w = chipWidth(word);
  if (side === "left") return { x: -13 - w, y: 7 };
  if (side === "right") return { x: 13, y: 7 };
  return { x: -w / 2, y: -38 };
}

/** The remedy in place: a solid bar (automation), two rings (integration), a re-routed path (redesign), a diamond (stays human). */
function RemedyMark({ kind }: { kind: Remedy }) {
  const stroke = { fill: "none", stroke: "var(--text-0)", strokeWidth: 1.1, vectorEffect: "non-scaling-stroke" as const };
  switch (kind) {
    case "automate":
      return (
        <>
          <circle r="7" fill="var(--void)" />
          <rect x="-6" y="-1.1" width="12" height="2.2" rx="1.1" fill="var(--text-0)" />
        </>
      );
    case "connect":
      return (
        <>
          <circle r="9" fill="var(--void)" />
          <circle cx="-3" r="4" {...stroke} />
          <circle cx="3" r="4" {...stroke} />
        </>
      );
    case "redesign":
      return (
        <>
          <circle r="9" fill="var(--void)" />
          <path d="M-7 3.5H-2.5L2.5 -3.5H7" strokeLinecap="round" strokeLinejoin="round" {...stroke} />
        </>
      );
    case "human":
      return (
        <>
          <rect x="-6.5" y="-6.5" width="13" height="13" transform="rotate(45)" {...stroke} fill="var(--void)" strokeWidth="1" />
          <circle r="2.2" fill="var(--text-0)" />
        </>
      );
    default:
      return null;
  }
}

function Friction({ point, index, phase }: { point: FrictionPoint; index: number; phase: Phase }) {
  const { friction, built, working } = phase;
  // Found in step 3, it rides along while the map re-organises (step 4) and is answered by its remedy in step 5.
  const lingering = built && !working;
  const ringDelay = friction ? (point.rank - 1) * 90 : 0;
  const label = FRICTION_LABEL[point.side];
  const remedy = REMEDY[point.remedy];
  const hasMark = point.remedy !== "agent";
  const markOn = working && hasMark;
  const chip = chipAt(point.side, remedy.chip);
  return (
    <g data-mover={point.id} transform={translate(point.a)}>
      <g style={{ opacity: friction ? 1 : lingering ? 0.38 : 0, ...opacityAfter(ringDelay) }}>
        {/* sized in screen pixels so the rank number always fits the ring */}
        <g style={{ transform: "scale(var(--u))" }}>
          <circle r="7.5" fill="var(--void)" stroke="var(--warn)" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
        </g>
        <text className={cn(css.label, css.labelSmall, css.labelWarn)} textAnchor="middle" dy="0.36em" style={{ stroke: "none" }}>
          {point.rank}
        </text>
      </g>

      {/* the symptom and how it is classified (desktop: on narrow layouts the readout lists them under the drawing) */}
      <g className="max-lg:hidden" style={{ opacity: friction ? 1 : 0, ...opacityAfter(friction ? ringDelay + 220 : 0) }}>
        <text className={cn(css.label, css.labelSmall, css.labelWarn)} textAnchor={label.anchor} style={{ transform: label.transform }}>
          {point.label}
        </text>
        <g style={{ transform: "scale(var(--u))" }}>
          <Chip word={remedy.chip} x={chip.x} y={chip.y} />
        </g>
      </g>

      {hasMark && (
        <g style={{ opacity: markOn ? 1 : 0, ...opacityAfter(markOn ? 300 + index * 90 : 0) }}>
          <g className={css.glyph}>
            <RemedyMark kind={point.remedy} />
          </g>
          <text
            className={cn(css.label, css.labelSmall, "max-lg:hidden")}
            textAnchor="middle"
            style={{ transform: point.markSide === "above" ? "translate(0, calc(var(--k) * -9px - var(--u) * 6px))" : "translate(0, calc(var(--k) * 9px + var(--u) * 13px))" }}
          >
            {remedy.mark}
          </text>
        </g>
      )}
    </g>
  );
}

/** The three chips, laid out once, centred on the Hub (screen pixels). */
const NEEDS_YOU_CHIPS: ReadonlyArray<{ word: string; x: number }> = (() => {
  const widths = NEEDS_YOU.map(chipWidth);
  const total = widths.reduce((a, w) => a + w, 0) + CHIP_GAP * (NEEDS_YOU.length - 1);
  let x = -total / 2;
  return NEEDS_YOU.map((word, i) => {
    const at = x;
    x += widths[i] + CHIP_GAP;
    return { word, x: at };
  });
})();

/** The thin line above the Hub where the few items that need the owner arrive. */
function NeedsYou({ running }: { running: boolean }) {
  const lineStyle: CSSProperties = { opacity: running ? 1 : 0, ...opacityAfter(running ? 300 : 0) };
  return (
    <g transform={`translate(${HUB.b[0]} ${NEEDS_YOU_Y})`}>
      <line x1="-210" y1="0" x2="210" y2="0" stroke="rgba(255, 255, 255, 0.16)" strokeWidth="1" vectorEffect="non-scaling-stroke" style={lineStyle} />
      <text className={cn(css.label, css.labelSmall, css.labelStrong)} x="-210" style={{ ...lineStyle, transform: "translate(0, calc(var(--u) * -7px))" }}>
        Needs you
      </text>
      <g style={{ transform: "scale(var(--u))" }}>
        {NEEDS_YOU_CHIPS.map((chip, i) => {
          const delay = running ? 700 + i * 180 : 0;
          return (
            <g
              key={chip.word}
              style={{
                opacity: running ? 1 : 0,
                transform: running ? "translate(0, 0)" : "translate(0, 22px)",
                transition: `opacity 480ms var(--ease-out) ${delay}ms, transform 640ms var(--ease-out) ${delay}ms`,
              }}
            >
              <Chip word={chip.word} x={chip.x} y={-CHIP_H / 2} strong />
            </g>
          );
        })}
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* The drawing                                                         */
/* ------------------------------------------------------------------ */

function CompanyMapImpl({ step }: { step: number }) {
  const frame = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const metric = useRef<SVGTSpanElement>(null);
  const layout = useRef({ t: 0 });
  const cache = useRef<{ movers: Array<Element | null>; links: Element[][] }>({ movers: [], links: [] });

  const reduced = useReducedMotion();
  const paused = useExperience((s) => s.paused);
  const { onScreen } = useOnScreen(frame);
  // The entrance waits until the drawing is well inside the viewport, so the map is seen to appear.
  const { seen } = useOnScreen(frame, "-30% 0px -30% 0px");
  useSvgUnit(frame, VIEW.w);

  // True once the map has finished re-organising. Step 6 waits for it, however fast the visitor got there.
  const [formed, setFormed] = useState(false);

  const phase: Phase = {
    seen,
    mapped: step >= 1,
    friction: step === 2,
    built: step >= 3,
    working: step >= 4,
    running: step === 5 && (reduced ? true : formed),
  };
  const { built, working, running } = phase;

  useEffect(() => {
    const root = svg.current;
    if (!root) return;
    cache.current = {
      movers: MOVERS.map((n) => root.querySelector(`[data-mover="${n.id}"]`)),
      links: LINKS.map((l) => Array.from(root.querySelectorAll(`[data-link="${l.id}"]`))),
    };
  }, []);

  /** Writes one frame of the re-organisation. React never re-renders these attributes, so the writes persist. */
  const apply = useCallback((t: number) => {
    const { movers, links } = cache.current;
    MOVERS.forEach((node, i) => movers[i]?.setAttribute("transform", translate(positionAt(node, t))));
    LINKS.forEach((link, i) => {
      const d = linkPath(link, t);
      links[i]?.forEach((el) => el.setAttribute("d", d));
    });
  }, []);

  // Step 4: the Hub appears first, then the scattered map slews into calm columns beneath it (and back, when scrolling up).
  useEffect(() => {
    const state = layout.current;
    const target = built ? 1 : 0;
    if (state.t === target) return;
    if (reduced) {
      state.t = target;
      apply(target);
      return;
    }
    const tween = gsap.to(state, {
      t: target,
      duration: 1.3,
      delay: target === 1 ? 0.55 : 0.3,
      ease: EASE.camera,
      onStart: () => setFormed(false),
      onUpdate: () => apply(state.t),
      onComplete: () => setFormed(target === 1),
    });
    return () => {
      tween.kill();
    };
  }, [built, reduced, apply]);

  // Step 5: the hours returned to the owner count up from zero.
  useEffect(() => {
    const el = metric.current;
    if (!el) return;
    const final = HOURS_RETURNED.toFixed(1);
    if (step !== 4 || reduced) {
      el.textContent = final;
      return;
    }
    const state = { v: 0 };
    el.textContent = "0.0";
    const tween = gsap.to(state, {
      v: HOURS_RETURNED,
      duration: 1.8,
      delay: 0.5,
      ease: EASE.settle,
      onUpdate: () => {
        el.textContent = state.v.toFixed(1);
      },
    });
    return () => {
      tween.kill();
    };
  }, [step, reduced]);

  // Step 6: one slow pulse. Hub to the agents, agents into the company, then one bead rises to the "Needs you" line.
  const pulsing = running && onScreen && !paused && !reduced;
  useEffect(() => {
    const root = svg.current;
    if (!pulsing || !root) return;
    const dots = PULSE_ROUTES.map((r) => root.querySelector(`[data-pulse="${r.id}"]`));
    const wave = root.querySelector("[data-hub-wave]");
    const state = { p: 0 };
    const WINDOWS: Record<0 | 1 | 2, readonly [number, number]> = { 0: [0.04, 0.34], 1: [0.36, 0.68], 2: [0.72, 0.9] };
    const place = () => {
      const emit = easeOutCubic(segment(state.p, 0, 0.3));
      wave?.setAttribute("transform", `scale(${(1 + emit * 1.6).toFixed(3)})`);
      wave?.setAttribute("opacity", (segment(state.p, 0, 0.04) * (1 - emit) * 0.55).toFixed(3));
      PULSE_ROUTES.forEach((route, i) => {
        const dot = dots[i];
        if (!dot) return;
        const [from, to] = WINDOWS[route.wave];
        const raw = segment(state.p, from, to);
        const [x, y] = pointOnCubic(route.curve, easeInOutCubic(raw));
        dot.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
        dot.setAttribute("opacity", Math.max(0, Math.min(1, raw * 9, (1 - raw) * 9)).toFixed(3));
      });
    };
    const tween = gsap.to(state, { p: 1, duration: 5.6, ease: "none", repeat: -1, delay: 0.6, onUpdate: place });
    return () => {
      tween.kill();
      wave?.setAttribute("opacity", "0");
      dots.forEach((dot) => dot?.setAttribute("opacity", "0"));
    };
  }, [pulsing]);

  return (
    <div>
      <div ref={frame} className={css.frame}>
        <svg ref={svg} viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className={css.svg} aria-hidden focusable="false">
          {/* the company: structure, nodes and labels. In step 6 it dims together and keeps running underneath. */}
          <g style={{ opacity: running ? 0.62 : 1, transition: "opacity 700ms var(--ease-out)" }}>
            {STRUCTURE_LINKS.map((link) => (
              <Wire key={link.id} link={link} phase={phase} />
            ))}

            {MEMBERS.map((node) => (
              <g key={node.id} data-mover={node.id} transform={translate(node.a)}>
                <g className={css.glyph}>
                  <circle
                    r="2.6"
                    fill={built ? "var(--text-1)" : "var(--text-2)"}
                    style={{ opacity: seen ? 1 : 0, transition: `opacity 600ms var(--ease-out) ${node.clusterIndex * 80}ms, fill 480ms var(--ease-out)` }}
                  />
                </g>
              </g>
            ))}

            {CLUSTER_LABELS.map((label) => (
              <g key={label.id} data-mover={label.id} transform={translate(label.a)}>
                <text
                  className={cn(css.label, built && css.labelStrong)}
                  textAnchor="middle"
                  style={{ opacity: phase.mapped ? 1 : 0, transition: `opacity 600ms var(--ease-out) ${phase.mapped && !built ? 120 + label.clusterIndex * 80 : 0}ms, fill 480ms var(--ease-out)` }}
                >
                  {label.text}
                </text>
              </g>
            ))}
          </g>

          {/* step 1: the sweep reads the loose map */}
          <g className={cn(css.sweep, step === 0 && onScreen && css.sweepOn)}>
            <rect x="-40" y="24" width="40" height={VIEW.h - 48} fill="rgba(255, 255, 255, 0.022)" />
            <line x1="0" y1="24" x2="0" y2={VIEW.h - 24} stroke="rgba(var(--spot-rgb), 0.5)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </g>

          {WIRING_LINKS.map((link) => (
            <Wire key={link.id} link={link} phase={phase} />
          ))}

          {PULSE_ROUTES.map((route) => (
            <circle key={route.id} data-pulse={route.id} r="2.6" fill="var(--spot)" opacity="0" />
          ))}

          {FRICTION.map((point, i) => (
            <Friction key={point.id} point={point} index={i} phase={phase} />
          ))}

          {/* the digital workforce, on the floor beneath the Hub */}
          {AGENTS.map((agent) => (
            <g key={agent.id} transform={translate(agent.b)}>
              <g className={css.glyph} style={{ opacity: working ? 1 : 0, ...opacityAfter(working ? 120 + agent.index * 160 : 0) }}>
                <circle r="15" fill="rgb(var(--accent-rgb))" opacity="0.1" />
                <circle r="9" fill="var(--void)" stroke="rgb(var(--accent-rgb))" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                <circle r="2.6" fill="rgb(var(--accent-rgb))" />
              </g>
              <text
                className={cn(css.label, css.labelSmall, "max-lg:hidden")}
                textAnchor={agent.side === "left" ? "end" : "start"}
                style={{
                  transform: agent.side === "left" ? "translate(calc(var(--k) * -15px), calc(var(--u) * 3.4px))" : "translate(calc(var(--k) * 15px), calc(var(--u) * 3.4px))",
                  opacity: working ? 1 : 0,
                  ...opacityAfter(working ? 420 + agent.index * 160 : 0),
                }}
              >
                {agent.job}
              </text>
            </g>
          ))}
          <g transform={translate([HUB.b[0], FLOOR_Y])}>
            <text
              className={cn(css.label, css.labelSmall)}
              textAnchor="middle"
              style={{ transform: "translate(0, calc(var(--k) * 9px + var(--u) * 11px))", opacity: working ? 1 : 0, ...opacityAfter(working ? 700 : 0) }}
            >
              Digital workforce
            </text>
          </g>

          {/* step 5: the hours the system returns to the owner */}
          <text className={css.fade} transform={translate([28, FLOOR_Y])} style={{ opacity: working ? 1 : 0, transitionDelay: working ? "500ms" : "0ms" }}>
            <tspan ref={metric} className={css.value}>
              {HOURS_RETURNED.toFixed(1)}
            </tspan>
            <tspan className={css.value}> h</tspan>
            <tspan className={cn(css.label, css.labelSmall, pcss.metricWide)} x="0" dy="1.5em">
              returned per week
            </tspan>
            {/* phones: the workforce label sits beside this, so the caption breaks in two */}
            <tspan className={cn(css.label, css.labelSmall, pcss.metricNarrow)} x="0" dy="1.5em">
              returned
            </tspan>
            <tspan className={cn(css.label, css.labelSmall, pcss.metricNarrow)} x="0" dy="1.15em">
              per week
            </tspan>
          </text>

          {/* step 6: intelligence surfaces the next job worth an agent */}
          <g transform={translate(CANDIDATE.b)} style={{ opacity: running ? 1 : 0, ...opacityAfter(running ? 500 : 0) }}>
            <g className={css.glyph}>
              <circle r="9" fill="var(--void)" stroke="var(--text-0)" strokeWidth="1.25" strokeDasharray="2.5 3" vectorEffect="non-scaling-stroke" />
              <circle r="2.2" fill="none" stroke="var(--text-0)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </g>
            <text className={cn(css.label, css.labelSmall, css.labelStrong)} textAnchor="middle" style={{ transform: "translate(0, calc(var(--k) * -9px - var(--u) * 9px))" }}>
              <tspan x="0" dy="-1.3em">
                new agent
              </tspan>
              <tspan x="0" dy="1.3em">
                candidate
              </tspan>
            </text>
          </g>

          {/* One Spot Hub: the command center, at the top, in place before the company gathers around it */}
          <g transform={translate(HUB.b)} style={{ opacity: built ? 1 : 0, ...opacityAfter(0) }}>
            <g className={css.glyph}>
              <circle data-hub-wave r="19" fill="none" stroke="var(--spot)" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0" />
              <circle r="32" fill="rgba(var(--spot-rgb), 0.06)" />
              <circle r="19" fill="var(--void)" stroke="var(--text-0)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
              <circle r="4.8" fill="var(--spot)" />
            </g>
            <text className={cn(css.label, css.labelStrong)} style={{ transform: "translate(calc(var(--k) * 19px + var(--u) * 10px), calc(var(--u) * 3.5px))" }}>
              One Spot Hub
            </text>
          </g>

          <NeedsYou running={running} />
        </svg>
      </div>

      <Readout step={step} />
    </div>
  );
}

/**
 * The drawing's text equivalent. One telemetry line per step; under the desktop breakpoint the friction
 * names and classifications cannot fit beside their markers, so they are listed here instead (and always
 * available to screen readers).
 */
function Readout({ step }: { step: number }) {
  const showLegend = step === 2;
  return (
    <div className="mx-auto mt-3 grid w-full max-w-[640px] border-t border-[var(--line)] pt-3 lg:mt-4">
      <div className={cn("col-start-1 row-start-1 grid transition-opacity duration-500", showLegend && "max-lg:opacity-0")}>
        {READOUT.map((line, i) => (
          <p
            key={line.label}
            aria-hidden={i === step ? undefined : true}
            className="col-start-1 row-start-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 transition-opacity duration-500 ease-[var(--ease-out)]"
            style={{ opacity: i === step ? 1 : 0, transitionDelay: i === step ? "160ms" : "0ms" }}
          >
            <span className="t-label">{line.label}</span>
            <span className="t-label t-num ml-auto text-right text-[var(--text-0)]">{line.value}</span>
          </p>
        ))}
      </div>
      <ol
        aria-label="Friction points, classified"
        className={cn(
          "col-start-1 row-start-1 grid grid-cols-2 gap-x-4 gap-y-1.5 transition-opacity duration-500 lg:sr-only",
          showLegend ? "opacity-100 delay-150" : "opacity-0",
        )}
      >
        {FRICTION.map((point) => (
          <li key={point.id} className="flex items-baseline gap-2 font-mono text-[9.5px] uppercase leading-none tracking-[0.06em] text-[var(--text-1)]">
            <span className="t-num w-2.5 shrink-0 text-[var(--warn)]">{point.rank}</span>
            <span className="min-w-0">
              {point.label} <span className="text-[var(--text-2)]">· {REMEDY[point.remedy].chip}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export const CompanyMap = memo(CompanyMapImpl);
