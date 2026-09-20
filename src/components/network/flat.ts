import { DEPARTMENTS } from "@/content/departments";
import { BODY, COMPACT_LAYOUT, WIDE_LAYOUT, project, type NetworkLayout, type Placement } from "./layout";

/**
 * The organisation drawn flat: the floor plan pushed through the same camera as the WebGL scene,
 * so the SVG composition, the message chips and the 3D agents all agree on where everyone stands.
 * Everything here is constant data, computed once per layout.
 */

/** Frame fractions, origin top-left. */
export interface FlatBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ChipAnchor {
  /** Percent of the frame. The chip sits above this point, growing right ("start") or left ("end"). */
  x: number;
  y: number;
  align: "start" | "end";
}

export interface FlatLink {
  /** Quadratic arcs in viewBox units, one per direction of travel, so a stroke can draw on the way the message goes. */
  up: string;
  down: string;
  ceoEnd: readonly [number, number];
  deptEnd: readonly [number, number];
}

export interface FlatScene {
  aspect: number;
  viewBox: string;
  ceo: FlatBox;
  /** DEPARTMENTS order. */
  departments: FlatBox[];
  /** DEPARTMENTS indices, farthest first. */
  paintOrder: number[];
  links: FlatLink[];
  /** Front of the register ring: where word leaves for the owner. */
  ceoFront: readonly [number, number];
  /** AGENT_ORDER slots. */
  chips: ChipAnchor[];
}

const VIEW_H = 1000;
/** Two decimals: far below a pixel, and it keeps server and client markup identical to the last digit. */
const r2 = (v: number) => Math.round(v * 100) / 100;

/**
 * AgentSvg's artboards in U (it draws 100 units to 1 U): overall size, where the foot is, where a line docks.
 * A department's line leaves from just over its head, so it never crosses its own glass.
 */
const DEPT_ART = { w: 2, h: 2.9, foot: 2.705, headY: 11 / 290 };
const CEO_ART = { w: 3.2, h: 4, foot: 3.8, ringY: 128 / 400, ringRx: 145 / 320, ringRy: 20 / 400 };

function boxOf(layout: NetworkLayout, p: Placement, art: { w: number; h: number; foot: number }): FlatBox {
  const at = project(layout, p.x, p.y, p.z);
  const k = at.unit * p.scale;
  const width = (art.w * k) / layout.aspect;
  return { left: at.x - width / 2, top: at.y - art.foot * k, width, height: art.h * k };
}

function arc(from: readonly [number, number], to: readonly [number, number]): string {
  const lift = 0.18 * Math.hypot(to[0] - from[0], to[1] - from[1]);
  const cx = (from[0] + to[0]) / 2;
  const cy = (from[1] + to[1]) / 2 - lift;
  return `M${r2(from[0])} ${r2(from[1])}Q${r2(cx)} ${r2(cy)} ${r2(to[0])} ${r2(to[1])}`;
}

function flatten(layout: NetworkLayout): FlatScene {
  const viewW = VIEW_H * layout.aspect;
  const toView = (fx: number, fy: number) => [r2(fx * viewW), r2(fy * VIEW_H)] as const;

  const ceo = boxOf(layout, layout.ceo, CEO_ART);
  const departments = layout.departments.map((p) => boxOf(layout, p, DEPT_ART));
  const onRegister = (bearing: number) =>
    toView(ceo.left + (0.5 + CEO_ART.ringRx * Math.sin(bearing)) * ceo.width, ceo.top + (CEO_ART.ringY + CEO_ART.ringRy * Math.cos(bearing)) * ceo.height);

  const links = departments.map((box, i): FlatLink => {
    const deptEnd = toView(box.left + box.width / 2, box.top + DEPT_ART.headY * box.height);
    const ceoEnd = onRegister(layout.bearings[i]);
    return { up: arc(deptEnd, ceoEnd), down: arc(ceoEnd, deptEnd), ceoEnd, deptEnd };
  });

  const mid = (DEPARTMENTS.length - 1) / 2;
  const ceoAt = project(layout, layout.ceo.x, layout.ceo.y, layout.ceo.z);
  const chips: ChipAnchor[] = [
    // Beside the glass at Spot height, clear of the register ring.
    { x: r2((ceoAt.x + (1.75 * ceoAt.unit) / layout.aspect) * 100), y: r2((ceoAt.y - BODY.ceoSpotY * ceoAt.unit) * 100), align: "start" },
    ...layout.departments.map((p, i): ChipAnchor => {
      const at = project(layout, p.x, p.y, p.z);
      const k = at.unit * p.scale;
      // Over the agent's head, growing toward the middle of the frame so it can never leave it.
      const align = (i - mid) / mid > 0.5 ? "end" : "start";
      const edge = ((align === "start" ? -0.5 : 0.5) * k) / layout.aspect;
      return { x: r2((at.x + edge) * 100), y: r2((at.y - (BODY.deptTop + 0.45) * k) * 100), align };
    }),
  ];

  return {
    aspect: Math.round(layout.aspect * 1e4) / 1e4,
    viewBox: `0 0 ${r2(viewW)} ${VIEW_H}`,
    ceo,
    departments,
    paintOrder: layout.departments.map((_, i) => i).sort((a, b) => layout.departments[a].z - layout.departments[b].z),
    links,
    ceoFront: onRegister(0),
    chips,
  };
}

export const WIDE_FLAT = flatten(WIDE_LAYOUT);
export const COMPACT_FLAT = flatten(COMPACT_LAYOUT);

export const pct = (fraction: number) => `${r2(fraction * 100)}%`;
