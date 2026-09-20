"use client";

import { memo, type ReactNode } from "react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { TypedText } from "@/components/ui/TypedText";
import { cn } from "@/lib/cn";
import { PlotLine, project, yOf, type Frame } from "./chart";
import {
  CHECKS,
  CTR_ALL,
  CTR_SPRING,
  DELIVERY,
  FIRST_HOUR,
  IN_MARKET,
  LAUNCH_CHANNELS,
  PEAK_HOURS,
  REACH_ALL,
  REACH_SPRING,
  RESPONSE_BY_HOUR,
  SLOTS,
  WEEK,
} from "./data";
import { ACCENT, Appear, ConsolePanel, LABEL, Lamp, Layers, Letter, LINE_GREY, MONO, wait } from "./kit";

/*
 * Region B. Two jobs, one after the other: first the agent works out why Spring Promotion is slipping
 * (delivery figures, two small charts, three checks, a conclusion), later the same panel becomes the
 * launch calendar. The diagnosis survives the switch as one line under the calendar.
 */

interface DiagnosisProps {
  diagnosed: boolean;
  scheduled: boolean;
  active: boolean;
  scan: boolean;
}

export const DiagnosisPanel = memo(function DiagnosisPanel({ diagnosed, scheduled, active, scan }: DiagnosisProps) {
  return (
    <ConsolePanel
      label={scheduled ? "Launch schedule" : "Diagnosis"}
      active={active}
      scan={scan}
      right={
        <Layers show={scheduled ? 2 : diagnosed ? 1 : 0} align="end">
          <span className={cn(LABEL, "whitespace-nowrap")}>All campaigns</span>
          <span className={cn(MONO, "whitespace-nowrap text-[var(--text-0)]")}>{IN_MARKET.campaign} only</span>
          <span className={cn(LABEL, "whitespace-nowrap")}>4 variations · 3 channels</span>
        </Layers>
      }
    >
      <Layers show={scheduled ? 1 : 0} fill>
        <DiagnosisView on={diagnosed} />
        <ScheduleView on={scheduled} />
      </Layers>
    </ConsolePanel>
  );
});

/* ---------------------------------------------------------------- why */

const MINI: Frame = { w: 205, h: 100, l: 2, r: 2, t: 6, b: 6, min: 30, max: 112 };
const MINI_BASE = yOf(100, MINI);
/** The three checks flip once both lines have drawn. */
const CHECKS_FROM = 1900;
const CTR_FALL = Math.round((1 - CTR_SPRING[CTR_SPRING.length - 1] / CTR_SPRING[0]) * 100);

const SIGNALS = [
  { label: "Click-through", all: project(CTR_ALL, MINI), spring: project(CTR_SPRING, MINI), verdict: `−${CTR_FALL}% in 28 days`, bad: true },
  { label: "Reach", all: project(REACH_ALL, MINI), spring: project(REACH_SPRING, MINI), verdict: "Flat", bad: false },
];

const DiagnosisView = memo(function DiagnosisView({ on }: { on: boolean }) {
  const i = on ? 1 : 0;
  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-3 gap-x-4">
        <Stat label="Frequency" note="times seen per person" warn={on}>
          <AnimatedNumber value={DELIVERY.frequency[i]} format="decimal1" />
        </Stat>
        <Stat label="Click-through" note="of people who saw an ad">
          <AnimatedNumber value={DELIVERY.clickThrough[i]} format="percent" />
        </Stat>
        <Stat label="Reach" note="people, last 28 days">
          <AnimatedNumber value={DELIVERY.reachK[i]} format="decimal1" suffix="K" />
        </Stat>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4">
        {SIGNALS.map((s) => (
          <div key={s.label}>
            <div className="flex h-3 items-center justify-between">
              <span className={LABEL}>{s.label}</span>
              <Layers show={i} align="end" delay={1400}>
                <span className={cn(LABEL, "whitespace-nowrap")}>Steady</span>
                <span className={cn(MONO, "whitespace-nowrap", s.bad ? "text-[var(--warn)]" : "text-[var(--text-1)]")}>{s.verdict}</span>
              </Layers>
            </div>
            <svg viewBox={`0 0 ${MINI.w} ${MINI.h}`} width={MINI.w} height={MINI.h} className="mt-1.5 block overflow-visible" aria-hidden>
              <line x1={0} x2={MINI.w} y1={MINI_BASE} y2={MINI_BASE} stroke="rgba(255,255,255,0.07)" strokeWidth={1} strokeDasharray="2 5" />
              <line x1={0} x2={MINI.w} y1={MINI.h - 0.5} y2={MINI.h - 0.5} stroke="rgba(255,255,255,0.055)" strokeWidth={1} />
              <PlotLine pts={s.all} color={LINE_GREY} opacity={on ? 0.3 : 1} width={1.4} />
              <PlotLine pts={s.spring} color={s.bad ? "var(--warn)" : "var(--text-0)"} upTo={on ? undefined : -1} width={1.6} delay={s.bad ? 400 : 650} />
            </svg>
          </div>
        ))}
      </div>

      <div className="mt-3.5" role="list">
        {CHECKS.map((c, k) => (
          <div key={c.label} role="listitem" className="grid h-[26px] grid-cols-[70px_minmax(0,1fr)_auto] items-center gap-x-2.5 border-t border-[var(--line-faint)]">
            <span className={LABEL}>{c.label}</span>
            <Layers show={i} delay={CHECKS_FROM + k * 250}>
              <span className="whitespace-nowrap text-[10.5px] text-[var(--text-1)]">{c.rest}</span>
              <span className={cn("whitespace-nowrap text-[10.5px]", c.flagged ? "text-[var(--text-0)]" : "text-[var(--text-1)]")}>{c.finding}</span>
            </Layers>
            <Lamp color={on && c.flagged ? "var(--warn)" : "var(--ok)"} delay={on ? CHECKS_FROM + k * 250 : 0} />
          </div>
        ))}
      </div>

      <div className="mt-auto flex h-[38px] items-center gap-3 rounded-lg border border-[var(--line)] bg-white/[0.02] px-3">
        <span className={LABEL}>Conclusion</span>
        <Layers show={i}>
          <span className="whitespace-nowrap text-[11.5px] text-[var(--text-2)]">Nothing under review.</span>
          <TypedText text="Cause: creative fatigue" active={on} delay={2.9} className="whitespace-nowrap text-[13px] font-medium text-[var(--text-0)]" />
        </Layers>
      </div>
    </div>
  );
});

function Stat({ label, note, warn, children }: { label: string; note: string; warn?: boolean; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className={LABEL}>{label}</div>
      <div
        className="mt-2 text-[24px] font-medium leading-none tracking-[-0.015em] transition-colors duration-500 ease-[var(--ease-out)]"
        style={{ color: warn ? "var(--warn)" : "var(--text-0)", transitionDelay: warn ? wait(600) : "0ms" }}
      >
        {children}
      </div>
      <div className="mt-1.5 whitespace-nowrap text-[10px] leading-none text-[var(--text-2)]">{note}</div>
    </div>
  );
}

/* ---------------------------------------------------------------- schedule */

const PEAK_REPLIES = Math.max(...RESPONSE_BY_HOUR);
const LAST_HOUR = FIRST_HOUR + RESPONSE_BY_HOUR.length - 1;
const hh = (hour: number) => `${hour < 10 ? "0" : ""}${hour}:00`;
const SLOT_FROM = 900;
const SLOT_EVERY = 130;

const ScheduleView = memo(function ScheduleView({ on }: { on: boolean }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-3 items-center justify-between">
        <span className={LABEL}>When customers respond</span>
        <span className={LABEL}>
          Replies by hour, {hh(FIRST_HOUR)} to {hh(LAST_HOUR)}
        </span>
      </div>
      <div className="mt-2 flex h-[56px] items-end gap-[3px]" aria-hidden>
        {RESPONSE_BY_HOUR.map((v, k) => {
          const peak = PEAK_HOURS.indexOf(FIRST_HOUR + k);
          return (
            <div key={k} className="relative h-full flex-1">
              <div className="absolute inset-x-0 bottom-0 rounded-[2px] bg-white/[0.16]" style={{ height: `${(v / PEAK_REPLIES) * 100}%` }}>
                {peak >= 0 ? (
                  <div
                    className="h-full w-full rounded-[2px] transition-opacity duration-500 ease-[var(--ease-out)]"
                    style={{ background: ACCENT, opacity: on ? 1 : 0, transitionDelay: on ? wait(250 + peak * 180) : "0ms" }}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <div className="relative mt-1.5 h-2.5">
        {PEAK_HOURS.map((hour) => (
          <span
            key={hour}
            className={cn(MONO, "absolute top-0 -translate-x-1/2 text-[var(--text-1)]")}
            style={{ left: `${((hour - FIRST_HOUR + 0.5) / RESPONSE_BY_HOUR.length) * 100}%` }}
          >
            {LAUNCH_CHANNELS.find((c) => Number(c.time.slice(0, 2)) === hour)?.time ?? hh(hour)}
          </span>
        ))}
      </div>

      <div className="mt-4" role="table" aria-label={`Launch calendar, week of ${WEEK[0]}`}>
        <div role="row" className="grid h-[18px] grid-cols-[88px_repeat(7,minmax(0,1fr))] items-start">
          <span role="columnheader" className={LABEL}>
            Channel
          </span>
          {WEEK.map((day) => (
            <span key={day} role="columnheader" className={cn(MONO, "text-center text-[var(--text-2)]")}>
              {day}
            </span>
          ))}
        </div>
        {LAUNCH_CHANNELS.map((channel, c) => (
          <div key={channel.name} role="row" className="grid h-[46px] grid-cols-[88px_repeat(7,minmax(0,1fr))] border-t border-[var(--line-faint)]">
            <div role="rowheader" className="flex flex-col justify-center">
              <span className="text-[10.5px] leading-[13px] text-[var(--text-0)]">{channel.name}</span>
              <span className={cn(MONO, "mt-[3px] text-[var(--text-2)]")}>{channel.time}</span>
            </div>
            {WEEK.map((day, d) => {
              const slot = SLOTS.find((s) => s.channel === c && s.day === d);
              return (
                <div key={day} role="cell" className="grid place-items-center border-l border-[var(--line-faint)]">
                  {slot ? (
                    <Appear
                      on={on}
                      delay={SLOT_FROM + slot.order * SLOT_EVERY}
                      y={4}
                      className="grid h-[26px] w-[38px] place-items-center rounded-md border border-[var(--line-strong)] bg-white/[0.035]"
                    >
                      <Letter id={slot.variation} />
                      <span className="sr-only">
                        Variation {slot.variation}, {day} {channel.time}
                      </span>
                    </Appear>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-3 flex h-3 items-center justify-between">
        <span className={LABEL}>
          <AnimatedNumber value={on ? SLOTS.length : 0} duration={1.8} /> of {SLOTS.length} slots queued
        </span>
        <Appear on={on} delay={SLOT_FROM + SLOTS.length * SLOT_EVERY + 200} y={0} as="span" className={cn(MONO, "text-[var(--ok)]")}>
          First goes out {WEEK[0]}, {LAUNCH_CHANNELS[0].time}
        </Appear>
      </div>

      <div className="mt-auto flex h-[38px] items-center gap-3 rounded-lg border border-[var(--line)] bg-white/[0.02] px-3">
        <span className={LABEL}>Replaces</span>
        <span className="truncate text-[11px] text-[var(--text-1)]">
          {IN_MARKET.campaign} creative. Cause: creative fatigue.
        </span>
      </div>
    </div>
  );
});
