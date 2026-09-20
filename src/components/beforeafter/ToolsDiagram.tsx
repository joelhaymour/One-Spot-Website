"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { EASE, gsap } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { easeInOutCubic, easeOutCubic, segment } from "@/lib/math";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useExperience } from "@/state/experience";
import { useOnScreen, useSvgUnit } from "@/components/process/hooks";
import css from "@/components/process/diagram.module.css";
import { ToolGlyph } from "./ToolGlyph";
import { DWELL, HOPS, HUB, RING_RADIUS, THREADS, TOOLS, VIEW, YOU, lerpPt, threadPath, translate } from "./layout";

/**
 * Same eight tools, two companies.
 *
 * step 0  before: a tangle, and attention jumping between tools
 * step 1  the transformation: one 1.5 s move, driven by a single number (tiles glide, lines relax, the middle changes hands)
 * step 2  after: agents sit on the connections, "You" are connected to the centre by one line, work flows in calmly
 *
 * Step state is CSS. The morph and the two ambient loops are the only scripted motion.
 */

const MORPH_SECONDS = 1.5;
const THREAD = "rgba(255, 255, 255, 0.17)";

const markTransform = (scale: number) => `${translate(HUB.b)} scale(${scale.toFixed(3)})`;

interface ToolsDiagramProps {
  step: number;
  /** Called each time attention lands on another tool (drives the "tab switches" counter). */
  onHop: () => void;
}

function ToolsDiagramImpl({ step, onHop }: ToolsDiagramProps) {
  const frame = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const morph = useRef({ p: 0 });

  const reduced = useReducedMotion();
  const paused = useExperience((s) => s.paused);
  const { onScreen } = useOnScreen(frame);
  useSvgUnit(frame, VIEW.w);

  // True once the morph has landed. The after-state details wait for it, however fast the visitor scrolled.
  const [formed, setFormed] = useState(false);

  const transformed = step >= 1;
  const settled = step >= 2 && (reduced ? true : formed);

  /** One frame of the morph. Every sub-move is a window on the same clock, so it reverses exactly. */
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

  useEffect(() => {
    const state = morph.current;
    const target = transformed ? 1 : 0;
    if (state.p === target) return;
    if (reduced) {
      state.p = target;
      apply(target);
      return;
    }
    const tween = gsap.to(state, {
      p: target,
      duration: MORPH_SECONDS,
      ease: "none",
      onStart: () => setFormed(false),
      onUpdate: () => apply(state.p),
      onComplete: () => setFormed(target === 1),
    });
    return () => {
      tween.kill();
    };
  }, [transformed, reduced, apply]);

  // Before: attention jumps from tool to tool. Quick slews, uneven dwell, never at rest.
  const frantic = step === 0 && onScreen && !paused && !reduced;
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
      tl.call(onHop, undefined, at);
      if (flashes[tool]) tl.fromTo(flashes[tool], { opacity: 0.85 }, { opacity: 0, duration: 0.45, ease: "power1.out", immediateRender: false }, at);
    });
    return () => {
      tl.kill();
      gsap.set(flashes, { opacity: 0 });
    };
  }, [frantic, onHop]);

  // After: one piece of work at a time travels from a tool, through its agent, to the centre.
  const flowing = settled && onScreen && !paused && !reduced;
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

  return (
    <div ref={frame} className={css.frame}>
      <svg ref={svg} viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className={css.svg} aria-hidden focusable="false">
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
          className={css.fade}
          style={{ opacity: settled ? 1 : 0, transitionDelay: settled ? "200ms" : "0ms" }}
        />

        {TOOLS.map((tool) => (
          <g key={tool.label} transform={translate(tool.agentAt)} className={css.fade} style={{ opacity: settled ? 1 : 0, transitionDelay: settled ? `${500 + tool.index * 90}ms` : "0ms" }}>
            <g className={css.glyph}>
              <circle r="7" fill="rgba(var(--spot-rgb), 0.1)" />
              <circle r="2.6" fill="var(--spot)" />
            </g>
          </g>
        ))}

        <circle data-bead r="3" fill="var(--spot)" opacity="0" />

        {TOOLS.map((tool) => (
          <g key={tool.label} data-tile={tool.index} transform={translate(tool.a)}>
            <g className={css.glyph}>
              <rect x="-26" y="-26" width="52" height="52" rx="13" fill="var(--bg-2)" stroke="var(--line-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <rect data-flash x="-26" y="-26" width="52" height="52" rx="13" fill="none" stroke="var(--text-0)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" style={{ opacity: 0 }} />
              <ToolGlyph name={tool.label} />
            </g>
            <text className={css.label} textAnchor="middle" style={{ transform: "translate(0, calc(var(--k) * 26px + var(--u) * 15px))" }}>
              {tool.label}
            </text>
          </g>
        ))}

        <g data-mark transform={markTransform(0.84)} opacity="0">
          <g className={css.glyph}>
            <circle r="36" fill="rgba(var(--spot-rgb), 0.05)" />
            <circle r="23" fill="var(--void)" stroke="var(--text-0)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
            <circle r="5.8" fill="var(--spot)" />
          </g>
          <text className={cn(css.label, css.labelStrong)} style={{ transform: "translate(calc(var(--k) * 23px + var(--u) * 9px), calc(var(--u) * 3.5px))" }}>
            One Spot
          </text>
        </g>

        <g data-you transform={translate(YOU.a)}>
          <g className={css.glyph}>
            <circle r="13" fill="var(--void)" />
            <circle r="6.5" fill="var(--text-0)" />
          </g>
          <text className={cn(css.label, css.labelStrong)} style={{ transform: "translate(calc(var(--k) * 6.5px + var(--u) * 8px), calc(var(--u) * 3.5px))" }}>
            You
          </text>
        </g>

        <g className={css.fade} style={{ opacity: step === 0 ? 1 : 0 }}>
          <g data-focus transform={translate(TOOLS[0].a)}>
            <g className={css.glyph}>
              <circle cx="21" cy="-21" r="8" fill="rgba(var(--spot-rgb), 0.14)" />
              <circle cx="21" cy="-21" r="3.4" fill="var(--spot)" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

export const ToolsDiagram = memo(ToolsDiagramImpl);
