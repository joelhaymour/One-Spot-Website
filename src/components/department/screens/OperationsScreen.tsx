"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";
import { Region, storyFlags, type ScreenProps } from "../contract";
import { covers, motionScale } from "./finance/kit";
import { FlowPanel } from "./operations/FlowPanel";
import { InventoryPanel } from "./operations/InventoryPanel";
import { ProcessPanel } from "./operations/ProcessPanel";
import { SchedulePanel } from "./operations/SchedulePanel";
import type { Phase } from "./operations/data";

/**
 * Operations Console: regions A to D of the Operations Agent's workstation.
 *
 *   A  Work in motion   128 active jobs across 5 stages; stage 3's queue climbs to 19, Thursday to 117%
 *   B  Schedule         week by team; Team B's 11 free hours on Wednesday found, 2 jobs moved, 3 people told
 *   C  Inventory        days of stock; item 2210 at 6 days, a purchase order drafted at the best of 3 quotes
 *   D  Process          a median job drawn to scale; 1.5 days idle between intake and scheduling, and a fix
 *
 * A pure function of `step`. Nothing here listens to scroll: a step flips flags, and CSS transitions,
 * TypedText and AnimatedNumber play the change on time. Earlier results persist; scrolling back reverses them.
 */
export default function OperationsScreen({ department, step, current, live }: ScreenProps) {
  const reduce = useReducedMotion();

  // Until the workstation has arrived, hold the resting state of step 0.
  const f = storyFlags(department, live ? step : 0);
  const focus = live ? current.focus : null;
  const logOf = (id: string) => department.story.find((s) => s.id === id)?.log ?? "";

  // The week has three states, and the board and the schedule must always agree on which one it is.
  const phase: Phase = f.reached("reschedule") ? 2 : f.reached("bottleneck") ? 1 : 0;

  return (
    <div className="pointer-events-none absolute inset-0 select-none text-[12px] leading-[1.35] text-[var(--text-1)]" style={motionScale(reduce)}>
      <Region id="A">
        <FlowPanel active={covers(focus, "A")} scanning={live && f.is("watch")} phase={phase} reported={f.reached("report")} />
      </Region>
      <Region id="B">
        <SchedulePanel
          active={covers(focus, "B")}
          scanning={f.is("capacity")}
          phase={phase}
          checked={f.reached("capacity")}
          reported={f.reached("report")}
          note={logOf("reschedule")}
        />
      </Region>
      <Region id="C">
        <InventoryPanel active={covers(focus, "C")} ordered={f.reached("reorder")} reported={f.reached("report")} />
      </Region>
      <Region id="D">
        <ProcessPanel active={covers(focus, "D")} tuned={f.reached("tune")} reported={f.reached("report")} />
      </Region>
    </div>
  );
}
