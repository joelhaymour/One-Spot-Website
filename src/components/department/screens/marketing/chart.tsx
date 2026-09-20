"use client";

import { memo, useMemo } from "react";
import { LINE_GREY, wait } from "./kit";

/*
 * Plot primitives for the Marketing console. The shared LineChart draws every series at once on its own
 * scale; this console needs lines that arrive at different steps, stop at "day 3", and share a domain
 * across layers. Same look as the shared charts: Catmull-Rom line, dashed hairline grid, mono ticks.
 * Pure arithmetic only (no trig, no random), so server and client agree to the last digit.
 */

export type Pt = readonly [number, number];

/** Plot box in px: size, inner padding (left, right, top, bottom) and the value domain. */
export interface Frame {
  w: number;
  h: number;
  l: number;
  r: number;
  t: number;
  b: number;
  min: number;
  max: number;
}

export const yOf = (v: number, f: Frame) => f.h - f.b - ((v - f.min) / (f.max - f.min || 1)) * (f.h - f.t - f.b);

export const project = (data: number[], f: Frame): Pt[] => {
  const step = (f.w - f.l - f.r) / Math.max(1, data.length - 1);
  return data.map((v, i) => [f.l + i * step, yOf(v, f)] as const);
};

type Bezier = readonly [Pt, Pt, Pt, Pt];

const beziers = (pts: Pt[]): Bezier[] =>
  pts.slice(0, -1).map((p1, i) => {
    const p0 = pts[Math.max(0, i - 1)];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    return [p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2] as const;
  });

const n = (v: number) => v.toFixed(2);

export const smoothPath = (pts: Pt[]) =>
  beziers(pts).reduce((d, [, c1, c2, p2]) => `${d} C${n(c1[0])},${n(c1[1])} ${n(c2[0])},${n(c2[1])} ${n(p2[0])},${n(p2[1])}`, `M${n(pts[0][0])},${n(pts[0][1])}`);

const SAMPLES = 10;
const bezierLength = ([a, b, c, d]: Bezier) => {
  let length = 0;
  let px = a[0];
  let py = a[1];
  for (let s = 1; s <= SAMPLES; s++) {
    const t = s / SAMPLES;
    const u = 1 - t;
    const x = u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0];
    const y = u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1];
    length += Math.sqrt((x - px) * (x - px) + (y - py) * (y - py));
    px = x;
    py = y;
  }
  return length;
};

/** How far along the drawn line data point `index` sits, 0..1. Lets a dash offset stop a line on a given day. */
export const fractionAt = (pts: Pt[], index: number) => {
  const lengths = beziers(pts).map(bezierLength);
  const total = lengths.reduce((a, b) => a + b, 0);
  const upTo = lengths.slice(0, Math.max(0, index)).reduce((a, b) => a + b, 0);
  return total ? Math.min(1, upTo / total) : 0;
};

interface PlotLineProps {
  pts: Pt[];
  color: string;
  /** Draw up to this data index. Omit for the whole line, negative for none of it. */
  upTo?: number;
  opacity?: number;
  width?: number;
  /** ms before the line starts to draw. */
  delay?: number;
}

export const PlotLine = memo(function PlotLine({ pts, color, upTo, opacity = 1, width = 1.75, delay = 0 }: PlotLineProps) {
  const d = useMemo(() => smoothPath(pts), [pts]);
  const drawn = useMemo(() => (upTo === undefined ? 1 : upTo < 0 ? 0 : fractionAt(pts, upTo)), [pts, upTo]);
  const hold = drawn > 0 ? wait(delay) : "0ms";
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      style={{
        strokeDashoffset: 1 - drawn,
        // An undrawn round-capped dash still shows its cap at the origin, so hide the line entirely.
        opacity: drawn > 0 ? opacity : 0,
        transition: `stroke-dashoffset 1500ms var(--ease-in-out) ${hold}, opacity 500ms var(--ease-out) ${hold}, stroke 500ms var(--ease-out)`,
      }}
    />
  );
});

interface PlotAxesProps {
  frame: Frame;
  yTicks?: number[];
  yPrefix?: string;
  xLabels?: string[];
}

export const PlotAxes = memo(function PlotAxes({ frame: f, yTicks = [], yPrefix = "", xLabels = [] }: PlotAxesProps) {
  const tick = "fill-[var(--text-2)] font-mono text-[9px] tracking-[0.04em]";
  return (
    <g>
      {yTicks.map((v, i) => (
        <g key={v}>
          <line
            x1={f.l}
            x2={f.w - f.r}
            y1={yOf(v, f)}
            y2={yOf(v, f)}
            stroke="rgba(255,255,255,0.055)"
            strokeWidth={1}
            strokeDasharray={i === 0 ? undefined : "2 5"}
          />
          <text x={f.l - 6} y={yOf(v, f) + 3} textAnchor="end" className={tick}>
            {yPrefix + v}
          </text>
        </g>
      ))}
      {xLabels.map((label, i) => (
        <text
          key={label}
          x={f.l + (i * (f.w - f.l - f.r)) / Math.max(1, xLabels.length - 1)}
          y={f.h - 4}
          textAnchor={i === 0 ? "start" : i === xLabels.length - 1 ? "end" : "middle"}
          className={tick}
        >
          {label}
        </text>
      ))}
    </g>
  );
});

const SPARK: Frame = { w: 56, h: 20, l: 1, r: 1, t: 2, b: 2, min: 0.55, max: 1.45 };

/**
 * Table sparkline. Each series is plotted relative to its own first value on one shared scale,
 * so a campaign that moved 38% looks different from one that moved 3%.
 */
export const Spark = memo(function Spark({ data, color = LINE_GREY }: { data: number[]; color?: string }) {
  const pts = useMemo(() => project(data.map((v) => v / data[0]), SPARK), [data]);
  return (
    <svg viewBox={`0 0 ${SPARK.w} ${SPARK.h}`} width={SPARK.w} height={SPARK.h} className="block overflow-visible" aria-hidden>
      <line x1={0} x2={SPARK.w} y1={yOf(1, SPARK)} y2={yOf(1, SPARK)} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
      <PlotLine pts={pts} color={color} width={1.4} />
    </svg>
  );
});
