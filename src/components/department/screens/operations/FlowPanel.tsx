"use client";

import { memo } from "react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { StatusChip } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";
import { Appear, ConsolePanel, InReport, MONO, Meter, Swap } from "../finance/kit";
import { ACTIVE_JOBS, DAYS, DAY_CAPACITY, JAM_STAGE, MOVERS, STAGES, TEAMS, percent, type Day, type Job, type Phase, type Stage } from "./data";

interface FlowPanelProps {
  active: boolean;
  /** The agent is reading the board. */
  scanning: boolean;
  phase: Phase;
  reported: boolean;
}

/** Queue meters share one scale so the columns are comparable. */
const QUEUE_SCALE = 20;
/** Capacity bars run to 125% so an overbooked day has somewhere to go; the 100% mark sits at 80%. */
const BAR_SCALE = 125;
const NEUTRAL = "rgba(255,255,255,0.34)";

function JobChip({ job, day }: { job: Job; day?: Phase }) {
  return (
    <span className="flex h-6 items-center gap-1.5 rounded-[5px] border border-[var(--line-faint)] bg-white/[0.03] px-2">
      <span className={cn(MONO, "shrink-0 text-[var(--text-2)]")}>{job.id}</span>
      <span className="min-w-0 flex-1 truncate text-[10.5px] leading-[1.25] text-[var(--text-1)]">{job.customer}</span>
      {day === undefined ? (
        <span className="t-num shrink-0 text-[9.5px] leading-none text-[var(--text-2)]">{job.hours} h</span>
      ) : (
        // A late booking carries the day it is booked for: Thursday until the agent moves it.
        <Swap
          index={day === 2 ? 1 : 0}
          className={cn(MONO, "shrink-0 justify-items-end")}
          items={[
            <span key="thu" className="text-[var(--warn)]">
              Thu
            </span>,
            <span key="wed" className="text-[var(--text-1)]">
              Wed
            </span>,
          ]}
        />
      )}
    </span>
  );
}

const StageColumn = memo(function StageColumn({ stage, index, phase }: { stage: Stage; index: number; phase: Phase }) {
  const jam = index === JAM_STAGE;
  const hot = jam && phase === 1;
  const arrived = jam && phase > 0;
  const rest = stage.count[0] - stage.jobs.length;
  const later = stage.count[1] - stage.jobs.length - (jam ? MOVERS.length : 0);

  return (
    <div role="group" aria-label={stage.name} className="relative flex h-[280px] flex-col border-l border-[var(--line-faint)] pl-3 pr-3 first:border-l-0 first:pl-0 last:pr-0">
      {jam && (
        <span
          aria-hidden
          className="absolute left-3 right-3 top-[-7px] h-[2px] rounded-full bg-[var(--warn)] transition-opacity duration-500 ease-[var(--ease-out)]"
          style={{ opacity: hot ? 1 : 0 }}
        />
      )}
      <div className="flex h-3 items-center justify-between">
        <span className={cn(MONO, "flex items-center gap-1.5 text-[var(--text-1)]")}>
          <span className="text-[var(--text-2)]">0{index + 1}</span>
          {stage.name}
        </span>
        {index < STAGES.length - 1 && (
          <svg width={7} height={9} viewBox="0 0 7 9" aria-hidden className="-mr-[15px] shrink-0">
            <path d="M1.5 1l3.5 3.5L1.5 8" fill="none" stroke="var(--text-3)" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-1.5 text-[22px] leading-none tracking-[-0.02em] text-[var(--text-0)]">
        <AnimatedNumber value={stage.count[phase]} duration={1.5} />
        <span className="text-[10px] tracking-normal text-[var(--text-2)]">jobs</span>
      </div>

      <div className={cn(MONO, "mt-2 flex h-2.5 items-center gap-1.5 text-[var(--text-2)]")}>
        <span>Waiting</span>
        <AnimatedNumber
          value={stage.waiting[phase]}
          duration={1.5}
          className={cn("transition-colors duration-500", hot ? "text-[var(--warn)]" : "text-[var(--text-0)]")}
        />
        {jam && (
          <Swap
            index={phase}
            items={[
              <span key="steady">steady</span>,
              <span key="rising" className="text-[var(--warn)]">
                and rising
              </span>,
              <span key="clearing">clearing</span>,
            ]}
          />
        )}
      </div>
      <Meter value={stage.waiting[phase] / QUEUE_SCALE} color={hot ? "var(--warn)" : NEUTRAL} duration={1500} className="mt-[7px]" />

      <ul className="mt-3 flex flex-col gap-1">
        {stage.jobs.map((job) => (
          <li key={job.id}>
            <JobChip job={job} />
          </li>
        ))}
        {jam &&
          MOVERS.map((job, i) => (
            <li key={job.id}>
              <Appear on={arrived} delay={520 + i * 220} x={-10} y={0}>
                <JobChip job={job} day={phase} />
              </Appear>
            </li>
          ))}
      </ul>

      <div className={cn(MONO, "mt-auto text-[var(--text-2)]")}>
        {rest === later ? <span>+ {rest} more</span> : <Swap index={phase > 0 ? 1 : 0} items={[`+ ${rest} more`, `+ ${later} more`]} />}
      </div>
    </div>
  );
});

const DayCell = memo(function DayCell({ day, phase }: { day: Day; phase: Phase }) {
  const pct = percent(day.booked[phase]);
  const over = pct > 100;
  return (
    <div className="border-l border-[var(--line-faint)] pl-3 pr-3 first:border-l-0 first:pl-0 last:pr-0">
      <div className="flex h-4 items-baseline justify-between">
        <span className="text-[11px] leading-none text-[var(--text-1)]">{day.label}</span>
        <AnimatedNumber
          value={pct}
          suffix="%"
          duration={1.5}
          className={cn("text-[14px] leading-none transition-colors duration-500", over ? "text-[var(--warn)]" : "text-[var(--text-0)]")}
        />
      </div>
      <div className="relative mt-[7px]">
        <Meter value={pct / BAR_SCALE} color={over ? "var(--warn)" : NEUTRAL} duration={1500} height={4} />
        <span aria-hidden className="absolute -top-[2px] h-2 w-px bg-[var(--text-2)]" style={{ left: `${(100 / BAR_SCALE) * 100}%` }} />
      </div>
    </div>
  );
});

export const FlowPanel = memo(function FlowPanel({ active, scanning, phase, reported }: FlowPanelProps) {
  return (
    <ConsolePanel
      label="Work in motion"
      active={active}
      scanning={scanning}
      className="flex flex-col"
      right={
        <>
          <InReport on={reported} order={0} />
          <Swap
            index={phase}
            className="justify-items-end"
            items={[
              <StatusChip key="rest">
                {ACTIVE_JOBS} active · {STAGES.length} stages
              </StatusChip>,
              <StatusChip key="jam" tone="warn">
                1 bottleneck forming
              </StatusChip>,
              <StatusChip key="clear" tone="ok">
                Conflict cleared
              </StatusChip>,
            ]}
          />
        </>
      }
    >
      <div className="grid grid-cols-5 pt-0.5">
        {STAGES.map((stage, i) => (
          <StageColumn key={stage.id} stage={stage} index={i} phase={phase} />
        ))}
      </div>

      <div className="mt-auto border-t border-[var(--line-faint)] pt-3">
        <div className={cn(MONO, "flex h-2.5 items-center justify-between text-[var(--text-2)]")}>
          <span>Capacity · this week</span>
          <Swap
            index={phase}
            className="justify-items-end"
            items={[
              <span key="rest">
                {DAY_CAPACITY} h a day across {TEAMS.length} teams
              </span>,
              <span key="jam" className="text-[var(--warn)]">
                Thursday is overbooked
              </span>,
              <span key="clear">Every day under 100%</span>,
            ]}
          />
        </div>
        <div className="mt-2.5 grid grid-cols-5">
          {DAYS.map((day) => (
            <DayCell key={day.id} day={day} phase={phase} />
          ))}
        </div>
      </div>
    </ConsolePanel>
  );
});
