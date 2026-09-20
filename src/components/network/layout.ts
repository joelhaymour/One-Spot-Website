import { DEPARTMENTS } from "@/content/departments";

/**
 * Where everyone stands, and where the camera stands to see them. Pure maths, no three.js:
 * the WebGL scene places its rigs from this and the SVG fallback projects the same floor plan
 * through the same camera, so the two compositions land on the same pixels and can cross-fade.
 *
 * Units follow the DATUM spec: 1 U = a department agent's body width. +x is screen right,
 * +z is toward the camera.
 */

export const FLOOR_Y = -0.14;
/** An agent's dock hangs this far below its origin (at scale 1). */
const DOCK_DROP = 0.14;

/**
 * Mirrors of the rig's proportions, in U above an agent's origin. Timing and the flat drawing use
 * them; the WebGL scene asks the rigs themselves, so a drift here can never misplace a bead.
 */
export const BODY = {
  deptRingY: 1.85,
  deptRingR: 0.85,
  deptTop: 2.51,
  ceoRegisterY: 2.56,
  ceoRegisterR: 1.45,
  ceoSpotY: 2.88,
  ceoTop: 3.6,
} as const;

export interface Placement {
  x: number;
  y: number;
  z: number;
  scale: number;
}

type Vec3 = readonly [number, number, number];

export interface NetworkLayout {
  compact: boolean;
  ceo: Placement;
  /** DEPARTMENTS order. */
  departments: Placement[];
  /** True bearing of each department seen from the CEO Agent: atan2(dx, dz). 0 = toward the camera, positive = screen right. */
  bearings: number[];
  /** View-space x (-1..1) of the CEO Agent seen from each department. */
  ceoBearings: number[];
  /** Half extents of the nominal frame at the look point, rings and air included. */
  halfWidth: number;
  halfHeight: number;
  /** halfWidth / halfHeight: the aspect of the nominal frame. The DOM reserves a box of this shape. */
  aspect: number;
  /** Vertical field of view of the nominal frame, degrees. */
  fov: number;
  /** Camera elevation, radians. Never below 12 degrees or the arc in depth flattens into a row. */
  elevation: number;
  look: Vec3;
  /** Camera position. Fixed per layout: only the field of view adapts to the canvas, so perspective never changes. */
  camera: Vec3;
}

const COUNT = DEPARTMENTS.length;
const DEG = Math.PI / 180;

export function buildLayout(compact: boolean): NetworkLayout {
  const scale = compact ? 0.8 : 1;
  const spread = compact ? 3.6 : 6;
  const zEnd = compact ? -1.6 : -0.5;
  const zMid = compact ? 3 : 1.6;
  // A portrait stage trades width for depth: a chevron keeps neighbouring rings from touching.
  const curve = compact ? 1 : 2;
  const ceo: Placement = { x: 0, y: 1.4, z: compact ? -3.6 : -3.2, scale: 1 };
  const mid = (COUNT - 1) / 2;

  const departments = DEPARTMENTS.map((_, i): Placement => {
    const u = (i - mid) / mid;
    return {
      x: u * spread,
      y: FLOOR_Y + DOCK_DROP * scale,
      z: zEnd + (zMid - zEnd) * (1 - Math.pow(Math.abs(u), curve)),
      scale,
    };
  });

  const fov = compact ? 32 : 26;
  const elevation = (compact ? 22 : 16) * DEG;
  const halfWidth = compact ? 4.7 : 7.5;
  const halfHeight = compact ? 4.6 : 4;
  const look: Vec3 = compact ? [0, 1.9, 0] : [0, 2.25, -0.4];
  const distance = halfHeight / Math.tan((fov * DEG) / 2);

  return {
    compact,
    ceo,
    departments,
    bearings: departments.map((p) => Math.atan2(p.x - ceo.x, p.z - ceo.z)),
    ceoBearings: departments.map((p) => {
      const dx = ceo.x - p.x;
      const dz = ceo.z - p.z;
      return dx / Math.hypot(dx, dz);
    }),
    halfWidth,
    halfHeight,
    aspect: halfWidth / halfHeight,
    fov,
    elevation,
    look,
    camera: [look[0], look[1] + distance * Math.sin(elevation), look[2] + distance * Math.cos(elevation)],
  };
}

export const WIDE_LAYOUT = buildLayout(false);
export const COMPACT_LAYOUT = buildLayout(true);

export interface Projected {
  /** Frame fractions, origin top-left. */
  x: number;
  y: number;
  /** Frame-height fraction covered by 1 U at this depth. */
  unit: number;
}

/** Pinhole projection through the layout's nominal camera. The camera never leaves x = 0, so its right vector is +x. */
export function project(layout: NetworkLayout, x: number, y: number, z: number): Projected {
  const se = Math.sin(layout.elevation);
  const ce = Math.cos(layout.elevation);
  const dx = x - layout.camera[0];
  const dy = y - layout.camera[1];
  const dz = z - layout.camera[2];
  const depth = -dy * se - dz * ce;
  const up = dy * ce - dz * se;
  const half = depth * Math.tan((layout.fov * DEG) / 2);
  return { x: 0.5 + dx / (2 * half * layout.aspect), y: 0.5 - up / (2 * half), unit: 1 / (2 * half) };
}

/** Signed shortest way round a ring from bearing `a` to bearing `b`. */
export function shortArc(a: number, b: number): number {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}
