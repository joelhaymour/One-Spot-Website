/**
 * Progressive enhancement tiers.
 *  - "static": no WebGL or the visitor asked for reduced motion / data saving. SVG agents, final states, no journeys.
 *  - "lite":   WebGL available but constrained (phones, low core count). 3D agents, capped DPR, simplified scenes.
 *  - "full":   everything.
 */
export type QualityTier = "static" | "lite" | "full";

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

let cachedWebGL: boolean | null = null;

export function hasWebGL(): boolean {
  if (cachedWebGL !== null) return cachedWebGL;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    cachedWebGL = !!gl;
    // Release the probe context immediately; browsers cap live contexts.
    (gl?.getExtension("WEBGL_lose_context") as { loseContext: () => void } | null)?.loseContext();
  } catch {
    cachedWebGL = false;
  }
  return cachedWebGL;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function detectTier(): QualityTier {
  if (typeof window === "undefined") return "static";
  const nav = navigator as NavigatorHints;
  if (prefersReducedMotion() || nav.connection?.saveData || !hasWebGL()) return "static";

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  const slowNet = /(^|-)2g$/.test(nav.connection?.effectiveType ?? "");
  if (coarse || cores <= 4 || memory <= 4 || slowNet) return "lite";
  return "full";
}

/** Device-pixel-ratio ceiling per tier. Retina at 2x is the visual sweet spot; beyond is wasted fill-rate. */
export const dprFor = (tier: QualityTier): [number, number] => (tier === "full" ? [1, 2] : [1, 1.5]);
