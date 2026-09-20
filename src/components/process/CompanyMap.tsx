"use client";

import { memo, useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { EASE, gsap } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { easeInOutCubic, easeOutCubic, segment } from "@/lib/math";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useExperience } from "@/state/experience";
import { useOnScreen, useSvgUnit } from "./hooks";
import css from "./diagram.module.css";
import {
  AGENTS,
  CANDIDATE,
  CEO,
  CLUSTER_INDEX,
  CLUSTER_LABELS,
  FRICTION,
  LINKS,
  LIVE_AGENT,
  LIVE_CLUSTERS,
  MEMBERS,
  MOVERS,
  PULSE_ROUTES,
  SIGN_OFF_LABEL_NODE,
  VIEW,
  linkPath,
  pointOnCubic,
  positionAt,
  translate,
  type FrictionPoint,
  type MapLink,
} from "./mapData";

/**
 * One drawing of one company, carried through all six steps.
 * Step state is pure CSS (opacity, colour). The only scripted motion is the re-organisation in step 5,
 * where a single number drives every node and link, and the slow pulse in step 6.
 */

const HOURS_SAVED = 11.5;

const LINE = "rgba(255, 255, 255, 0.15)";
const LINE_FAINT = "rgba(255, 255, 255, 0.11)";
const LINE_WIRED = "rgba(255, 255, 255, 0.34)";
const LINE_CEO = "rgba(var(--spot-rgb), 0.46)";
const LINE_LIVE = "rgba(var(--accent-rgb), 0.8)";
const LINE_WARN = "rgba(255, 179, 71, 0.6)";

const opacityAfter = (ms: number): CSSProperties => ({ transition: `opacity 480ms var(--ease-out) ${ms}ms` });

const READOUT: ReadonlyArray<{ label: string; value: string }> = [
  { label: "Mapping the company", value: `${CLUSTER_LABELS.length} areas / ${MEMBERS.length} nodes` },
  { label: "Friction, ranked by cost", value: `${FRICTION.length} points` },
  { label: "Org chart, on one page", value: `${AGENTS.length} agents / ${MEMBERS.filter((m) => m.signOff).length} sign-offs` },
  { label: "First agent live", value: `${HOURS_SAVED} h saved per week` },
  { label: "Connected", value: `${AGENTS.length} agents / 1 CEO Agent` },
  { label: "Monthly review", value: "1 new agent candidate" },
];

const FRICTION_LABEL_OFFSET: Record<FrictionPoint["side"], { anchor: "start" | "middle" | "end"; transform: string }> = {
  left: { anchor: "end", transform: "translate(calc(var(--u) * -13px), calc(var(--u) * 3.4px))" },
  right: { anchor: "start", transform: "translate(calc(var(--u) * 13px), calc(var(--u) * 3.4px))" },
  above: { anchor: "middle", transform: "translate(0, calc(var(--u) * -14px))" },
};

interface Phase {
  seen: boolean;
  friction: boolean;
  planned: boolean;
  live: boolean;
  organised: boolean;
  review: boolean;
}

function Wire({ link, phase }: { link: MapLink; phase: Phase }) {
  const { seen, friction, planned, live, organised, review } = phase;
  const common = { fill: "none", strokeWidth: 1, strokeLinecap: "round" as const, vectorEffect: "non-scaling-stroke" as const, "data-link": link.id, d: linkPath(link, 0) };

  if (link.kind === "intra" || link.kind === "closing") {
    const lit = live && link.cluster !== undefined && LIVE_CLUSTERS.has(link.cluster);
    const visible = seen && !(link.kind === "closing" && organised);
    const delay = link.kind === "closing" ? (organised ? 0 : 1500) : 240 + (link.cluster ? CLUSTER_INDEX[link.cluster] : 0) * 80;
    return (
      <path
        {...common}
        stroke={lit ? "rgba(var(--accent-rgb), 0.42)" : LINE_FAINT}
        style={{ opacity: visible ? 1 : 0, transition: `opacity 600ms var(--ease-out) ${delay}ms, stroke 480ms var(--ease-out)` }}
      />
    );
  }

  if (link.kind === "relation") {
    // Relationships are what the agents replace: they leave before the map moves, and return after it has moved back.
    return (
      <path
        {...common}
        stroke={friction && link.friction ? LINE_WARN : LINE}
        style={{ opacity: seen && !organised ? 1 : 0, transition: `opacity 480ms var(--ease-out) ${organised ? 0 : 1300}ms, stroke 480ms var(--ease-out)` }}
      />
    );
  }

  if (link.kind === "agent") {
    const isLive = link.agent === LIVE_AGENT;
    const solid = organised || (live && isLive);
    const delay = planned && !live ? 360 + (link.agent ?? 0) * 90 : 0;
    // Planned and built are two strokes that cross-fade, so "dashed becomes solid" is an opacity change, not a repaint loop.
    return (
      <g>
        <path {...common} stroke="var(--text-2)" strokeDasharray="3 4" style={{ opacity: planned && !solid ? 1 : 0, ...opacityAfter(delay) }} />
        <path {...common} stroke={isLive ? LINE_LIVE : LINE_WIRED} style={{ opacity: solid ? 1 : 0, ...opacityAfter(0) }} />
      </g>
    );
  }

  if (link.kind === "candidate") {
    return <path {...common} stroke="var(--text-1)" strokeDasharray="3 4" style={{ opacity: review ? 1 : 0, ...opacityAfter(review ? 500 : 0) }} />;
  }

  // CEO links arrive last, once the hierarchy has settled underneath them.
  return <path {...common} stroke={LINE_CEO} style={{ opacity: organised ? 1 : 0, ...opacityAfter(organised ? 1500 + (link.agent ?? 0) * 60 : 0) }} />;
}

function Friction({ point, phase }: { point: FrictionPoint; phase: Phase }) {
  const { friction, planned, organised } = phase;
  const lingering = planned && !organised && !point.covered;
  const label = FRICTION_LABEL_OFFSET[point.side];
  return (
    <g transform={translate(point.at)} style={{ opacity: friction ? 1 : lingering ? 0.38 : 0, ...opacityAfter(friction ? (point.rank - 1) * 90 : 0) }}>
      {/* sized in screen pixels so the rank number always fits the ring */}
      <g style={{ transform: "scale(var(--u))" }}>
        <circle r="7.5" fill="var(--void)" stroke="var(--warn)" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
      </g>
      <text className={cn(css.label, css.labelSmall, css.labelWarn)} textAnchor="middle" dy="0.36em" style={{ stroke: "none" }}>
        {point.rank}
      </text>
      <text
        className={cn(css.label, css.labelSmall, css.labelWarn, "max-lg:hidden")}
        textAnchor={label.anchor}
        style={{ transform: label.transform, opacity: friction ? 1 : 0 }}
      >
        {point.label}
      </text>
    </g>
  );
}

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

  // True once the hierarchy has finished forming. Step 6 waits for it, however fast the visitor got there.
  const [formed, setFormed] = useState(false);

  const phase: Phase = {
    seen,
    friction: step === 1,
    planned: step >= 2,
    live: step >= 3,
    organised: step >= 4,
    review: step === 5 && (reduced ? true : formed),
  };
  const { planned, live, organised, review } = phase;

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

  // Step 5: the scattered map slews into a hierarchy (and back, when scrolling up).
  useEffect(() => {
    const state = layout.current;
    const target = organised ? 1 : 0;
    if (state.t === target) return;
    if (reduced) {
      state.t = target;
      apply(target);
      return;
    }
    const tween = gsap.to(state, {
      t: target,
      duration: 1.3,
      delay: 0.3,
      ease: EASE.camera,
      onStart: () => setFormed(false),
      onUpdate: () => apply(state.t),
      onComplete: () => setFormed(target === 1),
    });
    return () => {
      tween.kill();
    };
  }, [organised, reduced, apply]);

  // Step 4: the first agent's metric counts up from zero.
  useEffect(() => {
    const el = metric.current;
    if (!el) return;
    const final = HOURS_SAVED.toFixed(1);
    if (step !== 3 || reduced) {
      el.textContent = final;
      return;
    }
    const state = { v: 0 };
    el.textContent = "0.0";
    const tween = gsap.to(state, {
      v: HOURS_SAVED,
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

  // Step 6: one slow pulse from the CEO Agent to the agents, then from the agents into the company.
  const pulsing = review && onScreen && !paused && !reduced;
  useEffect(() => {
    const root = svg.current;
    if (!pulsing || !root) return;
    const dots = PULSE_ROUTES.map((r) => root.querySelector(`[data-pulse="${r.id}"]`));
    const wave = root.querySelector("[data-ceo-wave]");
    const state = { p: 0 };
    const place = () => {
      const emit = easeOutCubic(segment(state.p, 0, 0.3));
      wave?.setAttribute("transform", `scale(${(1 + emit * 1.7).toFixed(3)})`);
      wave?.setAttribute("opacity", (segment(state.p, 0, 0.04) * (1 - emit) * 0.55).toFixed(3));
      PULSE_ROUTES.forEach((route, i) => {
        const dot = dots[i];
        if (!dot) return;
        const raw = route.wave === 0 ? segment(state.p, 0.04, 0.42) : segment(state.p, 0.46, 0.88);
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
          {LINKS.map((link) => (
            <Wire key={link.id} link={link} phase={phase} />
          ))}

          <g className={cn(css.sweep, step === 0 && onScreen && css.sweepOn)}>
            <rect x="-40" y="24" width="40" height={VIEW.h - 48} fill="rgba(255, 255, 255, 0.022)" />
            <line x1="0" y1="24" x2="0" y2={VIEW.h - 24} stroke="rgba(var(--spot-rgb), 0.5)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </g>

          {PULSE_ROUTES.map((route) => (
            <circle key={route.id} data-pulse={route.id} r="2.6" fill="var(--spot)" opacity="0" />
          ))}

          {MEMBERS.map((node) => {
            const lit = live && LIVE_CLUSTERS.has(node.cluster);
            return (
              <g key={node.id} data-mover={node.id} transform={translate(node.a)}>
                <g className={css.glyph}>
                  {node.signOff && (
                    <rect
                      x="-6.5"
                      y="-6.5"
                      width="13"
                      height="13"
                      transform="rotate(45)"
                      fill="none"
                      stroke="var(--text-0)"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                      style={{ opacity: planned ? 0.9 : 0, ...opacityAfter(planned && !live ? 900 : 0) }}
                    />
                  )}
                  <circle
                    r="2.6"
                    fill={lit ? "rgb(var(--accent-rgb))" : organised ? "var(--text-1)" : "var(--text-2)"}
                    style={{ opacity: seen ? 1 : 0, transition: `opacity 600ms var(--ease-out) ${node.clusterIndex * 80}ms, fill 480ms var(--ease-out)` }}
                  />
                </g>
                {node.id === SIGN_OFF_LABEL_NODE && (
                  <text
                    className={cn(css.label, css.labelSmall, css.labelStrong)}
                    style={{
                      transform: "translate(calc(var(--k) * 12px + var(--u) * 3px), calc(var(--u) * -9px))",
                      opacity: planned && !organised ? 1 : 0,
                      ...opacityAfter(planned && !live ? 900 : 0),
                    }}
                  >
                    human sign-off
                  </text>
                )}
              </g>
            );
          })}

          {CLUSTER_LABELS.map((label) => (
            <g key={label.id} data-mover={label.id} transform={translate(label.a)}>
              <text
                className={cn(css.label, live && LIVE_CLUSTERS.has(label.cluster) && css.labelStrong)}
                textAnchor="middle"
                style={{ opacity: seen ? 1 : 0, transition: `opacity 600ms var(--ease-out) ${120 + label.clusterIndex * 80}ms, fill 480ms var(--ease-out)` }}
              >
                {label.text}
              </text>
            </g>
          ))}

          {FRICTION.map((point) => (
            <Friction key={point.rank} point={point} phase={phase} />
          ))}

          {AGENTS.map((agent) => {
            const isLive = agent.index === LIVE_AGENT;
            const lit = live && isLive;
            return (
              <g key={agent.id} data-mover={agent.id} transform={translate(agent.a)}>
                <g className={css.glyph} style={{ opacity: planned ? 1 : 0, ...opacityAfter(planned && !live ? agent.index * 90 : 0) }}>
                  <circle r="15" fill="rgb(var(--accent-rgb))" className={css.fade} style={{ opacity: lit ? 0.1 : 0 }} />
                  <circle
                    r="9"
                    fill="var(--void)"
                    stroke={lit ? "rgb(var(--accent-rgb))" : organised ? "var(--text-0)" : "var(--text-1)"}
                    strokeWidth="1.25"
                    vectorEffect="non-scaling-stroke"
                    className={css.tint}
                  />
                  <circle r="2.6" fill={lit ? "rgb(var(--accent-rgb))" : organised ? "var(--spot)" : "var(--text-2)"} className={css.tint} />
                </g>
                {isLive && (
                  <text
                    textAnchor="end"
                    className={css.fade}
                    style={{ transform: "translate(calc(var(--k) * -17px), calc(var(--u) * -3px))", opacity: step === 3 ? 1 : 0, transitionDelay: step === 3 ? "300ms" : "0ms" }}
                  >
                    <tspan ref={metric} className={css.value}>
                      {HOURS_SAVED.toFixed(1)}
                    </tspan>
                    <tspan className={css.value}> h</tspan>
                    <tspan className={cn(css.label, css.labelSmall)} x="0" dy="1.5em">
                      saved per week
                    </tspan>
                  </text>
                )}
              </g>
            );
          })}

          <g data-mover={CANDIDATE.id} transform={translate(CANDIDATE.a)}>
            <g style={{ opacity: review ? 1 : 0, ...opacityAfter(review ? 200 : 0) }}>
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
          </g>

          <g transform={translate(CEO.a)} style={{ opacity: organised ? 1 : 0, ...opacityAfter(organised ? 1400 : 0) }}>
            <g className={css.glyph}>
              <circle data-ceo-wave r="15" fill="none" stroke="var(--spot)" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0" />
              <circle r="25" fill="rgba(var(--spot-rgb), 0.06)" />
              <circle r="15" fill="var(--void)" stroke="var(--text-0)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
              <circle r="4.2" fill="var(--spot)" />
            </g>
            <text className={cn(css.label, css.labelStrong)} style={{ transform: "translate(calc(var(--k) * 25px + var(--u) * 8px), calc(var(--u) * 3.5px))" }}>
              CEO Agent
            </text>
          </g>
        </svg>
      </div>

      <Readout step={step} />
    </div>
  );
}

/**
 * The drawing's text equivalent. One telemetry line per step; under the desktop breakpoint the friction
 * names cannot fit beside their markers, so they are listed here instead (and always available to screen readers).
 */
function Readout({ step }: { step: number }) {
  const showLegend = step === 1;
  return (
    <div className="mx-auto mt-3 grid w-full max-w-[640px] border-t border-[var(--line)] pt-3 lg:mt-4">
      <div className={cn("col-start-1 row-start-1 grid transition-opacity duration-500", showLegend && "max-lg:opacity-0")}>
        {READOUT.map((line, i) => (
          <p
            key={line.label}
            aria-hidden={i === step ? undefined : true}
            className="col-start-1 row-start-1 flex items-baseline justify-between gap-4 transition-opacity duration-500 ease-[var(--ease-out)]"
            style={{ opacity: i === step ? 1 : 0, transitionDelay: i === step ? "160ms" : "0ms" }}
          >
            <span className="t-label">{line.label}</span>
            <span className="t-label t-num text-right text-[var(--text-0)]">{line.value}</span>
          </p>
        ))}
      </div>
      <ol
        aria-label="Friction points, ranked by cost"
        className={cn(
          "col-start-1 row-start-1 grid grid-cols-2 gap-x-4 gap-y-1.5 transition-opacity duration-500 lg:sr-only",
          showLegend ? "opacity-100 delay-150" : "opacity-0",
        )}
      >
        {FRICTION.map((point) => (
          <li key={point.rank} className="flex items-baseline gap-2 font-mono text-[9.5px] uppercase leading-none tracking-[0.06em] text-[var(--text-1)]">
            <span className="t-num w-2.5 shrink-0 text-[var(--warn)]">{point.rank}</span>
            <span className="min-w-0">{point.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export const CompanyMap = memo(CompanyMapImpl);
