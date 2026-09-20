"use client";

import type { CSSProperties, ReactNode } from "react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Panel, PanelHeader, ScanLine, StatusChip } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";
import { InReport, LABEL, MONO, Show, Swap, Tick, lag, wait, type Stage } from "../knowledge/kit";
import {
  CONFLICT,
  DAYS,
  DAY_HOURS,
  DAY_START,
  DEADLINES,
  EMAILS,
  HOUR_PX,
  MEETINGS,
  MEETINGS_THIS_WEEK,
  REVIEW,
  THURSDAY,
  TODAY,
} from "./data";
import { useAfter } from "./useAfter";

interface WeekPanelProps {
  week: Stage;
  schedule: Stage;
  reported: boolean;
  active: boolean;
  scanning: boolean;
  /** Ambient lights may breathe. */
  ambient: boolean;
}

const GUTTER = 38;
const HOURS = Array.from({ length: DAY_HOURS }, (_, i) => `${String(DAY_START + i).padStart(2, "0")}:00`);
const topOf = (start: number) => (start - DAY_START) * HOUR_PX;
const heightOf = (hours: number) => hours * HOUR_PX - 2;

/** The agent reads the week one day at a time, Monday first. */
const dayDelay = (day: number) => 300 + day * 260;
const WEEK_READ = dayDelay(DAYS.length - 1) + 600;

/** Scheduling, in the order the copy gives it: find the time, move the conflict, book the room, send the agenda. */
const SLOT_FOUND = 250;
const CONFLICT_MOVES = 750;
const REVIEW_BOOKED = 1750;
const AGENDA_SENT = 2550;

/** Region A. The whole week on one surface: 23 meetings, 3 deadlines, and the one slot that works for six people. */
export function WeekPanel({ week, schedule, reported, active, scanning, ambient }: WeekPanelProps) {
  // The count changes when the block lands on the calendar, not when the step starts.
  const booked = useAfter(schedule, REVIEW_BOOKED);
  const meetings = week.on ? MEETINGS_THIS_WEEK + (booked ? 1 : 0) : 0;

  return (
    <Panel active={active} className="flex h-full flex-col overflow-hidden">
      <PanelHeader
        label="The week"
        right={
          <>
            <InReport on={reported} order={0} />
            <Swap
              on={week.on}
              align="end"
              from={<StatusChip tone="neutral">Not read yet</StatusChip>}
              to={
                <Swap
                  on={week.on}
                  delay={lag(week, WEEK_READ)}
                  align="end"
                  from={
                    <StatusChip tone="neutral" pulse={ambient}>
                      Reading
                    </StatusChip>
                  }
                  to={
                    <Swap
                      on={schedule.on}
                      delay={lag(schedule, AGENDA_SENT)}
                      align="end"
                      from={<StatusChip tone="ok">Week read</StatusChip>}
                      to={<StatusChip tone="ok">Review booked · 1 moved</StatusChip>}
                    />
                  }
                />
              }
            />
          </>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col px-3.5 pb-3">
        <div className="grid" style={{ gridTemplateColumns: `${GUTTER}px repeat(${DAYS.length}, minmax(0, 1fr))` }}>
          <span />
          {DAYS.map((day, d) => (
            <DayHeader key={day} day={d} week={week} booked={booked} />
          ))}
        </div>

        <div className="relative" style={{ height: DAY_HOURS * HOUR_PX }}>
          <div aria-hidden className="absolute inset-y-0 right-0" style={{ left: GUTTER }}>
            {Array.from({ length: DAY_HOURS + 1 }, (_, i) => (
              <span key={i} className="absolute inset-x-0 h-px bg-[var(--line-faint)]" style={{ top: i * HOUR_PX }} />
            ))}
          </div>
          <div aria-hidden className="absolute inset-y-0 left-0" style={{ width: GUTTER }}>
            {HOURS.map((h, i) => (
              <span key={h} className={cn(MONO, "t-num absolute left-0 text-[var(--text-2)]")} style={{ top: i * HOUR_PX + 4 }}>
                {h}
              </span>
            ))}
          </div>

          <div
            className="absolute inset-y-0 right-0 grid"
            style={{ left: GUTTER, gridTemplateColumns: `repeat(${DAYS.length}, minmax(0, 1fr))` }}
          >
            {DAYS.map((day, d) => (
              <div key={day} className={cn("relative border-l border-[var(--line-faint)]", d === TODAY && "bg-white/[0.022]")}>
                {MEETINGS.filter((m) => m.day === d).map((m) => (
                  <Block key={m.start} title={m.title} start={m.start} hours={m.hours} lit={week.on} delay={lag(week, dayDelay(d))} />
                ))}
                {d === THURSDAY && <Thursday week={week} schedule={schedule} />}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto flex h-[48px] items-stretch gap-2">
          <Tally label="Meetings" value={meetings} />
          <Tally label="Emails" value={week.on ? EMAILS : 0} />
          <Tally label="Deadlines" value={week.on ? DEADLINES.length : 0} />
          {DEADLINES.map((d, i) => (
            <div
              key={d.title}
              className="flex min-w-0 flex-1 flex-col justify-center rounded-[8px] border border-[var(--line)] bg-white/[0.02] px-2.5"
            >
              <div className="truncate text-[11.5px] leading-[14px] text-[var(--text-0)]">{d.title}</div>
              <div className="mt-[6px] flex items-center justify-between">
                <span className={LABEL}>Due {d.date}</span>
                <Show as="span" when={week.on} delay={lag(week, WEEK_READ + i * 140)} y={0} className={cn(MONO, "text-[var(--text-1)]")}>
                  {d.left}
                </Show>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ScanLine active={scanning} />
    </Panel>
  );
}

function DayHeader({ day, week, booked }: { day: number; week: Stage; booked: boolean }) {
  const count = MEETINGS.filter((m) => m.day === day).length + (day === CONFLICT.day ? 1 : 0) + (day === REVIEW.day && booked ? 1 : 0);
  const today = day === TODAY;
  return (
    <div className="flex h-5 items-start justify-between border-l border-transparent px-[5px]">
      <span className={cn(MONO, today ? "text-[var(--text-0)]" : "text-[var(--text-2)]")}>
        {DAYS[day]}
        {today ? " · Today" : ""}
      </span>
      <Show as="span" when={week.on} delay={lag(week, dayDelay(day) + 200)} y={0} className={cn(MONO, "t-num text-[var(--text-1)]")}>
        {count}
        <span className="sr-only"> meetings</span>
      </Show>
    </div>
  );
}

function Tally({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex w-[74px] shrink-0 flex-col justify-center">
      <AnimatedNumber value={value} duration={1.5} className="block text-[22px] font-medium leading-none tracking-[-0.03em] text-[var(--text-0)]" />
      <div className={cn(LABEL, "mt-[7px]")}>{label}</div>
    </div>
  );
}

interface BlockProps {
  title: string;
  start: number;
  hours: number;
  /** The agent has read this day. */
  lit: boolean;
  delay: number;
  right?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** One meeting. Half-hour blocks carry a title only; longer ones have room for the time. */
function Block({ title, start, hours, lit, delay, right, className, style }: BlockProps) {
  const tall = hours >= 1;
  return (
    <div className={cn("absolute inset-x-[3px]", className)} style={{ top: topOf(start), height: heightOf(hours), ...style }}>
      <div
        className={cn(
          "relative flex h-full overflow-hidden rounded-[5px] border border-[var(--line)] bg-[var(--bg-3)] pl-[8px] pr-1 transition-opacity duration-700 ease-[var(--ease-out)]",
          tall ? "flex-col justify-start pt-[5px]" : "items-center justify-between gap-1",
        )}
        style={{ opacity: lit ? 1 : 0.5, transitionDelay: lit ? wait(delay) : "0ms" }}
      >
        <span aria-hidden className="absolute inset-y-[3px] left-[3px] w-[2px] rounded-full bg-white/25" />
        <span className="min-w-0 truncate text-[10px] leading-[12px] text-[var(--text-0)]">{title}</span>
        {tall ? <span className={cn(MONO, "t-num mt-[4px] text-[var(--text-2)]")}>{clock(start)}</span> : right}
      </div>
    </div>
  );
}

const clock = (t: number) => `${String(Math.floor(t)).padStart(2, "0")}:${t % 1 ? "30" : "00"}`;

/** Thursday afternoon: the only slot six people share, the 1:1 that sits in it, and the review that takes it. */
function Thursday({ week, schedule }: { week: Stage; schedule: Stage }) {
  const on = schedule.on;
  return (
    <>
      <div className="absolute inset-x-[3px]" style={{ top: topOf(REVIEW.start), height: heightOf(REVIEW.hours) }}>
        <div
          aria-hidden
          className="absolute inset-0 rounded-[5px] border border-dashed transition-opacity duration-500 ease-[var(--ease-out)]"
          style={{
            borderColor: "rgba(var(--accent-rgb), 0.55)",
            opacity: on ? 1 : 0,
            transitionDelay: on ? wait(lag(schedule, SLOT_FOUND)) : "0ms",
          }}
        />
        <Show
          when={on}
          delay={lag(schedule, REVIEW_BOOKED)}
          y={4}
          className="absolute inset-0 flex flex-col overflow-hidden rounded-[5px] border px-[7px] pt-[5px]"
          style={{ borderColor: "rgba(var(--accent-rgb), 0.6)", background: "rgba(var(--accent-rgb), 0.1)" }}
        >
          <span className="truncate text-[10.5px] font-medium leading-[12px] text-[var(--text-0)]">{REVIEW.title}</span>
          <span className="mt-[3px] truncate text-[10px] leading-[12px] text-[var(--text-1)]">{REVIEW.detail}</span>
          <Show
            as="span"
            when={on}
            delay={lag(schedule, AGENDA_SENT)}
            y={0}
            className={cn(MONO, "mt-[5px] flex items-center gap-1 text-[var(--text-0)]")}
          >
            <Tick />
            {REVIEW.sent}
          </Show>
        </Show>
      </div>

      {/* The conflict slides to the next time Sam and the owner both have free. It passes over the found slot, so it sits above it. */}
      <Block
        title={CONFLICT.title}
        start={CONFLICT.start}
        hours={CONFLICT.hours}
        lit={week.on}
        delay={lag(week, dayDelay(CONFLICT.day))}
        className="z-[1] transition-transform duration-[900ms] ease-[var(--ease-out)]"
        style={{
          transform: on ? `translate3d(0, ${(CONFLICT.movedTo - CONFLICT.start) * HOUR_PX}px, 0)` : "none",
          transitionDelay: on ? wait(lag(schedule, CONFLICT_MOVES)) : "0ms",
        }}
        right={
          <Show as="span" when={on} delay={lag(schedule, CONFLICT_MOVES + 900)} y={0} className={cn(MONO, "shrink-0 text-[var(--text-1)]")}>
            Moved
          </Show>
        }
      />
    </>
  );
}
