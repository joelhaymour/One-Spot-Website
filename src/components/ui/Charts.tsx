import { useId } from "react";
import { cn } from "@/lib/cn";

/* All charts are plain SVG: crisp at any display scale, zero runtime cost, real DOM for a11y. */

function toPath(data: number[], w: number, h: number, pad = 2, domain?: [number, number]) {
  const min = domain ? domain[0] : Math.min(...data);
  const max = domain ? domain[1] : Math.max(...data);
  const span = max - min || 1;
  const step = (w - pad * 2) / Math.max(1, data.length - 1);
  const pts = data.map((v, i) => [pad + i * step, h - pad - ((v - min) / span) * (h - pad * 2)] as const);
  // Catmull-Rom -> cubic bezier for a calm, continuous line.
  let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  return { d, pts };
}

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  area?: boolean;
  /** When false the line is undrawn; flipping to true draws it on. */
  drawn?: boolean;
  dot?: boolean;
  strokeWidth?: number;
  className?: string;
}

export function Sparkline({
  data,
  width = 120,
  height = 32,
  color = "rgb(var(--accent-rgb))",
  area = true,
  drawn = true,
  dot = true,
  strokeWidth = 1.5,
  className,
}: SparklineProps) {
  const id = useId();
  const { d, pts } = toPath(data, width, height, 3);
  const end = pts[pts.length - 1];
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("overflow-visible", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.22" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {area && (
        <path
          d={`${d} L${end[0]},${height} L${pts[0][0]},${height} Z`}
          fill={`url(#${id}-f)`}
          style={{ opacity: drawn ? 1 : 0, transition: "opacity 900ms var(--ease-out) 300ms" }}
        />
      )}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        style={{ strokeDashoffset: drawn ? 0 : 1, transition: "stroke-dashoffset 1400ms var(--ease-in-out)" }}
      />
      {dot && (
        <circle
          cx={end[0]}
          cy={end[1]}
          r={2.2}
          fill={color}
          style={{
            opacity: drawn ? 1 : 0,
            transition: "opacity 400ms var(--ease-out) 1200ms",
            filter: `drop-shadow(0 0 4px ${color})`,
          }}
        />
      )}
    </svg>
  );
}

export interface Series {
  data: number[];
  color?: string;
  dashed?: boolean;
  muted?: boolean;
  label?: string;
}

interface LineChartProps {
  series: Series[];
  width?: number;
  height?: number;
  drawn?: boolean;
  /** Index range [from, to] to shade: "this is the part the agent noticed". */
  highlight?: [number, number] | null;
  highlightColor?: string;
  gridRows?: number;
  xLabels?: string[];
  className?: string;
}

export function LineChart({
  series,
  width = 520,
  height = 180,
  drawn = true,
  highlight = null,
  highlightColor = "var(--warn)",
  gridRows = 4,
  xLabels,
  className,
}: LineChartProps) {
  // Share one vertical scale across series so they are honestly comparable.
  const all = series.flatMap((s) => s.data);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const n = series[0]?.data.length ?? 0;
  const padX = 6;
  const padTop = 8;
  const padBottom = xLabels ? 20 : 8;
  const plotH = height - padTop - padBottom;
  const step = (width - padX * 2) / Math.max(1, n - 1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className={cn("overflow-visible", className)} aria-hidden>
      {Array.from({ length: gridRows + 1 }, (_, i) => (
        <line
          key={i}
          x1={padX}
          x2={width - padX}
          y1={padTop + (plotH / gridRows) * i}
          y2={padTop + (plotH / gridRows) * i}
          stroke="rgba(255,255,255,0.055)"
          strokeWidth={1}
          strokeDasharray={i === gridRows ? undefined : "2 5"}
        />
      ))}
      {highlight && (
        <rect
          x={padX + highlight[0] * step}
          y={padTop}
          width={(highlight[1] - highlight[0]) * step}
          height={plotH}
          fill={highlightColor}
          opacity={0.08}
          rx={3}
          style={{ transition: "opacity 600ms var(--ease-out)" }}
        />
      )}
      {series.map((s, i) => {
        const { d } = toPath(s.data, width - padX * 2, plotH, 0, [min, max]);
        const color = s.color ?? "rgb(var(--accent-rgb))";
        return (
          <path
            key={i}
            d={d}
            transform={`translate(${padX}, ${padTop})`}
            fill="none"
            stroke={color}
            strokeOpacity={s.muted ? 0.35 : 1}
            strokeWidth={s.muted ? 1.25 : 1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={s.dashed ? "0.012 0.012" : 1}
            style={
              s.dashed
                ? { opacity: drawn ? 1 : 0, transition: `opacity 900ms var(--ease-out) ${i * 160}ms` }
                : { strokeDashoffset: drawn ? 0 : 1, transition: `stroke-dashoffset 1500ms var(--ease-in-out) ${i * 160}ms` }
            }
          />
        );
      })}
      {xLabels?.map((label, i) => (
        <text
          key={label + i}
          x={padX + (i * (width - padX * 2)) / Math.max(1, xLabels.length - 1)}
          y={height - 4}
          textAnchor={i === 0 ? "start" : i === xLabels.length - 1 ? "end" : "middle"}
          className="fill-[var(--text-3)] font-mono text-[9px] tracking-[0.06em]"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}

interface BarsProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  highlightIndex?: number | null;
  highlightColor?: string;
  grown?: boolean;
  gap?: number;
  className?: string;
}

export function Bars({
  data,
  width = 240,
  height = 64,
  color = "rgba(255,255,255,0.22)",
  highlightIndex = null,
  highlightColor = "rgb(var(--accent-rgb))",
  grown = true,
  gap = 4,
  className,
}: BarsProps) {
  const max = Math.max(...data) || 1;
  const bw = (width - gap * (data.length - 1)) / data.length;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className={className} aria-hidden>
      {data.map((v, i) => {
        const h = Math.max(2, (v / max) * height);
        const lit = i === highlightIndex;
        return (
          <rect
            key={i}
            x={i * (bw + gap)}
            y={height - h}
            width={bw}
            height={h}
            rx={Math.min(2, bw / 2)}
            fill={lit ? highlightColor : color}
            style={{
              transformBox: "fill-box",
              transformOrigin: "50% 100%",
              transform: grown ? "scaleY(1)" : "scaleY(0.02)",
              transition: `transform 900ms var(--ease-out) ${i * 35}ms, fill 400ms var(--ease-out)`,
              filter: lit ? `drop-shadow(0 0 6px ${highlightColor})` : undefined,
            }}
          />
        );
      })}
    </svg>
  );
}

interface ArcProgressProps {
  /** 0..1 */
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  className?: string;
  children?: React.ReactNode;
}

/** 270° gauge. Used for "% of monthly target". */
export function ArcProgress({ value, size = 96, stroke = 5, color = "rgb(var(--accent-rgb))", className, children }: ArcProgressProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const sweep = 0.75;
  return (
    <div className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 rotate-[135deg]" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${c * sweep} ${c}`} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * sweep * Math.min(1, Math.max(0, value))} ${c}`}
          style={{ transition: "stroke-dasharray 1200ms var(--ease-out)", filter: `drop-shadow(0 0 5px ${color})` }}
        />
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}

interface ProgressProps {
  value: number;
  tone?: string;
  className?: string;
  height?: number;
}

export function Progress({ value, tone = "rgb(var(--accent-rgb))", className, height = 3 }: ProgressProps) {
  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-white/[0.07]", className)} style={{ height }}>
      <div
        className="h-full origin-left rounded-full"
        style={{
          background: tone,
          transform: `scaleX(${Math.min(1, Math.max(0, value))})`,
          transition: "transform 1000ms var(--ease-out)",
          boxShadow: `0 0 10px ${tone}`,
        }}
      />
    </div>
  );
}
