"use client";

import { memo } from "react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { StatusChip } from "@/components/ui/Panel";
import { TypedText } from "@/components/ui/TypedText";
import { cn } from "@/lib/cn";
import { Appear, ConsolePanel, InReport, MONO, Swap, Tick, wait } from "../finance/kit";
import { CAPACITY_CHECKS, DAYS, FREE_HOURS, MOVES, NOTIFIED, SCHEDULE, TEAMS, THU, WED, percent, type Phase } from "./data";

interface SchedulePanelProps {
  active: boolean;
  /** The agent is reading the schedule for room. */
  scanning: boolean;
  phase: Phase;
  /** People, hours, materials and lead times have been checked. */
  checked: boolean;
  reported: boolean;
  /** The line the agent writes once the jobs have moved (its log entry for the step). */
  note: string;
}

/*
 * The grid is authored in the display's virtual px, so a job block's position is plain arithmetic.
 * That is what lets the two late bookings travel from Thursday to Team B's Wednesday on a transform.
 */
const GUTTER = 44;
const COL = 76;
const HEAD = 26;
const ROW = 60;
const BLOCK = 16;
const PITCH = BLOCK + 3;
const INSET_X = 3;
const INSET_Y = 4;
const COLUMNS = `${GUTTER}px repeat(${DAYS.length}, ${COL}px)`;

const slotTop = (team: number, slot: number) => HEAD + team * ROW + INSET_Y + slot * PITCH;
const dayLeft = (day: number) => GUTTER + day * COL;

const FREE = MOVES.map((m) => m.to.slot);
const FREE_TOP = slotTop(MOVES[0].to.team, Math.min(...FREE)) - 2;
const FREE_HEIGHT = (Math.max(...FREE) - Math.min(...FREE)) * PITCH + BLOCK + 4;

const MOVED_JOBS = MOVES.map((m) => m.job.id).join(" and ");

/** When the second block sets off: as the first one settles, so one thing moves at a time. */
const MOVE_GAP = 650;
const MOVED_AT = 250 + MOVE_GAP + 900;

function Block({ id, hours }: { id: string; hours: number }) {
  return (
    <span className="flex items-center justify-between rounded-[4px] border border-[var(--line)] bg-white/[0.05] px-1.5 font-mono text-[9px] leading-none" style={{ height: BLOCK }}>
      <span className="text-[var(--text-1)]">{id}</span>
      <span className="text-[var(--text-2)]">{hours} h</span>
    </span>
  );
}

/** The standing week. It never changes, so it renders once. */
const Week = memo(function Week() {
  return (
    <>
      {TEAMS.map((team, t) => (
        <div key={team.id} role="row" className="grid border-t border-[var(--line-faint)]" style={{ gridTemplateColumns: COLUMNS, height: ROW }}>
          <div role="rowheader" className="flex flex-col justify-center gap-[5px]">
            <span className="text-[10.5px] leading-none text-[var(--text-1)]">{team.label}</span>
            <span className={cn(MONO, "text-[var(--text-2)]")}>{team.hours} h</span>
          </div>
          {SCHEDULE[t].map((jobs, d) => (
            <div key={DAYS[d].id} role="cell" className="flex flex-col gap-[3px] border-l border-[var(--line-faint)] pl-[2px] pr-[3px] pt-[3px]">
              {jobs.map(([id, hours]) => (
                <Block key={id} id={id} hours={hours} />
              ))}
            </div>
          ))}
        </div>
      ))}
    </>
  );
});

export const SchedulePanel = memo(function SchedulePanel({ active, scanning, phase, checked, reported, note }: SchedulePanelProps) {
  const jammed = phase === 1;
  const moved = phase === 2;

  return (
    <ConsolePanel
      label="Schedule · this week"
      active={active}
      scanning={scanning}
      className="flex flex-col"
      right={
        <>
          <InReport on={reported} order={1} />
          <Swap
            index={moved ? 3 : checked ? 2 : jammed ? 1 : 0}
            delay={moved ? MOVED_AT : 0}
            className="justify-items-end"
            items={[
              <StatusChip key="rest">{TEAMS.length} teams</StatusChip>,
              <StatusChip key="jam" tone="warn">
                Thursday {percent(DAYS[THU].booked[1])}%
              </StatusChip>,
              <StatusChip key="room">{FREE_HOURS} h free Wednesday</StatusChip>,
              <StatusChip key="moved" tone="ok">
                2 jobs moved
              </StatusChip>,
            ]}
          />
        </>
      }
    >
      <div className="relative">
        <span
          aria-hidden
          className="absolute top-0 bg-[var(--warn)] transition-opacity duration-500 ease-[var(--ease-out)]"
          style={{ left: dayLeft(THU), width: COL, height: HEAD + TEAMS.length * ROW, opacity: jammed ? 0.06 : 0 }}
        />

        <div role="table" aria-label="Schedule by team and day">
          <div role="row" className="grid items-center" style={{ gridTemplateColumns: COLUMNS, height: HEAD }}>
            <span role="columnheader" className={cn(MONO, "text-[var(--text-2)]")}>
              Team
            </span>
            {DAYS.map((day, d) => (
              <span key={day.id} role="columnheader" className="flex items-baseline justify-between pl-[5px] pr-[5px]">
                <span className="text-[10.5px] leading-none text-[var(--text-1)]">{day.label}</span>
                <AnimatedNumber
                  value={percent(day.booked[phase])}
                  suffix="%"
                  duration={1.6}
                  className={cn("text-[10px] leading-none transition-colors duration-500", d === THU && jammed ? "text-[var(--warn)]" : "text-[var(--text-2)]")}
                />
              </span>
            ))}
          </div>
          <Week />
        </div>

        {/* The room the agent found: Team B, Wednesday. */}
        <span
          aria-hidden
          className="absolute grid place-items-center rounded-[5px] border border-dashed transition-[opacity,transform] duration-500 ease-[var(--ease-out)]"
          style={{
            left: dayLeft(WED) + INSET_X - 2,
            top: FREE_TOP,
            width: COL - INSET_X * 2 + 4,
            height: FREE_HEIGHT,
            borderColor: "rgba(var(--accent-rgb), 0.7)",
            background: "rgba(var(--accent-rgb), 0.05)",
            opacity: checked && !moved ? 1 : 0,
            transform: checked ? "none" : "scale(1.06)",
            transitionDelay: checked && !moved ? wait(500) : "0ms",
          }}
        >
          <span className={MONO} style={{ color: "rgb(var(--accent-rgb))" }}>
            {FREE_HOURS} h free
          </span>
        </span>

        {/* The two late bookings. They land on Thursday, then travel to the room on Wednesday. */}
        {MOVES.map((move, i) => {
          const dx = (WED - THU) * COL;
          const dy = slotTop(move.to.team, move.to.slot) - slotTop(move.from.team, move.from.slot);
          return (
            <span
              key={move.job.id}
              aria-hidden
              // Opaque base: in transit the block passes over others, and their text must not show through the tint.
              className="absolute rounded-[4px] bg-[var(--bg-2)]"
              style={{
                left: dayLeft(THU) + INSET_X,
                top: slotTop(move.from.team, move.from.slot),
                width: COL - INSET_X * 2,
                opacity: phase > 0 ? 1 : 0,
                transform: moved ? `translate3d(${dx}px, ${dy}px, 0)` : phase > 0 ? "none" : "translate3d(8px, 0, 0)",
                transition: moved
                  ? `transform 900ms var(--ease-in-out) ${wait(250 + i * MOVE_GAP)}, opacity 500ms var(--ease-out)`
                  : // No delay here: this state is reached both by arriving and by scrolling back, and a return never waits.
                    "transform 500ms var(--ease-out), opacity 500ms var(--ease-out)",
              }}
            >
              <span
                className="flex items-center justify-between rounded-[4px] border px-1.5 font-mono text-[9px] leading-none text-[var(--text-0)] transition-[border-color,background-color] duration-500 ease-[var(--ease-out)]"
                style={{
                  height: BLOCK,
                  borderColor: moved ? "rgba(var(--accent-rgb), 0.6)" : "color-mix(in srgb, var(--warn) 55%, transparent)",
                  background: moved ? "rgba(var(--accent-rgb), 0.08)" : "color-mix(in srgb, var(--warn) 10%, transparent)",
                  transitionDelay: moved ? wait(250 + i * MOVE_GAP + 700) : "0ms",
                }}
              >
                <span>{move.job.id}</span>
                <span className="text-[var(--text-1)]">{move.job.hours} h</span>
              </span>
            </span>
          );
        })}
        <p className="sr-only">
          {moved
            ? `Jobs ${MOVED_JOBS} moved from Thursday to Team B on Wednesday.`
            : jammed
              ? `Jobs ${MOVED_JOBS} are booked on Thursday, which takes the day over capacity.`
              : ""}
        </p>
      </div>

      <div className="mt-2.5">
        <div className={cn(MONO, "flex h-2.5 items-center text-[var(--text-2)]")}>Capacity check</div>
        <dl className="mt-1.5">
          {CAPACITY_CHECKS.map((check, i) => (
            <div key={check.id} className="flex h-[19px] items-center gap-2 border-b border-[var(--line-faint)] last:border-b-0">
              <dt className={cn(MONO, "w-[112px] shrink-0 text-[var(--text-2)]")}>{check.label}</dt>
              <dd className="min-w-0 flex-1 text-[10.5px] leading-none">
                <Swap
                  block
                  index={checked ? 1 : 0}
                  delay={checked ? i * 380 : 0}
                  itemClassName="truncate"
                  items={[
                    <span key="rest" className="text-[var(--text-2)]">
                      {check.rest}
                    </span>,
                    <span key="found" className="text-[var(--text-0)]">
                      {check.found}
                    </span>,
                  ]}
                />
              </dd>
              <Tick on={checked} delay={i * 380 + 260} size={11} />
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-auto border-t border-[var(--line-faint)] pt-2 text-[10.5px]">
        <Swap
          block
          index={moved ? 1 : 0}
          delay={moved ? MOVED_AT - 140 : 0}
          items={[
            <span key="rest" className="block leading-[1.3] text-[var(--text-2)]">
              No changes to this week yet. Everyone affected is told when a job moves.
            </span>,
            <span key="moved" className="flex flex-col gap-1.5">
              <span className="block leading-[1.3] text-[var(--text-0)]">
                <TypedText text={note} active={moved} delay={MOVED_AT / 1000} speed={52} />
              </span>
              <span className="flex gap-1.5">
                {NOTIFIED.map((person, i) => (
                  <Appear
                    as="span"
                    key={person.name}
                    on={moved}
                    delay={MOVED_AT + 900 + i * 180}
                    y={0}
                    x={-6}
                    className="inline-flex h-5 items-center gap-1.5 rounded-[5px] border border-[var(--line)] px-1.5"
                  >
                    <span className="text-[10px] leading-none text-[var(--text-1)]">{person.name}</span>
                    <span className={cn(MONO, "text-[var(--text-2)]")}>{person.role}</span>
                  </Appear>
                ))}
              </span>
            </span>,
          ]}
        />
      </div>
    </ConsolePanel>
  );
});
