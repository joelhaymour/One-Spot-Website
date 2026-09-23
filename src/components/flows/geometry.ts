import type { CSSProperties } from "react";
import { HUB, RING_RADIUS, TOOLS, VIEW, YOU, lerpPt, type Pt } from "@/components/hero/layout";
import type { ToolName } from "@/content/flows-tools";
import { clamp } from "@/lib/math";

/**
 * Geometry for the flows chapter, all in the hero drawing's user units (VIEW is 720 x 600).
 *
 *   ring      the eight tiles sit on a circle around HUB.b, 45 degrees apart, the first at -112.5 degrees
 *             (the same slots layout.ts lists by hand; here they are needed as angles so the white dot can
 *             ride the orbit between two tiles)
 *   camera    where the frame is looking and how far in; converted to one CSS transform on the camera div
 *   slots     where each readout card sits, always inward toward the ring's centre so it stays in frame
 */

const DEG = Math.PI / 180;
const SLOT = 45 * DEG;
const FIRST = -112.5 * DEG;

export const toolIndex = (tool: ToolName) => TOOLS.findIndex((t) => t.label === tool);

export const angleOf = (index: number) => FIRST + SLOT * index;

export const onRing = (angle: number): Pt => [HUB.b[0] + RING_RADIUS * Math.cos(angle), HUB.b[1] + RING_RADIUS * Math.sin(angle)];

/** A route for the dot: a point for every p in 0..1, and how far it is. */
export interface Path {
  at: (p: number) => Pt;
  length: number;
}

/** Along the orbit from one tile slot to another, the shortest way round (a tie goes clockwise). */
export function arcPath(from: number, to: number): Path {
  let slots = (((to - from) % 8) + 8) % 8;
  if (slots > 4) slots -= 8;
  const start = angleOf(from);
  const sweep = slots * SLOT;
  return { at: (p) => onRing(start + sweep * p), length: Math.abs(sweep) * RING_RADIUS };
}

export function linePath(a: Pt, b: Pt): Path {
  return { at: (p) => lerpPt(a, b, p), length: Math.hypot(b[0] - a[0], b[1] - a[1]) };
}

/** 0.8 s for a hop of up to a quarter turn, stretching to 1.1 s for half a turn, so long arcs do not blur. */
export function arcDuration(path: Path): number {
  const quarter = (Math.PI / 2) * RING_RADIUS;
  return 0.8 + 0.3 * clamp((path.length - quarter) / quarter);
}

/* ------------------------------------------------------------------ */
/* Camera                                                              */
/* ------------------------------------------------------------------ */

export interface Cam {
  /** the point of the drawing at the centre of the frame */
  x: number;
  y: number;
  /** zoom */
  s: number;
}

export const HOME: Cam = { x: VIEW.w / 2, y: VIEW.h / 2, s: 1 };

/**
 * The camera div has transform-origin 0 0. A point q of the drawing (as a fraction of the frame) lands at
 * d + s * q, so to put the target at the centre, d = 50% - s * target.
 */
export const camTransform = (c: Cam) => ({
  xPercent: 50 - c.s * ((100 * c.x) / VIEW.w),
  yPercent: 50 - c.s * ((100 * c.y) / VIEW.h),
  scale: c.s,
});

export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export const union = (a: Box, b: Box): Box => ({
  x0: Math.min(a.x0, b.x0),
  y0: Math.min(a.y0, b.y0),
  x1: Math.max(a.x1, b.x1),
  y1: Math.max(a.y1, b.y1),
});

/** Centre on a box at the wanted zoom, or as close in as the box allows with a margin around it. */
export function fitCam(box: Box, zoom: number, margin = 0.88): Cam {
  const w = Math.max(1, box.x1 - box.x0);
  const h = Math.max(1, box.y1 - box.y0);
  const s = Math.min(zoom, margin * Math.min(VIEW.w / w, VIEW.h / h));
  return { x: (box.x0 + box.x1) / 2, y: (box.y0 + box.y1) / 2, s };
}

/* ------------------------------------------------------------------ */
/* Readout card slots                                                  */
/* ------------------------------------------------------------------ */

/** What a card is placed beside. */
export type FocusKey = { kind: "hop"; index: number } | { kind: "hub" } | { kind: "you" } | { kind: "mark" };

export const focusId = (key: FocusKey) => (key.kind === "hop" ? `hop-${key.index}` : key.kind);

type HAlign = "left" | "right" | "center";
type VAlign = "top" | "bottom" | "center";

export interface Slot {
  /** CSS position of the card inside the frame, in percentages (the same on the server and the client) */
  style: CSSProperties;
  /** the card's box in user units, once its rendered size is known */
  box: (w: number, h: number, u?: number, k?: number) => Box;
}

const px = (v: number) => `${((100 * v) / VIEW.w).toFixed(3)}%`;
const py = (v: number) => `${((100 * v) / VIEW.h).toFixed(3)}%`;

/**
 * A card anchored at (ax, ay). "left" puts the card's left edge on the anchor (it extends right), "right"
 * its right edge (it extends left); "top" and "bottom" likewise; "center" centres it on the anchor.
 */
function slot(ax: number, ay: number, h: HAlign, v: VAlign, underLabel = false): Slot {
  const style: CSSProperties = {};
  if (h === "left") style.left = px(ax);
  else if (h === "right") style.right = px(VIEW.w - ax);
  else style.left = px(ax);
  // A card under a label starts where the label ends, in the same --k / --u the label is drawn with
  // (26k + 15u below the tile centre, plus a gap; see labelBottom), so it never covers the label.
  const under = `calc(${py(ay)} + (var(--k) * 26 + var(--u) * 15 + 8) * ${(100 / VIEW.h).toFixed(5)}%)`;
  if (v === "top") style.top = underLabel ? under : py(ay);
  else if (v === "bottom") style.bottom = py(VIEW.h - ay);
  else style.top = py(ay);
  const tx = h === "center" ? "-50%" : "0";
  const ty = v === "center" ? "-50%" : "0";
  if (tx !== "0" || ty !== "0") style.transform = `translate(${tx}, ${ty})`;
  return {
    style,
    box: (w, hgt, u = 1, k = 1) => {
      const top = underLabel ? ay + labelBottom(u, k) : ay;
      const x0 = h === "left" ? ax : h === "right" ? ax - w : ax - w / 2;
      const y0 = v === "top" ? top : v === "bottom" ? ay - hgt : ay - hgt / 2;
      return { x0, y0, x1: x0 + w, y1: y0 + hgt };
    },
  };
}

/**
 * One slot per tile, inward. The top pair go below their labels and the bottom pair above their tiles (a
 * card beside a top tile would cover the other top tile); the side tiles take a card beside them, offset
 * away from the mark so the mark stays clear.
 */
/**
 * Where a tile's label ends, in user units below the tile centre: the label transform in hero/nodes.tsx
 * (26k + 15u) plus a gap. u and k are the frame's scale (useSvgUnit); the same sum is written in CSS for
 * the card's top, so the two never disagree.
 */
export const labelBottom = (u: number, k: number) => k * 26 + u * 15 + 8;

const TILE_SLOTS: readonly Slot[] = TOOLS.map((tool) => {
  const [x, y] = tool.b;
  switch (tool.index) {
    case 0:
      return slot(x - 26, y, "left", "top", true);
    case 1:
      return slot(x + 26, y, "right", "top", true);
    case 2:
      return slot(x - 38, y + 12, "right", "bottom");
    case 3:
      return slot(x - 38, y - 12, "right", "top");
    case 4:
      return slot(x + 26, y - 36, "right", "bottom");
    case 5:
      return slot(x - 26, y - 36, "left", "bottom");
    case 6:
      return slot(x + 38, y - 12, "left", "top");
    default:
      return slot(x + 38, y + 12, "left", "bottom");
  }
});

const HUB_SLOT = slot(HUB.b[0] - 52, HUB.b[1], "right", "center");
const YOU_SLOT = slot(YOU.b[0], YOU.b[1] + 28, "center", "top");

export const slotFor = (key: FocusKey, tool?: ToolName): Slot => {
  if (key.kind === "hop") return TILE_SLOTS[tool ? toolIndex(tool) : 0];
  return key.kind === "you" ? YOU_SLOT : HUB_SLOT;
};

/** The thing the card sits beside, as a box the camera must keep in frame with it. */
export const anchorBox = (key: FocusKey, tool?: ToolName, u = 1, k = 1): Box => {
  if (key.kind === "hop") {
    const [x, y] = TOOLS[tool ? toolIndex(tool) : 0].b;
    // the tile and the label under it
    return { x0: x - 30, y0: y - 32, x1: x + 30, y1: y + labelBottom(u, k) };
  }
  if (key.kind === "you") {
    const [x, y] = YOU.b;
    return { x0: x - 16, y0: y - 16, x1: x + 64, y1: y + 18 };
  }
  const [x, y] = HUB.b;
  // the mark and its label to the right
  return { x0: x - 44, y0: y - 44, x1: x + 118, y1: y + 44 };
};

/** Which side of the dot a carry label rides on: toward the ring's centre, chosen once per journey. */
export const labelSide = (path: Path): "left" | "right" => (path.at(0.5)[0] > HUB.b[0] ? "left" : "right");
