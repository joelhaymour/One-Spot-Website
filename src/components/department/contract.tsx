import type { CSSProperties, ReactNode } from "react";
import { REGION, type Department, type RegionId, type StoryStep } from "@/content/departments";
import { cn } from "@/lib/cn";

/**
 * The contract between the department shell and the seven console screens.
 *
 * A screen draws regions A, B, C and D of the 1280 x 760 console (see REGION in content/departments).
 * The shell draws the top bar, region E (the agent's log) and owns scroll, camera and the agent.
 * A screen is a pure function of `step`: scroll only ever changes the step index, and everything
 * inside a step animates on time (CSS transitions, TypedText, AnimatedNumber), never on scroll.
 */
export interface ScreenProps {
  department: Department;
  /** Index into department.story. */
  step: number;
  current: StoryStep;
  /** False until the workstation has arrived on screen. Hold the step-0 resting state until then. */
  live: boolean;
}

/** Helpers so a screen can ask narrative questions instead of comparing indexes. */
export function storyFlags(department: Department, step: number) {
  const index = (id: string) => {
    const i = department.story.findIndex((s) => s.id === id);
    if (i < 0) throw new Error(`Unknown step "${id}" for ${department.id}`);
    return i;
  };
  return {
    /** This exact step is active. */
    is: (id: string) => step === index(id),
    /** This step has started (it is active or already behind us). */
    reached: (id: string) => step >= index(id),
    /** Active somewhere in [from, to] inclusive. */
    between: (from: string, to: string) => step >= index(from) && step <= index(to),
    /** This step is finished (we have moved past it). */
    past: (id: string) => step > index(id),
  };
}

interface RegionProps {
  id: RegionId;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Absolutely positions its children in one of the console's standard regions. */
export function Region({ id, children, className, style }: RegionProps) {
  const r = REGION[id];
  return (
    <div className={cn("absolute", className)} style={{ left: r.x, top: r.y, width: r.w, height: r.h, ...style }}>
      {children}
    </div>
  );
}
