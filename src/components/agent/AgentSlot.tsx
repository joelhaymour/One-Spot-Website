"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { AgentId, AgentMood } from "@/content/departments";
import { CEO, DEPARTMENT_BY_ID } from "@/content/departments";
import { useExperience } from "@/state/experience";
import { cn } from "@/lib/cn";
import { useNearViewport } from "@/lib/useNearViewport";
import { AgentSvg } from "./AgentSvg";
import { GlBoundary } from "./GlBoundary";

// The only doorway to three.js for single agents. Never fetched on the static tier.
const SingleAgentStage = dynamic(() => import("@/gl/SingleAgentStage"), { ssr: false });

interface AgentSlotProps {
  agent: AgentId;
  mood?: AgentMood;
  load?: number;
  learnCount?: number;
  pulseCount?: number;
  followHover?: boolean;
  className?: string;
  /** Wait this long after mount before fetching the 3D chunk, so it never competes with first paint. */
  deferMs?: number;
}

/**
 * Where an agent lives in the layout. Paints the SVG agent immediately (it is in the server HTML),
 * then, on capable devices, loads the real-time agent and cross-fades once its shaders have compiled.
 */
export function AgentSlot({ agent, mood = "idle", load, learnCount, pulseCount, followHover, className, deferMs = 300 }: AgentSlotProps) {
  const tier = useExperience((s) => s.tier);
  const hoveredDept = useExperience((s) => s.hoveredDept);
  const host = useRef<HTMLDivElement>(null);
  const near = useNearViewport(host);
  const [mount, setMount] = useState(false);
  const [ready, setReady] = useState(false);
  const accent = agent === "ceo" ? CEO.accent : DEPARTMENT_BY_ID[agent].accent;
  const live = tier === "full" || tier === "lite";

  // A WebGL context is only worth creating once the visitor is approaching this agent.
  useEffect(() => {
    if (!live || !near) return;
    const id = window.setTimeout(() => setMount(true), deferMs);
    return () => window.clearTimeout(id);
  }, [live, near, deferMs]);

  // If the 3D layer fails later (context lost, render error) the tier drops and the SVG returns.
  const showGl = live && mount && ready;

  return (
    <div ref={host} className={cn("relative", className)}>
      <div
        className="absolute inset-0 transition-opacity duration-700 ease-[var(--ease-out)]"
        style={{ opacity: showGl ? 0 : 1 }}
        aria-hidden={showGl}
      >
        <AgentSvg
          agent={agent}
          accent={accent}
          mood={followHover && hoveredDept ? "observe" : mood}
          gazeY={followHover ? -0.6 : mood === "observe" || mood === "act" ? -0.5 : mood === "transmit" ? 0.8 : 0}
          title={agent === "ceo" ? CEO.name : DEPARTMENT_BY_ID[agent].agentName}
        />
      </div>
      {live && mount && (
        <GlBoundary>
        <SingleAgentStage
          agent={agent}
          tier={tier}
          mood={mood}
          load={load}
          learnCount={learnCount}
          pulseCount={pulseCount}
          followHover={followHover}
          onReady={() => setReady(true)}
          className={cn("absolute inset-0 transition-opacity duration-700 ease-[var(--ease-out)]", showGl ? "opacity-100" : "opacity-0")}
        />
        </GlBoundary>
      )}
    </div>
  );
}
