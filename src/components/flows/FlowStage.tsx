"use client";

import { useEffect, useRef, useSyncExternalStore, type CSSProperties, type Dispatch, type SetStateAction } from "react";
import { FLOW_SCENARIOS } from "@/content/flows";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { clamp } from "@/lib/math";
import { useMediaQuery, useReducedMotion } from "@/lib/useReducedMotion";
import { useExperience } from "@/state/experience";
import { useOnScreen, useSvgUnit } from "@/components/process/hooks";
import diagram from "@/components/process/diagram.module.css";
import { AgentDot, MarkGlyph, THREAD, TileNode, YouGlyph } from "@/components/hero/nodes";
import { HUB, RING_RADIUS, TOOLS, VIEW, YOU, translate } from "@/components/hero/layout";
import { buildRun, finished, routeOf, type Picture } from "./engine";
import { HOME, anchorBox, camTransform, fitCam, focusId, slotFor, union, type Cam, type FocusKey } from "./geometry";
import css from "./flows.module.css";

/**
 * The after ring, exactly as the hero leaves it, inside a camera. A scenario plays on it: the camera
 * zooms to each system that takes part, a readout fills in beside it, a white dot carries the result
 * round the orbit to the next one, then in to One Spot, then up to You.
 *
 * Everything discrete (which tile is lit, which lines have appeared, how far the log has got) is the
 * `pic` the parent holds and this renders. Everything continuous (the camera, the dot) is one GSAP
 * timeline per scenario (engine.ts), which patches the picture at the right instants. The run plays only
 * for the active step, once the opening sequence has lifted, on screen, in a visible tab, not paused and
 * not under reduced motion; a pause freezes the timeline where it is. Reduced motion shows the finished
 * picture. The server HTML is the overview of the first scenario, with nothing in motion.
 */

/** Zoom on a tile. The frame is 335px wide on phones, so the camera goes further in there. */
const ZOOM = { wide: 1.7, narrow: 2.1 } as const;
const WIDE = "(min-width: 768px)";

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

type TileState = "dim" | "on" | "lit" | "done";

/** A tile's readout: its lines, the first as a title, each rising in when its turn comes. */
function Readout({ id, style, on, lines, shown }: { id: string; style: CSSProperties; on: boolean; lines: readonly string[]; shown: number }) {
  return (
    <div data-card={id} className={cn("glass", css.card)} data-on={on} style={style}>
      {lines.map((line, n) => (
        <p key={`${n}-${line}`} className={cn(css.line, css.clamp, n === 0 && css.title)} data-shown={on && n < shown}>
          {line}
        </p>
      ))}
    </div>
  );
}

function Tick({ ok }: { ok: boolean }) {
  return (
    <svg viewBox="0 0 10 10" width="7" height="7" aria-hidden focusable="false">
      <path
        d={ok ? "M1.6 5.3l2.2 2.2 4.6-4.8" : "M2.2 2.2l5.6 5.6M7.8 2.2l-5.6 5.6"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface FlowStageProps {
  step: number;
  pic: Picture;
  setPic: Dispatch<SetStateAction<Picture>>;
  className?: string;
}

export function FlowStage({ step, pic, setPic, className }: FlowStageProps) {
  const frame = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const dot = useRef<SVGGElement>(null);
  const run = useRef<gsap.core.Timeline | null>(null);
  // The gate's latest word, for a run built between two of its changes.
  const runningRef = useRef(false);

  const reduced = useReducedMotion();
  const hidden = useDocumentHidden();
  const paused = useExperience((s) => s.paused);
  const intro = useExperience((s) => s.intro);
  const { onScreen } = useOnScreen(frame);
  useSvgUnit(frame, VIEW.w);
  // The zoom and the card measurements are baked into the run, so a breakpoint change rebuilds it.
  const wide = useMediaQuery(WIDE);

  const scenario = FLOW_SCENARIOS[step];
  const route = routeOf(scenario);
  const running = intro === "done" && onScreen && !hidden && !paused && !reduced;

  // The run: one timeline per scenario, built paused, rebuilt whenever the step changes. Its first act is
  // to reset the picture, so a rebuild and a restart both begin at the overview.
  useEffect(() => {
    const cam = camera.current;
    const lens = overlay.current;
    const root = frame.current;
    const bead = dot.current;
    if (!cam || !lens || !root || !bead) return;
    const zoom = wide ? ZOOM.wide : ZOOM.narrow;
    gsap.set(cam, { ...camTransform(HOME), transformOrigin: "0 0" });
    gsap.set(bead, { opacity: 0 });

    // The cards are rendered (hidden) before the run is built, so their true size decides the framing.
    const u = VIEW.w / Math.max(1, root.clientWidth);
    // the glyph scale useSvgUnit writes for this width: the tile labels sit 26k + 15u below their tiles
    const k = clamp(0.55 + 0.45 * u, 1, 1.7);
    const focus = (key: FocusKey): Cam => {
      const tool = key.kind === "hop" ? routeOf(scenario)[key.index]?.tool : undefined;
      const anchor = anchorBox(key, tool, u, k);
      if (key.kind === "mark") return fitCam(anchor, zoom);
      const el = lens.querySelector<HTMLElement>(`[data-card="${focusId(key)}"]`);
      const w = el && el.offsetWidth > 0 ? el.offsetWidth * u : 216;
      const h = el && el.offsetHeight > 0 ? el.offsetHeight * u : 80;
      return fitCam(union(anchor, slotFor(key, tool).box(w, h, u, k)), zoom);
    };

    const tl = buildRun({
      scenario,
      focus,
      aim: (c) => gsap.set(cam, camTransform(c)),
      dot: bead,
      moveDot: (p) => gsap.set(bead, { x: p[0], y: p[1] }),
      setPic,
    });
    run.current = tl;
    if (runningRef.current) tl.play();
    return () => {
      tl.kill();
      run.current = null;
    };
  }, [scenario, setPic, wide]);

  // The gate. A pause keeps the run where it is; coming back to a finished scenario starts it over.
  useEffect(() => {
    runningRef.current = running;
    const tl = run.current;
    if (!tl) return;
    if (!running) tl.pause();
    else if (tl.progress() >= 1) tl.restart();
    else tl.play();
  }, [running]);

  // Reduced motion: the camera home and the dot away (the render shows the finished picture from
  // `reduced` alone). Should the preference lift, the run begins again from its overview.
  useEffect(() => {
    if (!reduced) return;
    if (camera.current) gsap.set(camera.current, camTransform(HOME));
    if (dot.current) gsap.set(dot.current, { opacity: 0 });
    return () => {
      run.current?.pause(0);
    };
  }, [reduced]);

  const shown = reduced ? finished(scenario) : pic;
  const relevant = new Set<string>(route.map((h) => h.tool));
  const lit = shown.stage === "hop" ? route[shown.hop]?.tool : undefined;
  const doneTools = new Set<string>(route.slice(0, shown.stage === "done" ? route.length : shown.done).map((h) => h.tool));
  const tileState = (tool: string): TileState => (!relevant.has(tool) ? "dim" : tool === lit ? "lit" : doneTools.has(tool) ? "done" : "on");
  const partState = (tool: string) => (relevant.has(tool) ? "on" : "dim");
  const markState = shown.stage === "hub" ? "thinking" : shown.stage === "you" || shown.stage === "done" ? "done" : "idle";
  const youState = shown.stage === "you" ? "lit" : shown.stage === "done" ? "done" : "idle";
  const decisionOn = shown.stage === "you" || shown.stage === "done";
  const checks = scenario.hub.checks.length;

  return (
    <div className={cn(css.stage, className)}>
      <div ref={frame} className={cn(diagram.frame, css.frame)}>
        <div ref={camera} className={css.camera}>
          {/* the drawing is hidden from assistive tech; the captions beside it carry the meaning */}
          <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className={diagram.svg} aria-hidden focusable="false">
            <circle cx={HUB.b[0]} cy={HUB.b[1]} r={RING_RADIUS} fill="none" stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />

            {TOOLS.map((tool) => (
              <line
                key={tool.label}
                className={css.spoke}
                data-state={partState(tool.label)}
                x1={HUB.b[0]}
                y1={HUB.b[1]}
                x2={tool.b[0]}
                y2={tool.b[1]}
                stroke={THREAD}
                strokeWidth="1"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* the one line between you and the company */}
            <line x1={YOU.b[0]} y1={YOU.b[1]} x2={HUB.b[0]} y2={HUB.b[1]} stroke="rgba(var(--spot-rgb), 0.5)" strokeWidth="1" vectorEffect="non-scaling-stroke" />

            {TOOLS.map((tool) => (
              <g key={tool.label} className={css.agent} data-state={partState(tool.label)} transform={translate(tool.agentAt)}>
                <AgentDot />
              </g>
            ))}

            {TOOLS.map((tool) => (
              <g key={tool.label} className={css.tile} data-state={tileState(tool.label)}>
                <g transform={translate(tool.b)}>
                  <g className={diagram.glyph}>
                    <rect className={css.glow} x="-40" y="-40" width="80" height="80" rx="22" fill="rgba(var(--spot-rgb), 0.07)" />
                    <rect className={css.ring} x="-31" y="-31" width="62" height="62" rx="16" fill="none" stroke="rgba(var(--spot-rgb), 0.85)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                  </g>
                </g>
                <TileNode tool={tool} at={tool.b} />
                <g transform={translate(tool.b)}>
                  <g className={diagram.glyph}>
                    <g transform="translate(23 -23)">
                      <g className={css.check}>
                        <circle r="7" fill="var(--ok)" />
                        <path d="M-3 0.3l2.1 2.1 4-4.3" fill="none" stroke="#08090b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            ))}

            <g className={css.mark} data-state={markState} transform={translate(HUB.b)}>
              <g className={diagram.glyph}>
                <circle className={css.markRing} r="31" fill="none" stroke="rgba(var(--spot-rgb), 0.35)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                <circle className={css.pulse} r="23" fill="none" stroke="rgba(var(--spot-rgb), 0.7)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
              </g>
              <MarkGlyph />
            </g>

            <g className={css.you} data-state={youState} transform={translate(YOU.b)}>
              <g className={diagram.glyph}>
                <circle className={css.ring} r="19" fill="none" stroke="rgba(var(--spot-rgb), 0.85)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
              </g>
              <YouGlyph />
            </g>

            {/* the work in flight: the run moves it, the render only says what it carries */}
            <g ref={dot} opacity="0">
              <circle r="9" fill="rgba(var(--spot-rgb), 0.14)" />
              <circle r="4" fill="var(--spot)" />
              {shown.carry && (
                <text
                  className={cn(diagram.label, diagram.labelSmall, diagram.labelStrong)}
                  textAnchor={shown.carry.side === "right" ? "start" : "end"}
                  style={{ transform: `translate(calc(var(--u) * ${shown.carry.side === "right" ? 12 : -12}px), calc(var(--u) * 3.5px))` }}
                >
                  {shown.carry.text}
                </text>
              )}
            </g>
          </svg>

          {/* the readouts: DOM, so they read as text, inside the camera, so they zoom with the drawing */}
          <div ref={overlay} className={css.overlay} aria-hidden>
            {route.map((hop, i) => (
              <Readout
                key={`${scenario.id}-${i}`}
                id={`hop-${i}`}
                style={slotFor({ kind: "hop", index: i }, hop.tool).style}
                on={shown.stage === "hop" && shown.hop === i}
                lines={hop.lines}
                shown={shown.lines}
              />
            ))}

            <div data-card="hub" className={cn("glass", css.card)} data-on={shown.stage === "hub"} style={slotFor({ kind: "hub" }).style}>
              {scenario.hub.checks.map((check, n) => (
                <p key={check.label} className={cn(css.line, css.checkRow)} data-shown={shown.stage === "hub" && n < shown.lines}>
                  <span className={css.tick} data-ok={check.ok}>
                    <Tick ok={check.ok} />
                  </span>
                  <span>{check.label}</span>
                </p>
              ))}
              {scenario.hub.recommendation.map((line, n) => (
                <p key={line} className={cn(css.line, css.clamp3, css.rec, n === 0 && css.recFirst)} data-shown={shown.stage === "hub" && checks + n < shown.lines}>
                  {line}
                </p>
              ))}
            </div>

            <div data-card="you" className={cn("glass", css.card, css.decision)} data-on={decisionOn} style={slotFor({ kind: "you" }).style}>
              <p className={cn(css.line, css.clamp3)} data-shown={decisionOn}>
                {scenario.hub.recommendation[0]}
              </p>
              <p className={cn(css.line, css.chips)} data-shown={decisionOn}>
                {scenario.you.actions.map((action, n) => (
                  <span key={action} className={cn(css.chip, n === 0 && css.chipPrimary, n === 0 && shown.chosen && css.chipChosen)}>
                    {action}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
