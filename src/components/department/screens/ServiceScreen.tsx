"use client";

import { Region, storyFlags, type ScreenProps } from "../contract";
import { useExperience } from "@/state/experience";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { focusCovers, motionScale } from "./sales/kit";
import { CustomerCard } from "./service/CustomerCard";
import { Escalation } from "./service/Escalation";
import { RecordPanel } from "./service/RecordPanel";
import { RequestQueue } from "./service/RequestQueue";

/**
 * Service Console: regions A to D of the Customer Service Agent's workstation.
 *
 *   A  Queue        66 requests across four channels; resolved in under a minute, then grouped by cause
 *   B  Customer     the newest message at rest; Eleanor Voss's record and her request, understood
 *   C  Record       her week; the appointment moved, the follow-up booked for Friday, the confirmation
 *   D  Escalation   who is on shift; Robert Hale handed to Priya with the context and a suggested reply
 *
 * A pure function of `step`. Nothing here listens to scroll: a step flips flags, and CSS transitions,
 * TypedText and AnimatedNumber play the change on time. Earlier results persist; scrolling back reverses them.
 */
export default function ServiceScreen({ department, step, current, live }: ScreenProps) {
  const reduce = useReducedMotion();
  const paused = useExperience((s) => s.paused);

  // Until the workstation has arrived, hold the resting state of step 0.
  const f = storyFlags(department, live ? step : 0);
  const focus = live ? current.focus : null;
  // the sweep is ambient: it runs only while the agent is reading, and never when motion is paused
  const reading = live && !paused && !reduce;

  // The request the agent has open: Eleanor's while it works on her, Robert Hale's while it hands him over.
  const selected = f.is("escalate") ? "hale" : f.between("understand", "close") ? "eleanor" : null;

  return (
    <div className="pointer-events-none absolute inset-0 select-none text-[12px] leading-[1.35] text-[var(--text-1)]" style={motionScale(reduce)}>
      <Region id="A">
        <RequestQueue
          live={live}
          selected={selected}
          resolved={f.reached("resolve")}
          escalated={f.reached("escalate")}
          patterned={f.reached("pattern")}
          active={focusCovers(focus, "A")}
          scanning={reading && f.is("arrive")}
          trend={department.tile.spark}
        />
      </Region>
      <Region id="B">
        <CustomerCard understood={f.reached("understand")} active={focusCovers(focus, "B")} scanning={reading && f.is("understand")} />
      </Region>
      <Region id="C">
        <RecordPanel offered={f.reached("resolve")} closed={f.reached("close")} active={focusCovers(focus, "C")} />
      </Region>
      <Region id="D">
        <Escalation escalated={f.reached("escalate")} active={focusCovers(focus, "D")} />
      </Region>
    </div>
  );
}
