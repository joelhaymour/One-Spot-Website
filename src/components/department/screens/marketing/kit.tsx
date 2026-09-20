"use client";

import { Children, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Panel, PanelHeader, ScanLine } from "@/components/ui/Panel";
import type { RegionId } from "@/content/departments";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";

/*
 * Private kit for the Marketing console. Every primitive is driven by a value derived from the story
 * step. Entrances wait their turn (transition-delay); exits never wait. That asymmetry is what makes
 * scrolling backwards reverse cleanly, however fast the visitor flicks.
 */

export const ACCENT = "rgb(var(--accent-rgb))";
export const LINE_GREY = "rgba(255, 255, 255, 0.5)";

/** Mono telemetry text at console scale. (.t-label is rem-based, a size too large inside a panel.) */
export const MONO = "font-mono text-[9.5px] uppercase leading-none tracking-[0.08em]";
export const LABEL = `${MONO} text-[var(--text-2)]`;

/**
 * Entrance delay. Multiplied by --k, which the screen sets to 0 under reduced motion: the global
 * stylesheet already collapses durations, this collapses the staggers with them.
 */
export const wait = (ms: number) => `calc(var(--k, 1) * ${ms}ms)`;

/** Inline style for the screen root. */
export const motionScale = (reduce: boolean) => ({ ["--k" as string]: reduce ? 0 : 1 }) as CSSProperties;

/** True when the step's camera focus covers this region ("AB" covers A and B; "full" and "E" cover none). */
export const focusCovers = (focus: RegionId | null, region: "A" | "B" | "C" | "D") => focus !== null && focus.includes(region);

/**
 * A story phase, `ms` late on the way forward and immediate on the way back. Sequences moves that a
 * CSS delay cannot reach (a number that should only tick once the line above it has drawn).
 */
export function useLate(phase: number, ms: number): number {
  const reduce = useReducedMotion();
  const [late, setLate] = useState(phase);
  const delay = reduce || phase < late ? 0 : ms;
  useEffect(() => {
    const id = window.setTimeout(() => setLate(phase), delay);
    return () => window.clearTimeout(id);
  }, [phase, delay]);
  return Math.min(phase, late);
}

/** True for `ms` after `on` turns true. The agent reads a panel, then holds still. */
export function useBrief(on: boolean, ms = 3200): boolean {
  const [spent, setSpent] = useState(false);
  useEffect(() => {
    if (!on) return;
    const id = window.setTimeout(() => setSpent(true), ms);
    return () => {
      window.clearTimeout(id);
      setSpent(false);
    };
  }, [on, ms]);
  return on && !spent;
}

interface ConsolePanelProps {
  label: string;
  right?: ReactNode;
  /** The panel this step's camera focus points at. */
  active: boolean;
  /** The agent is reading this panel. Already gated on reduced motion and the Pause control by the screen. */
  scan: boolean;
  children: ReactNode;
  className?: string;
}

/** A console region: hairline panel, h-9 header, body. Same frame as every other console. */
export function ConsolePanel({ label, right, active, scan, children, className }: ConsolePanelProps) {
  const scanning = useBrief(scan);
  return (
    <Panel active={active} className="flex h-full w-full flex-col overflow-hidden">
      <PanelHeader label={label} right={right} />
      <div className={cn("relative min-h-0 flex-1 px-3.5 pb-3.5", className)}>{children}</div>
      <ScanLine active={scanning} />
    </Panel>
  );
}

interface AppearProps {
  on: boolean;
  /** ms before the entrance starts. */
  delay?: number;
  y?: number;
  as?: "div" | "span";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** Content that is in the HTML from the first byte but only shows once the story has reached it. */
export function Appear({ on, delay = 0, y = 6, as: Tag = "div", className, style, children }: AppearProps) {
  return (
    <Tag
      aria-hidden={on ? undefined : true}
      className={cn("transition-[opacity,transform] duration-500 ease-[var(--ease-out)]", className)}
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "none" : `translate3d(0, ${y}px, 0)`,
        transitionDelay: on ? wait(delay) : "0ms",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

interface LayersProps {
  /** Index of the child that is showing. */
  show: number;
  delay?: number;
  align?: "start" | "end";
  /** Fill the parent (stacked views) instead of hugging the content (stacked values). */
  fill?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Successive states of one slot, stacked in a single grid cell so nothing reflows when they trade.
 * The outgoing state clears first, then the incoming one settles: one thing moves at a time.
 */
export function Layers({ show, delay = 0, align = "start", fill, className, children }: LayersProps) {
  return (
    <span className={cn(fill ? "grid h-full w-full" : "inline-grid", align === "end" ? "justify-items-end" : "justify-items-start", className)}>
      {Children.toArray(children).map((child, i) => {
        const current = i === show;
        return (
          <span
            key={i}
            aria-hidden={current ? undefined : true}
            className={cn(
              "col-start-1 row-start-1 min-w-0 transition-[opacity,transform] duration-[420ms] ease-[var(--ease-out)]",
              fill && "block h-full w-full",
              !current && "pointer-events-none",
            )}
            style={{
              opacity: current ? 1 : 0,
              transform: current ? "none" : `translate3d(0, ${i < show ? -4 : 4}px, 0)`,
              transitionDelay: current ? wait(delay + 140) : "0ms",
            }}
          >
            {child}
          </span>
        );
      })}
    </span>
  );
}

/** Status light whose colour can change with the story. */
export function Lamp({ color, delay = 0, className }: { color: string; delay?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block h-[5px] w-[5px] shrink-0 rounded-full transition-colors duration-500 ease-[var(--ease-out)]", className)}
      style={{ background: color, transitionDelay: wait(delay) }}
    />
  );
}

interface MeterProps {
  /** 0..1 */
  value: number;
  color?: string;
  className?: string;
}

/** Horizontal share bar. scaleX only. */
export function Meter({ value, color = "rgba(255, 255, 255, 0.3)", className }: MeterProps) {
  return (
    <div className={cn("h-[3px] overflow-hidden rounded-full bg-white/[0.07]", className)}>
      <div
        className="h-full origin-left rounded-full transition-transform duration-[1000ms] ease-[var(--ease-out)]"
        style={{ background: color, transform: `scaleX(${Math.min(1, Math.max(0, value))})` }}
      />
    </div>
  );
}

/** A/B/C/D badge. The same mark in the briefs, the calendar and the test, so a variation can be followed across panels. */
export function Letter({ id, lit, struck, className }: { id: string; lit?: boolean; struck?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-grid h-[14px] w-[14px] shrink-0 place-items-center rounded-[4px] border font-mono text-[9px] leading-none transition-[color,border-color,opacity] duration-500 ease-[var(--ease-out)]",
        struck && "line-through opacity-50",
        className,
      )}
      style={{
        color: lit ? ACCENT : "var(--text-1)",
        borderColor: lit ? "rgba(var(--accent-rgb), 0.55)" : "var(--line-strong)",
      }}
    >
      {id}
    </span>
  );
}
