"use client";

import { memo } from "react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { StatusChip } from "@/components/ui/Panel";
import { TypedText } from "@/components/ui/TypedText";
import { cn } from "@/lib/cn";
import { FORECAST } from "./data";
import { Appear, ConsolePanel, InReport, MONO, Swap, wait } from "./kit";

interface ForecastPanelProps {
  active: boolean;
  /** The forecast has been corrected for how customers actually pay. */
  learned: boolean;
  reported: boolean;
  /** The line the agent writes when the forecast is adjusted (its log entry for the step). */
  note: string;
}

/*
 * The chart is private rather than ui/LineChart because the story needs three things that one does not
 * do: a fixed money scale with a reserve line, a line that changes from "the forecast" to "the old
 * assumption", and a marked low point. The geometry is constant, so it is computed once per module.
 */
const W = 349;
const H = 118;
const PLOT = { left: 36, right: 8, top: 8, bottom: 18 };
const WEEKS = FORECAST.naive.length;
const [LO, HI] = FORECAST.domain;
const ACCENT = "rgb(var(--accent-rgb))";

const px = (i: number) => PLOT.left + (i * (W - PLOT.left - PLOT.right)) / (WEEKS - 1);
const py = (v: number) => PLOT.top + (1 - (v - LO) / (HI - LO)) * (H - PLOT.top - PLOT.bottom);

/** Catmull-Rom to cubic bezier: the same calm curve ui/Charts draws. Fixed precision keeps server and client identical. */
function smooth(data: readonly number[]) {
  const pts = data.map((v, i) => [px(i), py(v)] as const);
  let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(2)},${c1[1].toFixed(2)} ${c2[0].toFixed(2)},${c2[1].toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  return d;
}

const NAIVE_PATH = smooth(FORECAST.naive);
const LEARNED_PATH = smooth(FORECAST.learned);
const Y_TICKS = [2.5, 2.0, FORECAST.reserve];
const X_TICKS = [0, 3, 6, 9, 12];
const NAIVE_LOW = { x: px(FORECAST.naiveLow.week - 1), y: py(FORECAST.naive[FORECAST.naiveLow.week - 1]) };
const LEARNED_LOW = { x: px(FORECAST.learnedLow.week - 1), y: py(FORECAST.learned[FORECAST.learnedLow.week - 1]) };

/** The learned line takes this long to draw; the low point is marked once it has. */
const DRAW = 1400;
const MARK_AT = 300 + DRAW - 200;

const fade = (on: boolean, delay = 0) => ({
  opacity: on ? 1 : 0,
  transition: `opacity 600ms var(--ease-out) ${on ? wait(delay) : "0ms"}`,
});

const Chart = memo(function Chart({ learned }: { learned: boolean }) {
  const bottom = H - PLOT.bottom;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block overflow-visible" aria-hidden>
      {Y_TICKS.map((v) => {
        const reserve = v === FORECAST.reserve;
        return (
          <g key={v}>
            <line
              x1={PLOT.left}
              x2={W - PLOT.right}
              y1={py(v)}
              y2={py(v)}
              stroke={reserve ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.055)"}
              strokeWidth={1}
              strokeDasharray={reserve ? "3 4" : "2 5"}
            />
            <text x={PLOT.left - 8} y={py(v) + 3} textAnchor="end" className="fill-[var(--text-2)] font-mono text-[8.5px]">
              ${v.toFixed(1)}M
            </text>
          </g>
        );
      })}
      <text x={W - PLOT.right} y={py(FORECAST.reserve) - 4} textAnchor="end" className="fill-[var(--text-2)] font-mono text-[8.5px] uppercase tracking-[0.08em]">
        Reserve
      </text>
      <line x1={PLOT.left} x2={W - PLOT.right} y1={bottom} y2={bottom} stroke="rgba(255,255,255,0.085)" strokeWidth={1} />
      {X_TICKS.map((i) => (
        <text key={i} x={px(i)} y={H - 4} textAnchor={i === 0 ? "start" : i === WEEKS - 1 ? "end" : "middle"} className="fill-[var(--text-2)] font-mono text-[8.5px]">
          W{i + 1}
        </text>
      ))}

      {/* The invoice-date forecast: the working line at rest, the old assumption once the agent has learned better. */}
      <path d={NAIVE_PATH} fill="none" stroke="var(--text-1)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" style={fade(!learned)} />
      <path d={NAIVE_PATH} fill="none" stroke="var(--text-2)" strokeWidth={1.2} strokeDasharray="3 4" style={fade(learned)} />
      <g style={fade(!learned)}>
        <line x1={NAIVE_LOW.x} x2={NAIVE_LOW.x} y1={NAIVE_LOW.y + 5} y2={bottom} stroke="rgba(255,255,255,0.16)" strokeWidth={1} />
        <circle cx={NAIVE_LOW.x} cy={NAIVE_LOW.y} r={3} fill="var(--bg-1)" stroke="var(--text-0)" strokeWidth={1.4} />
      </g>

      <path
        d={LEARNED_PATH}
        fill="none"
        stroke={ACCENT}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        style={{
          strokeDashoffset: learned ? 0 : 1,
          transition: learned ? `stroke-dashoffset ${DRAW}ms var(--ease-in-out) ${wait(300)}` : "stroke-dashoffset 420ms var(--ease-out)",
        }}
      />
      <g style={fade(learned, MARK_AT)}>
        <line x1={LEARNED_LOW.x} x2={LEARNED_LOW.x} y1={LEARNED_LOW.y + 6} y2={bottom} stroke="rgba(var(--accent-rgb), 0.4)" strokeWidth={1} />
        <circle cx={LEARNED_LOW.x} cy={LEARNED_LOW.y} r={3.4} fill="var(--bg-1)" stroke={ACCENT} strokeWidth={1.6} />
        <text x={LEARNED_LOW.x + 9} y={LEARNED_LOW.y + 11} className="fill-[var(--text-0)] font-mono text-[9px]">
          {FORECAST.learnedLow.label} · W{FORECAST.learnedLow.week}
        </text>
      </g>
    </svg>
  );
});

function Key({ label, dashed, color }: { label: string; dashed?: boolean; color: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <svg width={14} height={4} viewBox="0 0 14 4" aria-hidden>
        <line x1={0} x2={14} y1={2} y2={2} stroke={color} strokeWidth={1.6} strokeDasharray={dashed ? "3 3" : undefined} />
      </svg>
      <span className="text-[10px] leading-none text-[var(--text-1)]">{label}</span>
    </span>
  );
}

export const ForecastPanel = memo(function ForecastPanel({ active, learned, reported, note }: ForecastPanelProps) {
  return (
    <ConsolePanel
      label="Cash forecast"
      active={active}
      className="flex flex-col"
      right={
        <>
          <InReport on={reported} order={3} />
          <Swap
            index={learned ? 1 : 0}
            delay={learned ? MARK_AT : 0}
            className="justify-items-end"
            items={[
              <StatusChip key="naive">{WEEKS} weeks</StatusChip>,
              <StatusChip key="learned" tone="ok">
                Adjusted
              </StatusChip>,
            ]}
          />
        </>
      }
    >
      <div className="grid grid-cols-[auto_1fr_auto] items-start gap-x-3 pt-0.5">
        <div className="flex flex-col gap-[7px]">
          <span className={cn(MONO, "text-[var(--text-2)]")}>Lowest cash</span>
          <div className="flex items-baseline gap-2 text-[22px] leading-none tracking-[-0.02em] text-[var(--text-0)]">
            <AnimatedNumber value={learned ? FORECAST.learnedLow.value : FORECAST.naiveLow.value} format="compact-currency" duration={1.6} />
            <Swap
              index={learned ? 1 : 0}
              itemClassName="t-num text-[10px] tracking-normal text-[var(--text-2)]"
              items={[`week ${FORECAST.naiveLow.week}`, `week ${FORECAST.learnedLow.week}`]}
            />
          </div>
        </div>
        <div className="flex flex-col gap-[7px] border-l border-[var(--line-faint)] pl-3">
          <span className={cn(MONO, "text-[var(--text-2)]")}>Customers pay</span>
          <Swap
            block
            index={learned ? 1 : 0}
            itemClassName="flex h-[22px] items-end text-[11.5px] leading-none"
            items={[
              <span key="naive" className="text-[var(--text-2)]">
                On the due date
              </span>,
              <span key="learned" className="text-[var(--text-0)]">
                11 days late
              </span>,
            ]}
          />
        </div>
        <div className="flex flex-col items-start gap-[7px] pt-[1px]">
          <Swap index={learned ? 1 : 0} items={[<Key key="a" label="By invoice date" color="var(--text-1)" />, <Key key="b" label="By invoice date" dashed color="var(--text-2)" />]} />
          <Appear on={learned} delay={300} y={0}>
            <Key label="As customers pay" color={ACCENT} />
          </Appear>
        </div>
      </div>

      <div className="mt-2">
        <Chart learned={learned} />
      </div>

      <div className="mt-auto flex h-[22px] items-end border-t border-[var(--line-faint)] text-[10.5px]">
        <Swap
          block
          index={learned ? 1 : 0}
          items={[
            <span key="naive" className="block text-[var(--text-2)]">
              Assumes every invoice is paid on its due date.
            </span>,
            <span key="learned" className="block text-[var(--text-0)]">
              <TypedText text={note} active={learned} delay={1.2} speed={52} />
            </span>,
          ]}
        />
      </div>
    </ConsolePanel>
  );
});
