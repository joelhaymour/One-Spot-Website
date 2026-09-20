"use client";

import { Panel, PanelHeader, StatusChip } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";
import { ACCENT, Fade, Swap, Tick, useDelayed, useStepped } from "../sales/kit";
import { APPOINTMENT, CLOSING, CUSTOMER, DAYS, FOLLOW_UP, TAKEN } from "./data";

/* The week grid, in virtual px: a label column, five days, a morning and an afternoon row. */
const LABEL_W = 31;
const COL_W = 60;
const ROW_H = 26;
const GAP = 4;
const HEAD_H = 16;
const ROWS = ["AM", "PM"];

const cellX = (day: number) => LABEL_W + GAP + day * (COL_W + GAP);
const cellY = (row: number) => HEAD_H + GAP + row * (ROW_H + GAP);
const isTaken = (day: number, row: number) => TAKEN.some(([d, r]) => d === day && r === row);

const SLOT = "absolute left-0 top-0 flex flex-col justify-center rounded-[5px] px-1.5 leading-none";

/** "Eleanor Voss" -> "E. Voss": what fits in a calendar slot. */
const SHORT_NAME = CUSTOMER.name.replace(/^(\w)\w*\s+/, "$1. ");

interface RecordPanelProps {
  /** The agent has offered the new time (it rescheduled while resolving the request). */
  offered: boolean;
  /** The agent is closing (or has closed) the loop. */
  closed: boolean;
  active: boolean;
}

/** Region C. The customer's week at rest; then the three things that close the loop, one tick at a time. */
export function RecordPanel({ offered, closed, active }: RecordPanelProps) {
  // record, then follow-up, then confirmation: each tick lands with the change it stands for
  const ticks = useStepped(closed, CLOSING.length, 950, 350);
  const moved = ticks >= 1;
  const followUp = ticks >= 2;
  const landed = useDelayed(moved, 650);
  const done = useDelayed(ticks >= CLOSING.length, 600);

  const { from, to } = APPOINTMENT;
  const at = moved ? to : from;
  // the grid is a picture of the week; this sentence is what it says
  const weekLabel =
    `${CUSTOMER.name}, week ahead. Appointment on ${DAYS[at.day]} at ${at.time}.` +
    (followUp ? ` Follow-up on ${DAYS[FOLLOW_UP.day]} at ${FOLLOW_UP.time}.` : "");

  return (
    <Panel active={active} className="h-full overflow-hidden">
      <PanelHeader
        label="Record"
        right={
          <Swap
            flipped={done}
            align="end"
            first={<span className="t-label">{CUSTOMER.name}</span>}
            second={<StatusChip tone="ok">Loop closed</StatusChip>}
          />
        }
      />

      <div className="px-3.5">
        {/* her week: what is booked, what is free, where the appointment sits */}
        <div role="img" aria-label={weekLabel} className="relative" style={{ height: cellY(ROWS.length) - GAP }}>
          {DAYS.map((day, d) => (
            <span
              key={day}
              className="t-num absolute top-0 font-mono text-[9px] uppercase leading-[16px] tracking-[0.07em] text-[var(--text-2)]"
              style={{ left: cellX(d), width: COL_W }}
            >
              {day}
            </span>
          ))}
          {ROWS.map((label, r) => (
            <span
              key={label}
              className="absolute left-0 font-mono text-[9px] uppercase tracking-[0.07em] text-[var(--text-2)]"
              style={{ top: cellY(r), lineHeight: `${ROW_H}px` }}
            >
              {label}
            </span>
          ))}
          {DAYS.map((day, d) =>
            ROWS.map((label, r) => {
              const taken = isTaken(d, r);
              return (
                <span
                  key={`${day}-${label}`}
                  className={cn(
                    "absolute flex items-center rounded-[5px] border px-1.5 text-[9.5px] text-[var(--text-2)]",
                    taken ? "border-transparent bg-white/[0.045]" : "border-[var(--line-faint)]",
                  )}
                  style={{ left: cellX(d), top: cellY(r), width: COL_W, height: ROW_H }}
                >
                  {taken ? "Booked" : null}
                </span>
              );
            }),
          )}

          {/* the time the agent offered while resolving: held, not yet on the record */}
          <span
            aria-hidden
            className={cn(SLOT, "border border-dashed border-[var(--line-strong)] transition-opacity duration-500 ease-[var(--ease-out)]")}
            style={{
              width: COL_W,
              height: ROW_H,
              transform: `translate3d(${cellX(to.day)}px, ${cellY(to.row)}px, 0)`,
              opacity: offered && !landed ? 1 : 0,
            }}
          />

          {/* the appointment itself: it slews from Thursday afternoon to Monday morning */}
          <span
            // opaque, so it reads cleanly while it crosses the booked slots
            className={cn(SLOT, "border bg-[var(--bg-4)] transition-transform duration-[900ms] ease-[var(--ease-out)]")}
            style={{
              width: COL_W,
              height: ROW_H,
              borderColor: "var(--line-strong)",
              boxShadow: `inset 2px 0 0 ${ACCENT}`,
              transform: `translate3d(${cellX(at.day)}px, ${cellY(at.row)}px, 0)`,
            }}
          >
            <span className="truncate text-[9.5px] text-[var(--text-0)]">{SHORT_NAME}</span>
            <Swap
              flipped={landed}
              className="t-num mt-[3px] font-mono text-[9px] text-[var(--text-1)]"
              first={from.time}
              second={to.time}
            />
          </span>

          {/* the follow-up, booked on Friday morning */}
          <Fade
            as="span"
            on={followUp}
            y={4}
            duration={500}
            className={cn(SLOT, "border border-[var(--line-strong)] bg-white/[0.05]")}
            style={{ width: COL_W, height: ROW_H, left: cellX(FOLLOW_UP.day), top: cellY(FOLLOW_UP.row) }}
          >
            <span className="truncate text-[9.5px] text-[var(--text-0)]">Follow-up</span>
            <span className="t-num mt-[3px] font-mono text-[9px] text-[var(--text-1)]">{FOLLOW_UP.time}</span>
          </Fade>
        </div>

        <ul className="mt-2.5">
          {CLOSING.map((item, i) => {
            const ticked = ticks > i;
            return (
              <li key={item.label} className="flex items-start gap-2.5 border-t border-[var(--line-faint)] py-[5px]">
                <Tick on={ticked} className="mt-[2px]" />
                <span className="min-w-0 flex-1">
                  <span
                    className="block text-[11.5px] leading-[16px] transition-colors duration-500 ease-[var(--ease-out)]"
                    style={{ color: ticked ? "var(--text-0)" : "var(--text-2)" }}
                  >
                    {item.label}
                  </span>
                  <Fade as="span" on={ticked} y={0} delayMs={150} className="block truncate text-[10.5px] leading-[14px] text-[var(--text-2)]">
                    {item.detail}
                  </Fade>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Panel>
  );
}
