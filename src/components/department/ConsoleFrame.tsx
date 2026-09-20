"use client";

import type { ReactNode } from "react";
import { BEATS, WORKSTATION, type Department } from "@/content/departments";
import { COMPANY } from "@/content/hud";
import { Mark } from "@/components/agent/AgentSvg";
import { StatusChip } from "@/components/ui/Panel";
import { useExperience } from "@/state/experience";
import { AgentLog } from "./AgentLog";
import { Region } from "./contract";
import { stepTime } from "./story";

interface ConsoleFrameProps {
  department: Department;
  step: number;
  live: boolean;
  /** The department's screen: regions A, B, C and D. */
  children: ReactNode;
}

/**
 * What all seven consoles share: the top bar and the agent's log (region E).
 * Authored in plain px on the 1280 x 760 virtual canvas, like the screens it frames.
 */
export function ConsoleFrame({ department, step, live, children }: ConsoleFrameProps) {
  const paused = useExperience((s) => s.paused);
  const current = department.story[Math.min(step, department.story.length - 1)];
  const beat = BEATS.find((b) => b.id === current.beat);

  return (
    <div className="absolute left-0 top-0 text-[var(--text-0)]" style={{ width: WORKSTATION.width, height: WORKSTATION.height }}>
      <div className="absolute inset-x-0 top-0 flex h-[48px] items-center justify-between border-b border-[var(--line)] bg-white/[0.014] px-5">
        <div className="flex items-center gap-3">
          <Mark size={17} className="text-[rgb(var(--accent-rgb))]" />
          <span className="text-[13px] font-medium tracking-[-0.01em]">{department.console}</span>
          <span aria-hidden className="h-3.5 w-px bg-[var(--line-strong)]" />
          <span className="t-label">{COMPANY.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="t-label t-num">
            {COMPANY.dayLabel} · {stepTime(department.story, step)}
          </span>
          <StatusChip tone={department.tile.status}>{department.tile.hover}</StatusChip>
          <StatusChip tone="accent" pulse={live && !paused}>
            {beat?.label ?? current.beat}
          </StatusChip>
        </div>
      </div>

      {children}

      <Region id="E">
        <AgentLog story={department.story} step={step} live={live} />
      </Region>
    </div>
  );
}
