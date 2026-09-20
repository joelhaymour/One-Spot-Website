"use client";

import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { QualityTier } from "@/lib/capabilities";
import { useExperience } from "@/state/experience";
import { SCALING_CAMERA, ScalingScene } from "./scaling/scene";
import { GLStage } from "./stage/GLStage";

/**
 * Autonomous scaling: one agent saturates, asks, and two specialists take their place beside it.
 * This file is the lazy boundary for the scene; the choreography itself is plain three.js in ./scaling.
 */

export interface ScalingStageProps {
  /** Active beat, 0..4. */
  step: number;
  tier: QualityTier;
  className?: string;
  onReady?: () => void;
}

function Scene({ step }: { step: number }) {
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
    scene.setCalm(paused);
  }, [scene, paused]);

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) scene.layout(camera, width / Math.max(1, height));
  }, [scene, camera, width, height]);

  useFrame((state, delta) => scene.update(state.clock.elapsedTime, delta, state.camera));

  return <primitive object={scene.group} />;
}

export default function ScalingStage({ step, tier, className, onReady }: ScalingStageProps) {
  return (
    <GLStage camera={SCALING_CAMERA} tier={tier} className={className} onReady={onReady} fog>
      <Scene step={step} />
    </GLStage>
  );
}
