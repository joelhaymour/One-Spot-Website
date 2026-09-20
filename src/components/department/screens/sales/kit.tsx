"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { RegionId } from "@/content/departments";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Small private kit shared by the Sales and Customer Service consoles.
 * Everything here is a pure function of a boolean: a step flips the flag, CSS plays the move on time,
 * and flipping it back reverses cleanly. Entrances may wait their turn; exits never do.
 */

export const ACCENT = "rgb(var(--accent-rgb))";
export const BAR_GREY = "rgba(255, 255, 255, 0.22)";

export type ScreenRegion = "A" | "B" | "C" | "D";

/** True when the step's camera focus covers this region ("AB" covers A and B; "full" and "E" cover none). */
export const focusCovers = (focus: RegionId | null, region: ScreenRegion) => focus !== null && focus.includes(region);

/**
 * Entrance delay. Multiplied by --k, which the screen root sets to 0 under reduced motion:
 * the global stylesheet already collapses durations, this collapses the staggers with them.
 */
export const wait = (ms: number) => `calc(var(--k, 1) * ${ms}ms)`;

/** Inline style for the screen root. */
export const motionScale = (reduce: boolean) => ({ ["--k" as string]: reduce ? 0 : 1 }) as CSSProperties;

/** True `ms` after `on` turns true, false the moment it turns false. Sequences moves that CSS delays cannot reach. */
export function useDelayed(on: boolean, ms: number) {
  const reduce = useReducedMotion();
  const [late, setLate] = useState(false);
  const delay = reduce ? 0 : ms;
  useEffect(() => {
    if (!on) return;
    const id = window.setTimeout(() => setLate(true), delay);
    return () => {
      window.clearTimeout(id);
      setLate(false);
    };
  }, [on, delay]);
  return on && late;
}

/** Counts 0..count, one every `intervalMs`, while `on`. Lets a list fill entry by entry, on time. */
export function useStepped(on: boolean, count: number, intervalMs: number, startMs = 0) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) return;
    const ids = Array.from({ length: count }, (_, i) => window.setTimeout(() => setN(i + 1), reduce ? 0 : startMs + i * intervalMs));
    return () => {
      ids.forEach((id) => window.clearTimeout(id));
      setN(0);
    };
  }, [on, count, intervalMs, startMs, reduce]);
  return on ? n : 0;
}

interface FadeProps {
  on: boolean;
  children: ReactNode;
  /** ms to hold before entering. */
  delayMs?: number;
  x?: number;
  y?: number;
  duration?: number;
  as?: "div" | "span" | "li" | "p";
  className?: string;
  style?: CSSProperties;
}

/** Opacity plus a short slew. Hidden content stays in the DOM, out of the accessibility tree. */
export function Fade({ on, children, delayMs = 0, x = 0, y = 6, duration = 600, as = "div", className, style }: FadeProps) {
  // Polymorphic tag, typed as a div: every tag we pass accepts the same props.
  const Tag = as as "div";
  return (
    <Tag
      aria-hidden={on ? undefined : true}
      className={cn("transition-[opacity,transform] ease-[var(--ease-out)]", className)}
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "none" : `translate3d(${x}px, ${y}px, 0)`,
        transitionDuration: `${on ? duration : 260}ms`,
        transitionDelay: on ? wait(delayMs) : "0ms",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

interface SwapProps {
  /** Show `second` instead of `first`. */
  flipped: boolean;
  first: ReactNode;
  second: ReactNode;
  delayMs?: number;
  align?: "start" | "end";
  className?: string;
}

/** Two values sharing one slot: the cell is as large as the larger, so nothing reflows when they trade. */
export function Swap({ flipped, first, second, delayMs = 0, align = "start", className }: SwapProps) {
  const cell = "col-start-1 row-start-1 transition-opacity duration-500 ease-[var(--ease-out)]";
  return (
    <span className={cn("inline-grid items-center", align === "end" ? "justify-items-end" : "justify-items-start", className)}>
      <span aria-hidden={flipped ? true : undefined} className={cell} style={{ opacity: flipped ? 0 : 1 }}>
        {first}
      </span>
      <span
        aria-hidden={flipped ? undefined : true}
        className={cell}
        style={{ opacity: flipped ? 1 : 0, transitionDelay: flipped ? wait(delayMs) : "0ms" }}
      >
        {second}
      </span>
    </span>
  );
}

interface HBarProps {
  /** 0..1 */
  value: number;
  on?: boolean;
  delayMs?: number;
  color?: string;
  height?: number;
  className?: string;
}

/** Horizontal bar that grows from the left. scaleX only, so a column of them costs nothing. */
export function HBar({ value, on = true, delayMs = 0, color = BAR_GREY, height = 3, className }: HBarProps) {
  const v = Math.min(1, Math.max(0, value));
  return (
    <div className={cn("overflow-hidden rounded-full bg-white/[0.06]", className)} style={{ height }}>
      <div
        className="h-full origin-left rounded-full transition-[transform,background-color] duration-[900ms] ease-[var(--ease-out)]"
        style={{ background: color, transform: `scaleX(${on ? v : 0})`, transitionDelay: on ? wait(delayMs) : "0ms" }}
      />
    </div>
  );
}

interface TickProps {
  on: boolean;
  delayMs?: number;
  /** Draw the checkbox around the mark (checklists) or the bare mark (table cells). */
  boxed?: boolean;
  className?: string;
}

export function Tick({ on, delayMs = 0, boxed = true, className }: TickProps) {
  const transitionDelay = on ? wait(delayMs) : "0ms";
  const mark = (
    <svg viewBox="0 0 10 10" className={boxed ? "h-2 w-2" : cn("h-[9px] w-[9px] shrink-0", className)} aria-hidden>
      <path
        d="M2 5.2 4.2 7.4 8 3"
        fill="none"
        stroke="var(--ok)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        style={{ strokeDashoffset: on ? 0 : 1, transition: "stroke-dashoffset 500ms var(--ease-out)", transitionDelay }}
      />
    </svg>
  );
  if (!boxed) return mark;
  return (
    <span
      className={cn("grid h-[13px] w-[13px] shrink-0 place-items-center rounded-[3.5px] border transition-colors duration-500", className)}
      style={{
        borderColor: on ? "var(--ok)" : "var(--line-strong)",
        background: on ? "color-mix(in srgb, var(--ok) 22%, transparent)" : "transparent",
        transitionDelay,
      }}
    >
      {mark}
    </span>
  );
}

/** Quiet mono tag: a lead's source, a request's channel, an activity's kind. */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-[16px] items-center whitespace-nowrap rounded-[4px] border border-[var(--line)] bg-white/[0.025] px-[5px] font-mono text-[9px] uppercase leading-none tracking-[0.07em] text-[var(--text-2)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** A person, without a photograph. */
export function Initials({ name, size = 26, className }: { name: string; size?: number; className?: string }) {
  const letters = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full border border-[var(--line-strong)] bg-white/[0.04] font-mono text-[9px] tracking-[0.04em] text-[var(--text-1)]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {letters}
    </span>
  );
}

/** Column heading inside a table. */
export function ColumnLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("t-label !text-[9px] !text-[var(--text-2)]", className)}>{children}</span>;
}
