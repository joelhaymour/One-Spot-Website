"use client";

import { useRef } from "react";
import { BEAT_MOOD, DEPARTMENT_BY_ID, REGION, WORKSTATION, type Department, type DepartmentId } from "@/content/departments";
import { AgentSlot } from "@/components/agent/AgentSlot";
import { VirtualDisplay } from "@/components/display/VirtualDisplay";
import { ScrollStory } from "@/components/motion/ScrollStory";
import { useMediaQuery } from "@/lib/useReducedMotion";
import { BeatRail } from "./BeatRail";
import { Caption } from "./Caption";
import { ConsoleFrame } from "./ConsoleFrame";
import { DepartmentIntro } from "./DepartmentIntro";
import { DepartmentOutro } from "./DepartmentOutro";
import { ScreenBoundary } from "./ScreenFallback";
import { SCREENS } from "./screens";
import { agentLoad, reachedCount } from "./story";
import { useArrival } from "./useArrival";
import styles from "./stage.module.css";

/**
 * A department, from the inside: who works here, a full shift at its workstation, and the report
 * that goes back up to the CEO Agent.
 *
 * Takes only the id (the server page would otherwise serialise the whole department into the RSC
 * payload next to the copy of it that is already in this bundle).
 */
export function DepartmentExperience({ departmentId }: { departmentId: DepartmentId }) {
  const department = DEPARTMENT_BY_ID[departmentId];
  // Keyed: "Next department" swaps the slug under the same layout, and a shift must start from step one.
  return <Experience key={department.id} department={department} />;
}

function Experience({ department }: { department: Department }) {
  const root = useRef<HTMLDivElement>(null);
  const live = useArrival(root);

  return (
    <div ref={root}>
      <DepartmentIntro department={department} />
      <ScrollStory
        id="shift"
        steps={department.story.length}
        stepLength={0.85}
        tail={0.4}
        aria-label={`A shift with the ${department.agentName}`}
      >
        {({ step }) => <Stage department={department} step={step} live={live} />}
      </ScrollStory>
      <DepartmentOutro department={department} />
    </div>
  );
}

interface StageProps {
  department: Department;
  step: number;
  live: boolean;
}

/** The sticky frame: the loop and the caption beside (or under) the agent and its workstation. */
function Stage({ department, step, live }: StageProps) {
  const { story } = department;
  const index = Math.min(step, story.length - 1);
  const current = story[index];
  const Screen = SCREENS[department.id];

  // Camera strength is the one thing decided in JS: at phone width the whole console would be a
  // few pixels per letter, so the camera goes all the way into the region the agent is working in.
  const phone = useMediaQuery("(max-width: 639px)");
  const compact = useMediaQuery("(max-width: 1023px)");
  const focusStrength = phone ? 1 : compact ? 0.7 : 0.4;

  return (
    <div className={styles.stage}>
      <div className={styles.copy}>
        <BeatRail story={story} />
        <Caption story={story} />
      </div>

      <div className={styles.workstation}>
        <div data-arrive="agent" className={styles.agent}>
          <AgentSlot
            agent={department.id}
            mood={live ? BEAT_MOOD[current.beat] : "idle"}
            load={live ? agentLoad(story, index) : 0}
            learnCount={live ? reachedCount(story, index, "learn") : 0}
            className="h-full w-full"
          />
        </div>
        <div data-arrive="display" className={styles.display}>
          <VirtualDisplay
            width={WORKSTATION.width}
            height={WORKSTATION.height}
            // The workstation arrives whole; the camera only goes in once the agent starts working.
            focus={live ? REGION[current.focus] : REGION.full}
            focusStrength={focusStrength}
            label={`${department.console}: what the ${department.agentName} is working on`}
          >
            <ConsoleFrame department={department} step={index} live={live}>
              <ScreenBoundary>
                <Screen department={department} step={index} current={current} live={live} />
              </ScreenBoundary>
            </ConsoleFrame>
          </VirtualDisplay>
        </div>
      </div>
    </div>
  );
}
