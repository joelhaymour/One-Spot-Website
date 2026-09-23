"use client";

import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { QualityTier } from "@/lib/capabilities";
import { useExperience } from "@/state/experience";
import { SCALING_CAMERA, ScalingScene } from "./scaling/scene";
import { GLStage } from "./stage/GLStage";

/**
 * Scaling the workforce: one agent saturates and says so, the CEO Agent recommends two specialists,
 * and only once the visitor's approval is on screen do they take their place beside the original.
 * This file is the lazy boundary for the scene; the choreography itself is plain three.js in ./scaling.
 */

export interface ScalingStageProps {
  /** Active beat, 0..4. */
  step: number;
  /**
   * Headcount granted: the DOM has shown the visitor's approval (or the split has already happened).
   * The scene cannot start an arrival before this is true. It never hides anyone; scrolling back does.
   */
  approved: boolean;
  tier: QualityTier;
  className?: string;
  onReady?: () => void;
}

function Scene({ step, approved }: { step: number; approved: boolean }) {
  const camera = useThree((s) => s.camera);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const paused = useExperience((s) => s.paused);
  const scene = useMemo(() => new ScalingScene(), []);

  useEffect(() => () => scene.dispose(), [scene]);

  useEffect(() => {
    scene.setStep(step);
  }, [scene, step]);

  useEffect(() => {
    scene.setApproved(approved);
  }, [scene, approved]);

  useEffect(() => {
    scene.setCalm(paused);
  }, [scene, paused]);

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) scene.layout(camera, width / Math.max(1, height));
  }, [scene, camera, width, height]);

  useFrame((state, delta) => scene.update(state.clock.elapsedTime, delta, state.camera));

  return <primitive object={scene.group} />;
}

export default function ScalingStage({ step, approved, tier, className, onReady }: ScalingStageProps) {
  return (
    <GLStage camera={SCALING_CAMERA} tier={tier} className={className} onReady={onReady} fog>
      <Scene step={step} approved={approved} />
    </GLStage>
  );
}
