"use client";

import { memo } from "react";
import { StatusChip } from "@/components/ui/Panel";
import { TypedText } from "@/components/ui/TypedText";
import { cn } from "@/lib/cn";
import { ConsolePanel, InReport, MONO, Swap, wait } from "../finance/kit";
import { JOB_TIMELINE, PROPOSAL } from "./data";

interface ProcessPanelProps {
  active: boolean;
  /** The slow handoff has been found and a change proposed. */
  tuned: boolean;
  reported: boolean;
}

/* The timeline is a median job drawn to scale across the panel, so its geometry is computed once. */
const W = 349;
const SCALE = W / PROPOSAL.medianJob;
const round = (n: number) => Math.round(n * 100) / 100;

const SEGMENTS = JOB_TIMELINE.map((stage, i) => {
  const before = JOB_TIMELINE.slice(0, i).reduce((sum, s) => sum + s.work + s.idle, 0);
  const x = before * SCALE;
  const w = stage.work * SCALE;
  return { ...stage, x: round(x), w: round(w), gapX: round(x + w), gapW: round(stage.idle * SCALE) };
});

/** Stage names sit under their segment: short segments let the name run on, the last one backs up to the edge. */
const LABEL_ALIGN = ["start", "start", "center", "end"] as const;
const SLOW = SEGMENTS[0];
const ACCENT = "rgb(var(--accent-rgb))";

/** The order of events: the gap is marked, the projected gap is drawn inside it, then the proposal is written. */
const PROJECT_AT = 700;
const PROPOSE_AT = 1300;

const Timeline = memo(function Timeline({ tuned }: { tuned: boolean }) {
  return (
    <div className="relative h-[48px]" aria-hidden>
      {SEGMENTS.map((seg, i) => {
        const last = i === SEGMENTS.length - 1;
        const slow = seg === SLOW;
        return (
          <span
            key={seg.id}
            className={cn("t-num absolute top-0 text-[9.5px] leading-none transition-colors duration-500", slow && tuned ? "text-[var(--warn)]" : "text-[var(--text-1)]")}
            style={last ? { right: 0 } : { left: seg.gapX + seg.gapW / 2, transform: "translateX(-50%)" }}
          >
            {seg.idle} d
          </span>
        );
      })}

      <div className="absolute inset-x-0 top-[15px] h-4">
        <span className="absolute inset-x-0 top-1/2 border-t border-dashed border-[var(--line-strong)]" />
        {SEGMENTS.map((seg) => (
          <span key={seg.id} className="absolute inset-y-0 rounded-[3px] border border-[var(--line)] bg-[var(--bg-4)]" style={{ left: seg.x, width: seg.w }} />
        ))}
        {/* The day and a half a job sits between intake and scheduling. */}
        <span
          className="absolute inset-y-0 rounded-[3px] border transition-opacity duration-500 ease-[var(--ease-out)]"
          style={{
            left: SLOW.gapX + 1,
            width: SLOW.gapW - 2,
            borderColor: "color-mix(in srgb, var(--warn) 50%, transparent)",
            background: "color-mix(in srgb, var(--warn) 12%, transparent)",
            opacity: tuned ? 1 : 0,
          }}
        />
        {/* What the gap becomes under the proposed change. */}
        <span
          className="absolute inset-y-[3px] origin-left rounded-[2px]"
          style={{
            left: SLOW.gapX + 3,
            width: round(PROPOSAL.projected * SCALE),
            background: ACCENT,
            transform: tuned ? "scaleX(1)" : "scaleX(0)",
            transition: `transform 600ms var(--ease-out) ${tuned ? wait(PROJECT_AT) : "0ms"}`,
          }}
        />
      </div>

      {SEGMENTS.map((seg, i) => {
        const align = LABEL_ALIGN[i] ?? "start";
        return (
          <span
            key={seg.id}
            className={cn(MONO, "absolute top-[38px] whitespace-nowrap text-[9px] text-[var(--text-2)]")}
            style={
              align === "end"
                ? { right: 0 }
                : align === "center"
                  ? { left: seg.x + seg.w / 2, transform: "translateX(-50%)" }
                  : { left: seg.x }
            }
          >
            {seg.name}
          </span>
        );
      })}
    </div>
  );
});

export const ProcessPanel = memo(function ProcessPanel({ active, tuned, reported }: ProcessPanelProps) {
  return (
    <ConsolePanel
      label="Process"
      active={active}
      className="flex flex-col"
      right={
        <>
          <InReport on={reported} order={3} />
          <Swap
            index={tuned ? 1 : 0}
            delay={tuned ? PROPOSE_AT : 0}
            className="justify-items-end"
            items={[<StatusChip key="rest">{JOB_TIMELINE.length} handoffs watched</StatusChip>, <StatusChip key="tuned">Proposal drafted</StatusChip>]}
          />
        </>
      }
    >
      <div className={cn(MONO, "flex h-2.5 items-center justify-between text-[var(--text-2)]")}>
        <span>Median job · {PROPOSAL.medianJob} days</span>
        <span>Idle time between stages</span>
      </div>
      <div className="mt-2.5">
        <Timeline tuned={tuned} />
        <ul className="sr-only">
          {JOB_TIMELINE.map((stage) => (
            <li key={stage.id}>
              {stage.name}: {stage.work} days of work, then {stage.idle} days idle.
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 grid grid-cols-[auto_1fr]">
        <div className="flex flex-col gap-[7px] pr-3.5">
          <span className={cn(MONO, "text-[var(--text-2)]")}>Idle in total</span>
          <div className="flex items-baseline gap-1.5 text-[22px] leading-none tracking-[-0.02em] text-[var(--text-0)]">
            <span className="t-num">{PROPOSAL.idleTotal}</span>
            <span className="text-[10px] tracking-normal text-[var(--text-2)]">of {PROPOSAL.medianJob} days</span>
          </div>
        </div>
        <div className="flex flex-col gap-[7px] border-l border-[var(--line-faint)] pl-3.5">
          <span className={cn(MONO, "text-[var(--text-2)]")}>Slowest handoff</span>
          <div className="flex items-baseline gap-1.5 text-[22px] leading-none tracking-[-0.02em]">
            <span className={cn("t-num transition-colors duration-500", tuned ? "text-[var(--warn)]" : "text-[var(--text-0)]")}>{PROPOSAL.slowest.idle}</span>
            <span className="text-[10px] tracking-normal text-[var(--text-2)]">days · {PROPOSAL.slowest.label}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-[var(--line-faint)] pt-2">
        <Swap
          block
          index={tuned ? 1 : 0}
          delay={tuned ? PROPOSE_AT - 140 : 0}
          items={[
            <span key="rest" className="flex flex-col gap-[7px]">
              <span className={cn(MONO, "flex h-2.5 items-center justify-between text-[var(--text-2)]")}>
                <span>Proposals</span>
                <span>None open</span>
              </span>
              <span className="block text-[10.5px] leading-[1.3] text-[var(--text-1)]">Every handoff is timed, job by job, over the last 30 days.</span>
            </span>,
            <span key="tuned" className="flex flex-col gap-[7px]">
              <span className={cn(MONO, "flex h-2.5 items-center justify-between text-[var(--text-2)]")}>
                <span className="text-[var(--text-0)]">Proposed change</span>
                <span>Saves {PROPOSAL.saving} a job</span>
              </span>
              <span className="block text-[10.5px] leading-[1.3] text-[var(--text-0)]">
                <TypedText text={PROPOSAL.change} active={tuned} delay={(PROPOSE_AT + 200) / 1000} speed={52} />
              </span>
              <span className="flex items-center gap-1.5 text-[10.5px] leading-[1.3] text-[var(--text-1)]">
                <span aria-hidden className="h-[3px] w-2.5 shrink-0 rounded-full" style={{ background: ACCENT }} />
                Projected idle time: {PROPOSAL.projected} days, down from {PROPOSAL.slowest.idle}.
              </span>
            </span>,
          ]}
        />
      </div>
    </ConsolePanel>
  );
});
