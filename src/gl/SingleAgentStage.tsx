"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { AgentId, AgentMood } from "@/content/departments";
import { CEO, DEPARTMENTS, DEPARTMENT_BY_ID } from "@/content/departments";
import type { QualityTier } from "@/lib/capabilities";
import { clamp } from "@/lib/math";
import { useExperience } from "@/state/experience";
import { AgentRig } from "./agent/rig";
import { GLStage } from "./stage/GLStage";

/**
 * One agent above one display: the hero CEO Agent and every department page.
 * This file is the lazy boundary: nothing outside src/gl may import three or fiber.
 */

export interface SingleAgentStageProps {
  agent: AgentId;
  tier: QualityTier;
  mood?: AgentMood;
  /** 0..1 workload shown on the seam gauge. */
  load?: number;
  /** Increment to light another record mark ("learns"). */
  learnCount?: number;
  /** Increment to fire one halo stroke. */
  pulseCount?: number;
  /** CEO in the hero: look at whatever department the visitor is pointing at. */
  followHover?: boolean;
  className?: string;
  onReady?: () => void;
}

/** Register ticks fan across the front of the CEO's ring, in HUD order. */
export const REGISTER_ANGLES = DEPARTMENTS.map((_, i) => ((i - (DEPARTMENTS.length - 1) / 2) * 24 * Math.PI) / 180);

function AgentObject({ agent, mood = "idle", load = 0, learnCount = 0, pulseCount = 0, followHover }: SingleAgentStageProps) {
  const gl = useThree((s) => s.gl);
  const rig = useMemo(() => {
    const isCeo = agent === "ceo";
    return new AgentRig({
      id: agent,
      accent: isCeo ? CEO.accent : DEPARTMENT_BY_ID[agent].accent,
      ticks: isCeo ? DEPARTMENTS.map((d, i) => ({ accent: d.accent, angle: REGISTER_ANGLES[i] })) : undefined,
      backlight: true,
    });
  }, [agent]);

  useEffect(() => () => rig.dispose(), [rig]);
  useEffect(() => rig.setMood(mood), [rig, mood]);
  useEffect(() => rig.setLoad(load), [rig, load]);

  const learned = useRef(0);
  useEffect(() => {
    while (learned.current < learnCount) {
      rig.learn();
      learned.current++;
    }
  }, [rig, learnCount]);

  const pulsed = useRef(pulseCount);
  useEffect(() => {
    if (pulseCount !== pulsed.current) {
      pulsed.current = pulseCount;
      rig.pulse();
    }
  }, [rig, pulseCount]);

  useFrame(({ clock, camera }, delta) => {
    if (followHover) {
      // Discrete store reads only: no React render, no raycast, no pointer-rate work.
      const { gazeTarget, hoveredDept } = useExperience.getState();
      if (gazeTarget) {
        const rect = gl.domElement.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height * 0.42;
        rig.setGaze(clamp((gazeTarget.x - cx) / (window.innerWidth * 0.42), -1, 1), clamp(-(gazeTarget.y - cy) / (window.innerHeight * 0.55), -1, 1));
        rig.setMood("observe");
      } else {
        rig.setGaze(null);
        rig.setMood(mood);
      }
      DEPARTMENTS.forEach((d, i) => rig.setTick(i, hoveredDept === d.id ? 1 : 0));
    }
    rig.update(clock.elapsedTime, delta, camera);
  });

  return <primitive object={rig.group} />;
}

export default function SingleAgentStage(props: SingleAgentStageProps) {
  const isCeo = props.agent === "ceo";
  // Frame the whole object with a little air. The CEO is taller and carries a wider ring.
  const camera = isCeo
    ? { position: [0, 2.35, 13.4] as [number, number, number], target: [0, 1.85, 0] as [number, number, number], fov: 24 }
    : { position: [0, 1.7, 9.6] as [number, number, number], target: [0, 1.3, 0] as [number, number, number], fov: 24 };
  return (
    <GLStage camera={camera} tier={props.tier} className={props.className} onReady={props.onReady}>
      <AgentObject {...props} />
    </GLStage>
  );
}
