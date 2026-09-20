"use client";

import { Region, storyFlags, type ScreenProps } from "../contract";
import { useExperience } from "@/state/experience";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Conversation } from "./sales/Conversation";
import { CrmActivity } from "./sales/CrmActivity";
import { LeadQueue } from "./sales/LeadQueue";
import { ProposalDoc } from "./sales/ProposalDoc";
import { focusCovers, motionScale } from "./sales/kit";

/**
 * Sales Console: regions A to D of the Sales Agent's workstation.
 *
 *   A  Lead queue      leads arrive, are scored and sorted, then re-weighted by what actually closes
 *   B  Conversation    the inbox at rest; Dana Whitfield's enquiry answered in 2 min 40 s
 *   C  CRM activity    what people left stale; 27 activities logged, stale fields to 0
 *   D  Proposal        proposals in flight; the Hartwell Partners document assembled for review
 *
 * A pure function of `step`. Nothing here listens to scroll: a step flips flags, and CSS transitions,
 * TypedText and AnimatedNumber play the change on time. Earlier results persist; scrolling back reverses them.
 */
export default function SalesScreen({ department, step, current, live }: ScreenProps) {
  const reduce = useReducedMotion();
  const paused = useExperience((s) => s.paused);

  // Until the workstation has arrived, hold the resting state of step 0.
  const f = storyFlags(department, live ? step : 0);
  const focus = live ? current.focus : null;

  return (
    <div className="pointer-events-none absolute inset-0 select-none text-[12px] leading-[1.35] text-[var(--text-1)]" style={motionScale(reduce)}>
      <Region id="A">
        <LeadQueue
          live={live}
          scored={f.reached("score")}
          learned={f.reached("learns")}
          active={focusCovers(focus, "A")}
          // the sweep is ambient: it runs only while the agent is reading the queue, and never when motion is paused
          scanning={live && f.is("leads") && !paused && !reduce}
        />
      </Region>
      <Region id="B">
        <Conversation replying={f.reached("follow-up")} active={focusCovers(focus, "B")} />
      </Region>
      <Region id="C">
        <CrmActivity logged={f.reached("crm")} active={focusCovers(focus, "C")} />
      </Region>
      <Region id="D">
        <ProposalDoc drafted={f.reached("proposal")} active={focusCovers(focus, "D")} />
      </Region>
    </div>
  );
}
