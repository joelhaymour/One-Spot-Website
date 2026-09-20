"use client";

import { memo } from "react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { cn } from "@/lib/cn";
import { PlotAxes, PlotLine, project, yOf, type Frame } from "./chart";
import { BASELINE_CPL, CPL_BLENDED, CPL_SPRING, DAY_3, SLIP_FROM, VARIATIONS, WINNER } from "./data";
import { ACCENT, LABEL, Layers, Letter, LINE_GREY, Meter, MONO, useLate, wait } from "./kit";

const Y_TICKS = [30, 40, 50, 60];

/* ---------------------------------------------------------------- 28-day trend */

const TREND: Frame = { w: 296, h: 252, l: 28, r: 6, t: 8, b: 18, min: 30, max: 60 };
const TREND_LABELS = ["28 days ago", "14 days ago", "Today"];
const BLENDED_PTS = project(CPL_BLENDED, TREND);
const SPRING_PTS = project(CPL_SPRING, TREND);
const BAND_X = SPRING_PTS[SLIP_FROM][0];
const BAND_W = SPRING_PTS[SPRING_PTS.length - 1][0] - BAND_X;

interface TrendProps {
  /** The sync has landed: the blended line draws on. */
  arrived: boolean;
  /** The agent has isolated Spring Promotion: its line draws, the last 14 days are marked. */
  slipping: boolean;
}

export const TrendLayer = memo(function TrendLayer({ arrived, slipping }: TrendProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-3 items-center justify-between">
        <span className={LABEL}>Daily, last 28 days</span>
        <Legend on={slipping} />
      </div>
      <svg viewBox={`0 0 ${TREND.w} ${TREND.h}`} width={TREND.w} height={TREND.h} className="mt-1.5 block overflow-visible" aria-hidden>
        <PlotAxes frame={TREND} yTicks={Y_TICKS} yPrefix="$" xLabels={TREND_LABELS} />
        <g style={{ opacity: slipping ? 1 : 0, transition: `opacity 600ms var(--ease-out) ${slipping ? wait(1000) : "0ms"}` }}>
          <rect x={BAND_X} y={TREND.t} width={BAND_W} height={TREND.h - TREND.t - TREND.b} rx={3} fill="var(--warn)" opacity={0.07} />
          <line x1={BAND_X} x2={BAND_X} y1={TREND.t} y2={TREND.h - TREND.b} stroke="var(--warn)" strokeOpacity={0.45} strokeWidth={1} strokeDasharray="2 3" />
          <text x={BAND_X + 6} y={TREND.t + 12} className="fill-[var(--warn)] font-mono text-[9px] tracking-[0.06em]">
            +38% IN 14 DAYS
          </text>
        </g>
        <PlotLine pts={BLENDED_PTS} color={ACCENT} upTo={arrived ? undefined : -1} opacity={slipping ? 0.45 : 1} />
        <PlotLine pts={SPRING_PTS} color="var(--warn)" upTo={slipping ? undefined : -1} delay={150} />
      </svg>
    </div>
  );
});

function Legend({ on }: { on: boolean }) {
  const item = "flex items-center gap-1.5";
  return (
    <span
      aria-hidden={on ? undefined : true}
      className={cn(MONO, "flex items-center gap-3 text-[var(--text-2)] transition-opacity duration-500 ease-[var(--ease-out)]")}
      style={{ opacity: on ? 1 : 0, transitionDelay: on ? wait(1000) : "0ms" }}
    >
      <span className={item}>
        <span className="h-px w-2.5" style={{ background: ACCENT }} />
        Blended
      </span>
      <span className={item}>
        <span className="h-px w-2.5 bg-[var(--warn)]" />
        Spring Promotion
      </span>
    </span>
  );
}

/* ---------------------------------------------------------------- variation test */

const TEST: Frame = { w: 296, h: 150, l: 28, r: 18, t: 8, b: 18, min: 30, max: 62 };
const TEST_LABELS = ["Day 1", "Day 3", "Day 5", "Day 7"];
const TEST_LINES = VARIATIONS.map((v) => ({ ...v, pts: project(v.cpl, TEST) }));
const BASELINE_Y = yOf(BASELINE_CPL, TEST);
const LAST = VARIATIONS[0].cpl.length - 1;
const WINNING = TEST_LINES.find((v) => v.id === WINNER) ?? TEST_LINES[0];

interface TestProps {
  /** Four variations are running: lines draw to day 3, budget starts to follow the leader. */
  testing: boolean;
  /** The test is over: lines run to day 7, the winner keeps the budget. */
  won: boolean;
}

export const TestLayer = memo(function TestLayer({ testing, won }: TestProps) {
  // Budget follows the evidence: the bars only move once the lines above them have been read.
  const budget = useLate(won ? 2 : testing ? 1 : 0, 800) as 0 | 1 | 2;
  const upTo = won ? undefined : testing ? DAY_3 : -1;
  const endLetters = (index: number, on: boolean, delay: number) => (
    <g style={{ opacity: on ? 1 : 0, transition: `opacity 400ms var(--ease-out) ${on ? wait(delay) : "0ms"}` }}>
      {TEST_LINES.map((v) => (
        <text
          key={v.id}
          x={v.pts[index][0] + 6}
          y={v.pts[index][1] + 3}
          className="font-mono text-[9px]"
          fill={v.id === WINNER ? ACCENT : "var(--text-2)"}
        >
          {v.id}
        </text>
      ))}
    </g>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-3 items-center justify-between">
        <span className={LABEL}>Variation test</span>
        <Layers show={won ? 1 : 0} align="end">
          <span className={LABEL}>Day 3 of 7</span>
          <span className={cn(MONO, "text-[var(--ok)]")}>Day 7 of 7, complete</span>
        </Layers>
      </div>

      <svg viewBox={`0 0 ${TEST.w} ${TEST.h}`} width={TEST.w} height={TEST.h} className="mt-1.5 block overflow-visible" aria-hidden>
        <PlotAxes frame={TEST} yTicks={Y_TICKS} yPrefix="$" xLabels={TEST_LABELS} />
        <line x1={TEST.l} x2={TEST.w - TEST.r} y1={BASELINE_Y} y2={BASELINE_Y} stroke="var(--text-2)" strokeOpacity={0.7} strokeWidth={1} strokeDasharray="3 4" />
        <text x={TEST.l + 4} y={BASELINE_Y - 5} className="fill-[var(--text-2)] font-mono text-[9px] tracking-[0.06em]">
          BEFORE ${BASELINE_CPL.toFixed(2)}
        </text>
        {TEST_LINES.map((v, i) => (
          <PlotLine
            key={v.id}
            pts={v.pts}
            color={v.id === WINNER ? ACCENT : LINE_GREY}
            upTo={upTo}
            opacity={v.id === WINNER ? 1 : won ? 0.3 : 0.85}
            width={v.id === WINNER ? 2 : 1.4}
            delay={300 + i * 120}
          />
        ))}
        {endLetters(DAY_3, testing && !won, 1700)}
        {endLetters(LAST, won, 1700)}
        <g style={{ opacity: won ? 1 : 0, transition: `opacity 400ms var(--ease-out) ${won ? wait(1700) : "0ms"}` }}>
          <circle cx={WINNING.pts[LAST][0]} cy={WINNING.pts[LAST][1]} r={2.6} fill={ACCENT} />
          <text x={WINNING.pts[LAST][0] - 6} y={WINNING.pts[LAST][1] + 13} textAnchor="end" className="fill-[var(--text-0)] font-mono text-[9.5px]">
            ${WINNING.cpl[LAST].toFixed(2)}
          </text>
        </g>
      </svg>

      <div className="mt-2 flex h-3 items-center justify-between">
        <span className={LABEL}>Budget split</span>
        <Layers show={budget === 2 ? 1 : 0} align="end">
          <span className={LABEL}>Shifting toward C</span>
          <span className={LABEL}>$1,200 moved to C</span>
        </Layers>
      </div>
      <div className="mt-1.5" role="list">
        {VARIATIONS.map((v) => {
          const retired = budget === 2 && v.id !== WINNER;
          return (
            <div key={v.id} role="listitem" className="grid h-[17px] grid-cols-[14px_minmax(0,1fr)_30px_46px] items-center gap-x-2">
              <Letter id={v.id} lit={v.id === WINNER} struck={retired} />
              <Meter value={v.share[budget] / 100} color={v.id === WINNER ? ACCENT : undefined} />
              <AnimatedNumber value={v.share[budget]} suffix="%" className="text-right text-[10.5px] text-[var(--text-1)]" />
              <span
                className={cn(
                  "text-right text-[10.5px] text-[var(--text-0)] transition-opacity duration-500 ease-[var(--ease-out)]",
                  retired && "line-through opacity-40",
                )}
              >
                <AnimatedNumber value={v.cpl[budget === 2 ? LAST : DAY_3]} format="decimal2" prefix="$" />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
