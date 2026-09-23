import { BEFORE_AFTER } from "@/content/copy";

/**
 * Geometry for the tools diagram. All positions are authored by hand (no random, no trig at render),
 * so server and client draw the same picture. Every element has a BEFORE home (a) and an AFTER home (b);
 * the morph is one number interpolating between them.
 */

export type Pt = readonly [number, number];

export const VIEW = { w: 720, h: 600 } as const;

/** The middle of the picture: where every line starts. Before, "You" stand on it. After, One Spot does. */
export const HUB = { a: [360, 300] as Pt, b: [360, 340] as Pt };

/** You: in the middle before, above it all after. */
export const YOU = { a: HUB.a, b: [360, 52] as Pt };

export const RING_RADIUS = 195;

// Scattered, uneven distances from the middle. Listed in the same order as BEFORE_AFTER.tools.
const BEFORE: readonly Pt[] = [
  [130, 80],
  [455, 55],
  [628, 165],
  [505, 300],
  [635, 470],
  [385, 520],
  [120, 500],
  [75, 290],
];

// Eight slots on a ring around HUB.b, offset by 22.5 degrees so the top stays open for the line up to "You".
// Slots are assigned in the tools' existing angular order, so nothing crosses on the way in.
const AFTER: readonly Pt[] = [
  [285.4, 159.8],
  [434.6, 159.8],
  [540.2, 265.4],
  [540.2, 414.6],
  [434.6, 520.2],
  [285.4, 520.2],
  [179.8, 414.6],
  [179.8, 265.4],
];

export interface Tool {
  index: number;
  label: string;
  a: Pt;
  b: Pt;
  /** where the agent's spot sits on this tool's connection, in the AFTER layout */
  agentAt: Pt;
}

const mid = (p: Pt, q: Pt): Pt => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const r1 = (v: number) => Math.round(v * 10) / 10;

export const lerpPt = (p: Pt, q: Pt, t: number): Pt => [mix(p[0], q[0], t), mix(p[1], q[1], t)];
export const translate = (p: Pt) => `translate(${r1(p[0])} ${r1(p[1])})`;

export const TOOLS: readonly Tool[] = BEFORE_AFTER.tools.map((label, index) => ({
  index,
  label,
  a: BEFORE[index],
  b: AFTER[index],
  agentAt: lerpPt(HUB.b, AFTER[index], 0.54),
}));

/* ------------------------------------------------------------------ */
/* Threads: the lines. Each is two quadratic segments through a midpoint: [from, c1, mid, c2, to].        */
/* Before, the five points are pushed around to make a tangle. After, they lie dead straight through HUB. */
/* ------------------------------------------------------------------ */

type Five = readonly [Pt, Pt, Pt, Pt, Pt];

export interface Thread {
  id: string;
  /** "you" = the middle to a tool (these become the spokes); "cross" = tool to tool (these melt into the spokes) */
  kind: "you" | "cross";
  a: Five;
  b: Five;
}

/** [midpoint dx, dy, control dx, dy]: hand-picked so neighbouring threads bow in opposite directions. */
type Wobble = readonly [number, number, number, number];

const WOBBLE_YOU: readonly Wobble[] = [
  [46, -38, -30, 52],
  [-52, 34, 40, 28],
  [38, 56, -44, -20],
  [-14, -48, 26, 40],
  [60, 22, -36, 44],
  [-44, 40, 52, -26],
  [30, -60, -48, 30],
  [-38, -34, 34, -50],
];

const CROSS_PAIRS: ReadonlyArray<readonly [number, number, Wobble]> = [
  [0, 3, [70, -50, -60, 40]],
  [0, 5, [-66, 44, 50, 62]],
  [1, 4, [54, 68, -40, -56]],
  [1, 6, [-72, -36, 64, 30]],
  [2, 5, [48, -72, -58, 46]],
  [2, 7, [-50, 58, 70, -34]],
  [3, 6, [62, 40, -46, -64]],
  [4, 7, [-40, -66, 56, 48]],
  [0, 2, [76, 30, -52, 58]],
  [5, 7, [-60, 52, 44, -70]],
];

function tangled(from: Pt, to: Pt, [mx, my, cx, cy]: Wobble): Five {
  const m0 = mid(from, to);
  const m: Pt = [m0[0] + mx, m0[1] + my];
  const h = mid(from, m);
  const c1: Pt = [h[0] + cx, h[1] + cy];
  // Mirror the first control point through the midpoint so the curve passes through it without a kink.
  const c2: Pt = [m[0] + (m[0] - c1[0]) * 0.7, m[1] + (m[1] - c1[1]) * 0.7];
  return [from, c1, m, c2, to];
}

const straight = (from: Pt, through: Pt, to: Pt): Five => [from, mid(from, through), through, mid(through, to), to];

export const THREADS: readonly Thread[] = [
  ...TOOLS.map((tool, i) => ({
    id: `you-${i}`,
    kind: "you" as const,
    a: tangled(HUB.a, tool.a, WOBBLE_YOU[i]),
    b: straight(HUB.b, mid(HUB.b, tool.b), tool.b),
  })),
  ...CROSS_PAIRS.map(([from, to, wobble]) => ({
    id: `cross-${from}-${to}`,
    kind: "cross" as const,
    a: tangled(TOOLS[from].a, TOOLS[to].a, wobble),
    b: straight(TOOLS[from].b, HUB.b, TOOLS[to].b),
  })),
];

export function threadPath(thread: Thread, t: number): string {
  const n: number[] = [];
  for (let i = 0; i < 5; i += 1) {
    n.push(r1(mix(thread.a[i][0], thread.b[i][0], t)), r1(mix(thread.a[i][1], thread.b[i][1], t)));
  }
  return `M${n[0]} ${n[1]}Q${n[2]} ${n[3]} ${n[4]} ${n[5]}Q${n[6]} ${n[7]} ${n[8]} ${n[9]}`;
}

/** The order attention jumps in. Ends where it starts so the loop is seamless. */
export const HOPS: readonly number[] = [3, 6, 1, 4, 7, 2, 5, 3, 1, 6, 2, 7, 4, 5, 0];
/** Seconds spent on a tool before the next jump: uneven on purpose. */
export const DWELL: readonly number[] = [0.34, 0.22, 0.46, 0.26, 0.3, 0.52, 0.2, 0.38, 0.24, 0.42, 0.28, 0.2, 0.48, 0.3, 0.36];
