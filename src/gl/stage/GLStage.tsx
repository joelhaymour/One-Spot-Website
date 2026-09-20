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
}

/** Pixel budget keeps very large displays from allocating 20 MP buffers. */
function dprFor(tier: QualityTier, el: HTMLElement | null) {
  const max = tier === "full" ? 2 : 1.5;
  const device = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  if (!el) return Math.min(device, max);
  const area = Math.max(1, el.clientWidth * el.clientHeight);
  return Math.max(1, Math.min(device, max, Math.sqrt(6e6 / area)));
}

function Driver({ active, onReady }: { active: boolean; onReady?: () => void }) {
  const advance = useThree((s) => s.advance);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const ready = useRef(false);

  // Compile every program off the critical path before the first visible frame.
  useEffect(() => {
    let cancelled = false;
    gl.compileAsync(scene, camera)
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return;
        advance(gsap.ticker.time);
        if (!ready.current) {
          ready.current = true;
          onReady?.();
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  useEffect(() => {
    if (!active) return;
    const tick = (time: number) => {
      if (document.hidden) return;
      // With frameloop="never" R3F treats this value as elapsed time, so useFrame deltas are in seconds.
      advance(time);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [active, advance]);

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

export function GLStage({ children, camera, tier, className, onReady, fog = false }: GLStageProps) {
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [dpr, setDpr] = useState(1);
  const setTier = useExperience((s) => s.setTier);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    setDpr(dprFor(tier, el));
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "15% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [tier]);

  return (
    <div ref={host} className={className} aria-hidden>
      <Boundary onError={() => setTier("static")}>
        <Canvas
          frameloop="never"
          dpr={dpr}
          gl={{ antialias: true, alpha: true, stencil: false, powerPreference: "high-performance" }}
          camera={{ fov: camera.fov ?? 26, position: camera.position, near: 0.1, far: 80 }}
          resize={{ scroll: false, debounce: { scroll: 0, resize: 200 } }}
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
          <Driver active={active} onReady={onReady} />
          {children}
        </Canvas>
      </Boundary>
    </div>
  );
}
