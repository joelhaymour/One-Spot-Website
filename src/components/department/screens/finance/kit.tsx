"use client";

import type { CSSProperties, ReactNode } from "react";
import { Panel, PanelHeader, ScanLine } from "@/components/ui/Panel";
import type { RegionId } from "@/content/departments";
import { cn } from "@/lib/cn";
import { clamp } from "@/lib/math";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useExperience } from "@/state/experience";

/*
 * Console kit: the few primitives the Finance and Operations consoles share (Operations imports it from here).
 * Everything here is driven by booleans derived from the story step, so a screen stays a pure
 * function of `step`: entrances wait their turn (transition-delay), exits never wait, which is what
 * makes scrolling backwards reverse cleanly.
 */

/** Mono telemetry text at console scale (the display is authored in virtual px). */
export const MONO = "font-mono text-[9.5px] uppercase leading-none tracking-[0.08em]";

/**
 * Entrance delay. Multiplied by --k, which the screen root sets to 0 under reduced motion:
 * the global stylesheet collapses durations, this collapses the staggers with them.
 */
export const wait = (ms: number) => `calc(var(--k, 1) * ${ms}ms)`;

/** Inline style for the screen root. */
export const motionScale = (reduce: boolean) => ({ ["--k" as string]: reduce ? 0 : 1 }) as CSSProperties;

/** Does the camera's focus include this region? Compound regions ("AB", "CD") light both panels. */
export const covers = (focus: RegionId | null, region: "A" | "B" | "C" | "D") => focus !== null && focus.includes(region);

/** Ambient loops (scan lines, breathing lights) run only when the visitor allows motion. */
export function useAmbient(): boolean {
  const reduce = useReducedMotion();
  const paused = useExperience((s) => s.paused);
  return !reduce && !paused;
}

interface ConsolePanelProps {
  label: string;
  right?: ReactNode;
  /** The panel this step's camera focus points at. */
  active?: boolean;
  /** The agent is reading this panel. */
  scanning?: boolean;
  children: ReactNode;
  className?: string;
}

/** A console region: hairline panel, h-9 header, body. Same frame on every console. */
export function ConsolePanel({ label, right, active, scanning, children, className }: ConsolePanelProps) {
  const ambient = useAmbient();
  return (
    <Panel active={active} className="flex h-full w-full flex-col overflow-hidden">
      <PanelHeader label={label} right={right} />
      <div className={cn("relative min-h-0 flex-1 px-3.5 pb-3.5", className)}>{children}</div>
      <ScanLine active={Boolean(scanning) && ambient} />
    </Panel>
  );
}

interface AppearProps {
  on: boolean;
  /** ms before the entrance starts. Exits are immediate. */
  delay?: number;
  x?: number;
  y?: number;
  as?: "div" | "span";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** Content that exists from the first byte but only shows once the story has reached it. */
export function Appear({ on, delay = 0, x = 0, y = 6, as: Tag = "div", className, style, children }: AppearProps) {
  return (
    <Tag
      aria-hidden={on ? undefined : true}
      className={cn("transition-[opacity,transform] duration-500 ease-[var(--ease-out)]", className)}
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "none" : `translate3d(${x}px, ${y}px, 0)`,
        transitionDelay: on ? wait(delay) : "0ms",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

interface SwapProps {
  /** Which item is showing. */
  index: number;
  items: ReactNode[];
  delay?: number;
  /** Fill the line instead of hugging the content. */
  block?: boolean;
  className?: string;
  itemClassName?: string;
}

/** Stacked states of one slot. The outgoing state clears before the incoming one settles. */
export function Swap({ index, items, delay = 0, block, className, itemClassName }: SwapProps) {
  return (
    <span className={cn(block ? "grid w-full" : "inline-grid", className)}>
      {items.map((item, i) => {
        const current = i === index;
        return (
          <span
            key={i}
            aria-hidden={current ? undefined : true}
            className={cn(
              "col-start-1 row-start-1 min-w-0 transition-[opacity,transform] duration-[420ms] ease-[var(--ease-out)]",
              itemClassName,
            )}
            style={{
              opacity: current ? 1 : 0,
              transform: current ? "none" : `translate3d(0, ${i < index ? -4 : 4}px, 0)`,
              transitionDelay: current ? wait(delay + 140) : "0ms",
            }}
          >
            {item}
          </span>
        );
      })}
    </span>
  );
}

interface TickProps {
  on: boolean;
  delay?: number;
  color?: string;
  size?: number;
  className?: string;
}

/** An empty ring that gets checked off. */
export function Tick({ on, delay = 0, color = "var(--ok)", size = 12, className }: TickProps) {
  const hold = on ? wait(delay) : "0ms";
  return (
    <span
      aria-hidden
      className={cn("inline-grid shrink-0 place-items-center rounded-full border", className)}
      style={{
        width: size,
        height: size,
        borderColor: on ? `color-mix(in srgb, ${color} 55%, transparent)` : "var(--line-strong)",
        transition: `border-color 420ms var(--ease-out) ${hold}`,
      }}
    >
      <svg viewBox="0 0 12 12" width={size - 2} height={size - 2}>
        <path
          d="M2.8 6.4l2.1 2.1 4.3-4.8"
          fill="none"
          stroke={color}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          style={{ strokeDashoffset: on ? 0 : 1, transition: `stroke-dashoffset 420ms var(--ease-out) ${hold}` }}
        />
      </svg>
    </span>
  );
}

interface MeterProps {
  /** 0..1 */
  value: number;
  color?: string;
  delay?: number;
  duration?: number;
  height?: number;
  className?: string;
}

/** Thin bar. Like ui/Progress, but it can wait its turn in a sequence and change tone. */
export function Meter({ value, color = "rgba(255,255,255,0.34)", delay = 0, duration = 900, height = 3, className }: MeterProps) {
  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-white/[0.07]", className)} style={{ height }}>
      <div
        className="h-full origin-left rounded-full"
        style={{
          background: color,
          transform: `scaleX(${clamp(value)})`,
          transition: `transform ${duration}ms var(--ease-out) ${wait(delay)}, background-color 480ms var(--ease-out) ${wait(delay)}`,
        }}
      />
    </div>
  );
}

/** Header mark: on the report step every panel's result is gathered, one after another. */
export function InReport({ on, order = 0 }: { on: boolean; order?: number }) {
  const delay = order * 160;
  return (
    <Appear as="span" on={on} delay={delay} y={0} className="inline-flex items-center gap-1.5">
      <Tick on={on} delay={delay + 140} color="var(--text-1)" size={11} />
      <span className={cn(MONO, "text-[var(--text-1)]")}>In report</span>
    </Appear>
  );
}

/** Small status word with a light: quieter than a chip, for table cells. */
export function StatusWord({ color = "var(--text-3)", className, children }: { color?: string; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex h-[18px] items-center gap-1.5", MONO, className)}>
      <span className="h-1 w-1 shrink-0 rounded-full" style={{ background: color }} />
      {children}
    </span>
  );
}
