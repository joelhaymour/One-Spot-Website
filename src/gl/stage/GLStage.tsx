"use client";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import type { QualityTier } from "@/lib/capabilities";
import { useExperience } from "@/state/experience";
import { getEnvironment } from "./environment";

/**
 * GLStage — an in-flow WebGL canvas.
 *
 * In-flow (not fixed, not DOM-tracked) so the compositor scrolls it with the page and it can never
 * drift against the layout. It renders on the same clock as Lenis and GSAP (`frameloop="never"`,
 * advanced from the GSAP ticker) and only while it is on screen and the tab is visible.
 * If anything in here throws, or the context is lost, the site drops to SVG agents and carries on.
 */

interface CameraSpec {
  position: [number, number, number];
  target?: [number, number, number];
  fov?: number;
}

interface GLStageProps {
  children: ReactNode;
  camera: CameraSpec;
  tier: QualityTier;
  className?: string;
  /** Fired once shaders are compiled and the first frame is on screen. */
  onReady?: () => void;
  fog?: boolean;
  /**
   * Honour the visitor's "Pause motion": after a short settle the stage stops rendering entirely.
   * Stages that manage pausing themselves (they need frames to show a new step) leave this off.
   */
  holdWhenPaused?: boolean;
  /** Any change to this value while paused buys another settle window, so new states still land. */
  wakeKey?: string;
}

/** Pixel budget keeps very large displays from allocating 20 MP buffers. */
function dprFor(tier: QualityTier, el: HTMLElement | null) {
  const max = tier === "full" ? 2 : 1.5;
  const device = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  if (!el) return Math.min(device, max);
  const area = Math.max(1, el.clientWidth * el.clientHeight);
  return Math.max(1, Math.min(device, max, Math.sqrt(6e6 / area)));
}

const SETTLE_SECONDS = 1.6;

function Driver({ active, onReady, holdWhenPaused, wakeKey }: { active: boolean; onReady?: () => void; holdWhenPaused?: boolean; wakeKey?: string }) {
  const advance = useThree((s) => s.advance);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const [compiled, setCompiled] = useState(false);
  const paused = useExperience((s) => s.paused);
  const hold = !!holdWhenPaused && paused;

  // Link every program off the critical path. Nothing renders until this resolves, so the first
  // visible frame never blocks the main thread on shader compilation.
  useEffect(() => {
    let cancelled = false;
    gl.compileAsync(scene, camera)
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return;
        advance(gsap.ticker.time);
        setCompiled(true);
        onReady?.();
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  useEffect(() => {
    if (!active || !compiled) return;
    const until = hold ? gsap.ticker.time + SETTLE_SECONDS : Infinity;
    const tick = (time: number) => {
      if (document.hidden) return;
      if (time > until) {
        gsap.ticker.remove(tick);
        return;
      }
      // With frameloop="never" R3F treats this value as elapsed time, so useFrame deltas are in seconds.
      advance(time);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [active, compiled, advance, hold, wakeKey]);

  return null;
}

class Boundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function GLStage({ children, camera, tier, className, onReady, fog = false, holdWhenPaused, wakeKey }: GLStageProps) {
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [dpr, setDpr] = useState(1);
  const setTier = useExperience((s) => s.setTier);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "15% 0px" });
    io.observe(el);
    // The pixel budget depends on the stage's size, so re-evaluate it when that changes.
    let timer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setDpr(dprFor(tier, el)), 200);
    });
    ro.observe(el);
    return () => {
      io.disconnect();
      ro.disconnect();
      window.clearTimeout(timer);
    };
  }, [tier]);

  return (
    <div ref={host} className={className} aria-hidden>
      <Boundary onError={() => setTier("static")}>
        <Canvas
          frameloop="never"
          dpr={dpr}
          gl={{ antialias: true, alpha: true, stencil: false, powerPreference: "high-performance" }}
          camera={{ fov: camera.fov ?? 26, position: camera.position, near: 0.1, far: 80 }}
          resize={{ scroll: false, offsetSize: true, debounce: { scroll: 0, resize: 200 } }}
          style={{ pointerEvents: "none" }}
          onCreated={({ gl, scene, camera: cam }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.95;
            gl.localClippingEnabled = true;
            gl.setClearColor(0x000000, 0);
            scene.environment = getEnvironment(gl);
            if (fog) scene.fog = new THREE.FogExp2("#07080a", 0.045);
            if (camera.target) cam.lookAt(...camera.target);
            gl.domElement.addEventListener("webglcontextlost", (e) => {
              // R3F forces a context loss when a canvas unmounts (route change, HMR). Only a loss on a
              // canvas that is still on the page is a real failure worth dropping to SVG agents for.
              if (!gl.domElement.isConnected) return;
              e.preventDefault();
              setTier("static");
            });
          }}
        >
          <directionalLight color="#e6eeff" intensity={1.1} position={[3, 6, 4]} />
          <hemisphereLight args={["#1a1f2a", "#000000", 0.25]} />
          <Driver active={active} onReady={onReady} holdWhenPaused={holdWhenPaused} wakeKey={wakeKey} />
          {children}
        </Canvas>
      </Boundary>
    </div>
  );
}
