export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Frame-rate independent exponential smoothing. `lambda` ≈ responsiveness (higher = snappier). */
export const damp = (a: number, b: number, lambda: number, dt: number) =>
  lerp(a, b, 1 - Math.exp(-lambda * dt));

/** Map `v` from [inMin, inMax] to [outMin, outMax], clamped. */
export const mapRange = (v: number, inMin: number, inMax: number, outMin = 0, outMax = 1) =>
  outMin + (outMax - outMin) * clamp((v - inMin) / (inMax - inMin));

/** Progress of a sub-window inside a 0..1 timeline: 0 before `start`, 1 after `end`. */
export const segment = (p: number, start: number, end: number) => clamp((p - start) / (end - start));

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Deterministic pseudo-random in [0,1) from an integer seed. Stable across SSR and client. */
export const seeded = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
