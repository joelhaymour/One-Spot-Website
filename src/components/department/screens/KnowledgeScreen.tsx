"use client";

import { Region, storyFlags, type ScreenProps } from "../contract";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useExperience } from "@/state/experience";
import { AgentRequestsPanel } from "./knowledge/AgentRequestsPanel";
import { AskPanel } from "./knowledge/AskPanel";
import { GapsPanel } from "./knowledge/GapsPanel";
import { SourcesPanel } from "./knowledge/SourcesPanel";
import { ANSWERED_BEFORE, SERVED_NOW } from "./knowledge/data";
import { motionScale, type Stage } from "./knowledge/kit";

/**
 * Internal Knowledge console: regions A to D. A pure function of `step`.
 *
 *   reads          A  the two unread sources index up to 4,180; unsorted files get identified
 *   connects       A  four versions of the warranty terms, two disagree, the 2026 policy is marked current
 *   answers-team   B  a staff question, the answer typed with its source, "Answered in 3 s"
 *   answers-agents D  Sales and Customer Service agents are served from the same sources
 *   gaps           C  9 becomes 14 undocumented questions; 2 drafts ready for approval
 *   report         E  (shell) every panel is marked "In report"
 */
export default function KnowledgeScreen({ department, step, current, live }: ScreenProps) {
  const reduce = useReducedMotion();
  const paused = useExperience((s) => s.paused);

  // Before the workstation is live nothing has been reached: every panel holds its resting state.
  const f = storyFlags(department, live ? step : -1);
  const stage = (id: string): Stage => ({ on: f.reached(id), now: f.is(id) });

  const focus = live ? current.focus : null;
  const ambient = live && !paused && !reduce;
  const reported = f.reached("report");
  const k = motionScale(reduce);

  const asked = stage("answers-team");
  const serves = stage("answers-agents");
  const answered = ANSWERED_BEFORE + (asked.on ? 1 : 0) + (serves.on ? SERVED_NOW.length : 0);

  return (
    <>
      <Region id="A" style={k}>
        <SourcesPanel
          reads={stage("reads")}
          connects={stage("connects")}
          reported={reported}
          active={focus === "A"}
          scanning={ambient && f.is("reads")}
          ambient={ambient}
        />
      </Region>
      <Region id="B" style={k}>
        <AskPanel asked={asked} answered={answered} reported={reported} active={focus === "B"} />
      </Region>
      <Region id="C" style={k}>
        <GapsPanel gaps={stage("gaps")} reported={reported} active={focus === "C"} />
      </Region>
      <Region id="D" style={k}>
        <AgentRequestsPanel serves={serves} reported={reported} active={focus === "D"} ambient={ambient} />
      </Region>
    </>
  );
}
