"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";
import { useExperience } from "@/state/experience";
import { Region, storyFlags, type ScreenProps } from "../contract";
import { CompetitorPanel } from "./marketing/CompetitorPanel";
import { CreativePanel } from "./marketing/CreativePanel";
import { DiagnosisPanel } from "./marketing/DiagnosisPanel";
import { focusCovers, motionScale } from "./marketing/kit";
import { PerformancePanel } from "./marketing/PerformancePanel";

/**
 * Marketing Console: regions A to D of the Marketing Agent's workstation.
 *
 *   A  Campaign performance   5 campaigns, 6 channels, blended cost per lead; Spring Promotion flagged at +38%,
 *                             then four variations tested and C kept at −41%
 *   B  Diagnosis / schedule   frequency 6.4, click-through falling while reach is flat: creative fatigue;
 *                             later the launch calendar, 4 variations across 3 channels
 *   C  Competitor watch       3 offers changed, 1 competitor bidding on the company name
 *   D  Creative               the angle in market and its ads; the new concept; four briefs awaiting approval
 *
 * A pure function of `step`. Nothing here listens to scroll: a step flips flags, and CSS transitions,
 * TypedText and AnimatedNumber play the change on time. Earlier results persist; scrolling back reverses them.
 */
export default function MarketingScreen({ department, step, current, live }: ScreenProps) {
  const reduce = useReducedMotion();
  const paused = useExperience((s) => s.paused);

  // Until the workstation has arrived, hold the resting state of step 0.
  const f = storyFlags(department, live ? step : 0);
  const focus = live ? current.focus : null;
  // The sweep is ambient: it runs only while the agent is reading a panel, and never when motion is paused.
  const reading = live && !paused && !reduce;

  return (
    <div className="pointer-events-none absolute inset-0 select-none text-[12px] leading-[1.35] text-[var(--text-1)]" style={motionScale(reduce)}>
      <Region id="A">
        <PerformancePanel
          arrived={live}
          slipping={f.reached("slipping")}
          testing={f.reached("monitor")}
          won={f.reached("winner")}
          reported={f.reached("report")}
          active={focusCovers(focus, "A")}
          scan={reading && (f.is("data-arrives") || f.is("monitor"))}
        />
      </Region>
      <Region id="B">
        <DiagnosisPanel diagnosed={f.reached("why")} scheduled={f.reached("schedule")} active={focusCovers(focus, "B")} scan={reading && f.is("why")} />
      </Region>
      <Region id="C">
        <CompetitorPanel checked={f.reached("competitors")} active={focusCovers(focus, "C")} scan={reading && f.is("competitors")} />
      </Region>
      <Region id="D">
        <CreativePanel
          concept={f.reached("concept")}
          briefed={f.reached("briefs")}
          approved={f.reached("schedule")}
          won={f.reached("winner")}
          active={focusCovers(focus, "D")}
        />
      </Region>
    </div>
  );
}
