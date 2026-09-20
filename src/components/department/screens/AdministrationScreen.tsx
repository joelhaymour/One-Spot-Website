"use client";

import { Region, storyFlags, type ScreenProps } from "../contract";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useExperience } from "@/state/experience";
import { InboxPanel } from "./administration/InboxPanel";
import { PaperworkPanel } from "./administration/PaperworkPanel";
import { RenewalsPanel } from "./administration/RenewalsPanel";
import { WeekPanel } from "./administration/WeekPanel";
import { motionScale, type Stage } from "./knowledge/kit";

/**
 * Administration console: regions A to D. A pure function of `step`.
 *
 *   week       A  the agent reads Monday to Friday: 23 meetings, 146 emails, 3 deadlines
 *   sort       B  146 emails race into three buckets; the inbox gives way to the nine that need the owner
 *   schedule   A  the one slot six people share is found, the 1:1 in it moves, the review is booked, agenda sent
 *   paperwork  D  three documents are filled field by field, checked, and routed for signature
 *   reminds    C  the licence (21 days) and the lapsing insurance certificate go on the owner's to-do list
 *   report     E  (shell) every panel is marked "In report"
 */
export default function AdministrationScreen({ department, step, current, live }: ScreenProps) {
  const reduce = useReducedMotion();
  const paused = useExperience((s) => s.paused);

  // Before the workstation is live nothing has been reached: every panel holds its resting state.
  const f = storyFlags(department, live ? step : -1);
  const stage = (id: string): Stage => ({ on: f.reached(id), now: f.is(id) });

  const focus = live ? current.focus : null;
  const ambient = live && !paused && !reduce;
  const reported = f.reached("report");
  const k = motionScale(reduce);

  return (
    <>
      <Region id="A" style={k}>
        <WeekPanel
          week={stage("week")}
          schedule={stage("schedule")}
          reported={reported}
          active={focus === "A"}
          scanning={ambient && f.is("week")}
          ambient={ambient}
        />
      </Region>
      <Region id="B" style={k}>
        <InboxPanel sort={stage("sort")} reported={reported} active={focus === "B"} />
      </Region>
      <Region id="C" style={k}>
        <RenewalsPanel reminds={stage("reminds")} reported={reported} active={focus === "C"} />
      </Region>
      <Region id="D" style={k}>
        <PaperworkPanel paperwork={stage("paperwork")} reported={reported} active={focus === "D"} />
      </Region>
    </>
  );
}
