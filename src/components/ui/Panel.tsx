import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Tone = "neutral" | "accent" | "ok" | "warn" | "crit";

export const toneColor: Record<Tone, string> = {
  neutral: "var(--text-2)",
  accent: "rgb(var(--accent-rgb))",
  ok: "var(--ok)",
  warn: "var(--warn)",
  crit: "var(--crit)",
};

interface PanelProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Lights the border in the live accent: the panel the agent is attending to. */
  active?: boolean;
  /** Dims the panel so attention goes elsewhere. */
  muted?: boolean;
  raised?: boolean;
}

/** Hairline surface. The basic unit of every HUD and workstation. */
export function Panel({ children, className, style, active, muted, raised }: PanelProps) {
  return (
    <div
      className={cn(
        raised ? "panel-raised" : "panel",
        "transition-[border-color,opacity,box-shadow,filter] duration-500 ease-[var(--ease-out)]",
        muted && "opacity-35 saturate-50",
        className,
      )}
      style={{
        ...(active
          ? {
              borderColor: "rgba(var(--accent-rgb), 0.55)",
              boxShadow:
                "0 0 0 1px rgba(var(--accent-rgb), 0.12), 0 0 40px -12px rgba(var(--accent-rgb), 0.35), inset 0 0 30px -20px rgba(var(--accent-rgb), 0.5)",
            }
          : null),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface PanelHeaderProps {
  label: string;
  right?: ReactNode;
  className?: string;
}

export function PanelHeader({ label, right, className }: PanelHeaderProps) {
  return (
    <div className={cn("flex h-9 items-center justify-between px-3.5", className)}>
      <span className="t-label">{label}</span>
      {right ? <span className="flex items-center gap-2">{right}</span> : null}
    </div>
  );
}

interface StatusChipProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  pulse?: boolean;
}

export function StatusChip({ tone = "neutral", children, className, pulse }: StatusChipProps) {
  const color = toneColor[tone];
  return (
    <span
      className={cn(
        "inline-flex h-[18px] items-center gap-1.5 rounded-[5px] border px-1.5 font-mono text-[9.5px] uppercase leading-none tracking-[0.08em]",
        className,
      )}
      style={{
        color,
        borderColor: `color-mix(in srgb, ${color} 32%, transparent)`,
        background: `color-mix(in srgb, ${color} 9%, transparent)`,
      }}
    >
      <span
        className={cn("h-1 w-1 rounded-full", pulse && "spot-breathe")}
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      {children}
    </span>
  );
}

/** Small status light. */
export function Dot({ tone = "ok", className, pulse }: { tone?: Tone; className?: string; pulse?: boolean }) {
  const color = toneColor[tone];
  return (
    <span
      className={cn("inline-block h-[5px] w-[5px] shrink-0 rounded-full", pulse && "spot-breathe", className)}
      style={{ background: color, boxShadow: `0 0 8px ${color}` }}
    />
  );
}

/** A thin line of light that sweeps a panel while an agent reads it. */
export function ScanLine({ active, duration = 1.6 }: { active: boolean; duration?: number }) {
  if (!active) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <div
        className="absolute inset-x-0 top-0 h-full"
        style={{ animation: `scan-y ${duration}s var(--ease-in-out) infinite` }}
      >
        <div
          className="h-px w-full"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(var(--accent-rgb), 0.9), transparent)",
            boxShadow: "0 0 18px 2px rgba(var(--accent-rgb), 0.35)",
          }}
        />
        <div
          className="h-10 w-full -translate-y-10"
          style={{ background: "linear-gradient(180deg, transparent, rgba(var(--accent-rgb), 0.07))" }}
        />
      </div>
    </div>
  );
}
