import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
 * Small private kit shared by the Knowledge and Administration consoles.
 * Everything is driven by booleans derived from the story step, so the screen stays a pure function
 * of `step`: entrances wait their turn (transition-delay), exits never wait, which is what makes
 * scrolling backwards reverse cleanly.
 */

/** Mono telemetry text at console scale (the display is authored in virtual px). Colourless: pair it with one text colour. */
export const MONO = "font-mono text-[9.5px] uppercase leading-none tracking-[0.08em]";
/** The default quiet label. Never add a second colour class to it; use MONO plus a colour instead. */
export const LABEL = `${MONO} text-[var(--text-2)]`;

/** One story step, as a panel sees it. */
export interface Stage {
  /** The step has started: its result is on screen and stays there. */
  on: boolean;
  /** It is the active step: play the choreography. A step that was jumped past settles at once. */
  now: boolean;
}

/** Entrance delay for a staged move: only the active step waits its turn. */
export const lag = (stage: Stage, ms: number) => (stage.now ? ms : 0);

/**
 * Delay as CSS. Multiplied by --k, which the screen sets to 0 under reduced motion: the global
 * stylesheet already collapses durations, this collapses the staggers with them.
 */
export const wait = (ms: number) => `calc(var(--k, 1) * ${ms}ms)`;

export const motionScale = (reduce: boolean) => ({ ["--k" as string]: reduce ? 0 : 1 }) as CSSProperties;

interface ShowProps {
  when: boolean;
  /** ms before the entrance starts. Exits are immediate. */
  delay?: number;
  y?: number;
  duration?: number;
  as?: "div" | "span" | "li";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** Content that is in the DOM from the first byte but only shows once the story has reached it. */
export function Show({ when, delay = 0, y = 6, duration = 600, as: Tag = "div", className, style, children }: ShowProps) {
  return (
    <Tag
      aria-hidden={when ? undefined : true}
      className={cn("transition-[opacity,transform] ease-[var(--ease-out)]", className)}
      style={{
        opacity: when ? 1 : 0,
        transform: when ? "none" : `translate3d(0, ${y}px, 0)`,
        transitionDuration: `${when ? duration : 260}ms`,
        transitionDelay: when ? wait(delay) : "0ms",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

interface SwapProps {
  /** Show `to` instead of `from`. */
  on: boolean;
  from: ReactNode;
  to: ReactNode;
  delay?: number;
  align?: "start" | "end";
  className?: string;
}

/** Two states of one slot. `from` holds until the delay has passed, so the slot is never empty. */
export function Swap({ on, from, to, delay = 0, align = "start", className }: SwapProps) {
  return (
    <span className={cn("inline-grid items-center", align === "end" ? "justify-items-end" : "justify-items-start", className)}>
      <span
        aria-hidden={on ? true : undefined}
        className="col-start-1 row-start-1 transition-opacity duration-300 ease-[var(--ease-out)]"
        style={{ opacity: on ? 0 : 1, transitionDelay: on ? wait(delay) : "0ms" }}
      >
        {from}
      </span>
      <span
        aria-hidden={on ? undefined : true}
        className="col-start-1 row-start-1 transition-[opacity,transform] duration-500 ease-[var(--ease-out)]"
        style={{
          opacity: on ? 1 : 0,
          transform: on ? "none" : "translate3d(0, 4px, 0)",
          transitionDelay: on ? wait(delay + 160) : "0ms",
        }}
      >
        {to}
      </span>
    </span>
  );
}

interface HighlightProps {
  on: boolean;
  delay?: number;
  tone?: string;
  children: ReactNode;
}

/** A highlighter pen over a value the agent has singled out. Only the mark fades; the text never moves. */
export function Highlight({ on, delay = 0, tone = "var(--warn)", children }: HighlightProps) {
  return (
    <span className="relative inline-block">
      <span
        aria-hidden
        className="absolute -inset-x-[5px] -inset-y-px rounded-[3px] transition-opacity duration-500 ease-[var(--ease-out)]"
        style={{
          background: `color-mix(in srgb, ${tone} 16%, transparent)`,
          boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tone} 38%, transparent)`,
          opacity: on ? 1 : 0,
          transitionDelay: on ? wait(delay) : "0ms",
        }}
      />
      <span className="relative">{children}</span>
    </span>
  );
}

interface MeterProps {
  /** 0..1 */
  value: number;
  /** ms. Matched to the count beside it so the bar and the number arrive together. */
  duration?: number;
}

/** Thin neutral bar. Like ui/Progress, but it can take its time and spends no accent. */
export function Meter({ value, duration = 1000 }: MeterProps) {
  return (
    <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/[0.07]">
      <div
        className="h-full origin-left rounded-full bg-white/40 transition-transform ease-[var(--ease-out)]"
        style={{ transform: `scaleX(${Math.min(1, Math.max(0, value))})`, transitionDuration: `${duration}ms` }}
      />
    </div>
  );
}

export function Tick({ className }: { className?: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden className={cn("shrink-0", className)}>
      <path d="M2 5.3 4.1 7.4 8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DocGlyph({ className }: { className?: string }) {
  return (
    <svg width="11" height="13" viewBox="0 0 11 13" fill="none" aria-hidden className={cn("shrink-0", className)}>
      <path d="M1.5 1.5h5l3 3v7h-8z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <path d="M6.5 1.5v3h3M3.5 7h4M3.5 9h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Header mark: on the report step every panel's result is gathered, one after another. */
export function InReport({ on, order = 0 }: { on: boolean; order?: number }) {
  return (
    <Show as="span" when={on} delay={order * 180} y={0} className="inline-flex items-center gap-1">
      <Tick className="text-[var(--text-1)]" />
      <span className={cn(MONO, "text-[var(--text-1)]")}>In report</span>
    </Show>
  );
}
