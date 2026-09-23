"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { SCALING } from "@/content/copy";
import { DEPARTMENT_BY_ID, type AgentMood } from "@/content/departments";
import { AgentSvg, Mark } from "@/components/agent/AgentSvg";
import { Dot } from "@/components/ui/Panel";
import { TypedText } from "@/components/ui/TypedText";
import { GlBoundary } from "@/components/agent/GlBoundary";
import { cn } from "@/lib/cn";
import { useExperience } from "@/state/experience";
import { LANES, ORIGINAL_LANE, UI } from "./script";

// The only doorway to three.js for this scene. Never fetched on the static tier.
const ScalingStage = dynamic(() => import("@/gl/ScalingStage"), { ssr: false });

const operations = DEPARTMENT_BY_ID.operations;
const { recommendation } = SCALING;

/** Beat 3: the agent says so, in its own words. */
const SIGNAL_STEP = 2;
/** Beat 5: the work splits. */
const TEAM_STEP = 4;

/** The card is the CEO Agent's: its spot and caret are white, whatever department the scene is in. */

/** The flat stand-ins follow the same story, as final states. */
const ORIGINAL_MOOD: AgentMood[] = ["act", "act", "alert", "observe", "act"];
const ORIGINAL_GAZE_Y = [-0.5, -0.9, 0.8, 0.8, -0.5];

interface ScalingAgentsProps {
  step: number;
  /** The section has come close to the viewport: safe to spend a WebGL context on it. */
  near: boolean;
  /** Headcount granted by the owner (or the split already happened). Only now may anyone arrive. */
  granted: boolean;
  className?: string;
}

export function ScalingAgents({ step, near, granted, className }: ScalingAgentsProps) {
  const tier = useExperience((s) => s.tier);
  const [ready, setReady] = useState(false);
  const live = tier === "full" || tier === "lite";
  const mount = live && near;
  // If the 3D layer fails later the tier drops to static and the flat agents return.
  const showGl = mount && ready;

  const team = step >= TEAM_STEP;

  return (
    <div className={cn("relative", className)}>
      <p className="sr-only">{team ? UI.team : UI.alone}</p>

      <div
        className="absolute inset-0 grid grid-cols-3 items-end pb-[5%] transition-opacity duration-700 ease-[var(--ease-out)]"
        style={{ opacity: showGl ? 0 : 1 }}
        aria-hidden
      >
        {LANES.map((lane, i) => {
          const original = i === ORIGINAL_LANE;
          const present = original || granted;
          return (
            <div
              key={lane}
              className={cn("mx-auto w-full transition-opacity duration-700 ease-[var(--ease-out)]", original ? "h-[76%]" : "h-[61%]")}
              // Without a rig to extrude, the stand-ins fade in once the approval line has landed, never with it.
              style={{ opacity: present ? 1 : 0, transitionDelay: present && !original ? `${480 + i * 90}ms` : "0ms" }}
            >
              <AgentSvg
                agent="operations"
                accent={operations.accent}
                mood={original ? ORIGINAL_MOOD[step] : "act"}
                gazeX={original ? 0 : i < ORIGINAL_LANE ? 0.4 : -0.4}
                gazeY={original ? ORIGINAL_GAZE_Y[step] : -0.5}
              />
            </div>
          );
        })}
      </div>

      {mount && tier && (
        <GlBoundary>
          <ScalingStage
            step={step}
            approved={granted}
            tier={tier}
            onReady={() => setReady(true)}
            className={cn("gl-feather absolute inset-0 transition-opacity duration-700 ease-[var(--ease-out)]", showGl ? "opacity-100" : "opacity-0")}
          />
        </GlBoundary>
      )}

      {/* beat 5: the decision, on record, where the beads went */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center" aria-hidden={!team}>
        <p
          className="glass flex h-7 items-center gap-2 whitespace-nowrap rounded-full px-3 transition-[opacity,transform] duration-500 ease-[var(--ease-out)]"
          style={{
            opacity: team ? 1 : 0,
            transform: team ? "none" : "translate3d(0, -6px, 0)",
            transitionDelay: team ? "200ms" : "0ms",
          }}
        >
          <Mark size={12} className="shrink-0 text-[var(--text-0)]" />
          <span className="t-label !text-[9.5px] !text-[var(--text-0)] md:!text-[10.5px]">{recommendation.approved}</span>
        </p>
      </div>

      {/* beat 3: the agent's own words, beside it */}
      <div
        className="glass absolute top-[12%] rounded-[10px] px-2.5 py-2 transition-[opacity,transform] duration-500 ease-[var(--ease-out)] md:top-[16%] md:px-3.5 md:py-3"
        style={{
          left: "calc(50% + clamp(38px, 9%, 112px))",
          width: "min(300px, calc(50% - clamp(38px, 9%, 112px)))",
          opacity: step === SIGNAL_STEP ? 1 : 0,
          transform: step === SIGNAL_STEP ? "none" : "translate3d(-8px, 0, 0)",
        }}
        aria-hidden={step !== SIGNAL_STEP}
      >
        <span aria-hidden className="absolute right-full top-[18px] h-px w-[clamp(10px,3vw,28px)] bg-[var(--line-strong)]" />
        <span className="flex items-center gap-2">
          <Dot tone="warn" />
          <span className="t-label !text-[9px] text-[var(--text-1)] md:!text-[9.5px]">{operations.agentName}</span>
        </span>
        <p className="mt-2 text-[10.5px] leading-[1.42] tracking-[-0.004em] text-[var(--text-0)] md:text-[13px]">
          <TypedText text={SCALING.signal} active={step === SIGNAL_STEP} speed={50} delay={0.3} />
        </p>
      </div>
    </div>
  );
}
