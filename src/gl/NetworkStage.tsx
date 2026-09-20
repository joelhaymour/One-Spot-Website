"use client";

import { useEffect, useMemo, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { COMPACT_LAYOUT, WIDE_LAYOUT } from "@/components/network/layout";
import type { QualityTier } from "@/lib/capabilities";
import { useExperience } from "@/state/experience";
import { NetworkCast } from "./network/cast";
import { GLStage } from "./stage/GLStage";

/**
 * The agent network: the CEO Agent raised at centre-back, seven departments on an arc in depth,
 * and a message that can only ever travel through the middle.
 * This file is the lazy boundary: nothing outside src/gl may import three or fiber.
 */

export interface NetworkStageProps {
  /** 0 = the organisation at rest, n = relay beat n. Each change plays that step's sequence once. */
  step: number;
  tier: QualityTier;
  /** Portrait floor plan: narrower arc, more depth, camera higher. */
  compact: boolean;
  /** The DOM box the composition must land on. The lens is fitted to it, so DOM overlays need no projection. */
  frame: RefObject<HTMLElement | null>;
  className?: string;
  onReady?: () => void;
}

function Scene({ step, tier, compact, frame }: NetworkStageProps) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const paused = useExperience((s) => s.paused);

  const cast = useMemo(() => new NetworkCast(compact ? COMPACT_LAYOUT : WIDE_LAYOUT, tier), [compact, tier]);
  useEffect(() => () => cast.dispose(), [cast]);
  useEffect(() => cast.enter(scene), [cast, scene]);

  useEffect(() => cast.play(step, paused), [cast, step, paused]);

  // Refit whenever the canvas or the DOM box changes size. Both rects are in client space, so scroll cancels out.
  useEffect(() => {
    const fit = () => cast.frame(camera, gl.domElement.getBoundingClientRect(), frame.current?.getBoundingClientRect() ?? null);
    fit();
    const box = frame.current;
    if (!box) return;
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, [cast, camera, gl, frame, size.width, size.height]);

  useFrame(({ clock, camera: cam }, delta) => cast.update(clock.elapsedTime, delta, cam));

  return <primitive object={cast.group} />;
}

export default function NetworkStage(props: NetworkStageProps) {
  const layout = props.compact ? COMPACT_LAYOUT : WIDE_LAYOUT;
  const [px, py, pz] = layout.camera;
  const [tx, ty, tz] = layout.look;
  return (
    <GLStage camera={{ position: [px, py, pz], target: [tx, ty, tz], fov: layout.fov }} tier={props.tier} className={props.className} onReady={props.onReady} fog>
      <Scene {...props} />
    </GLStage>
  );
}
