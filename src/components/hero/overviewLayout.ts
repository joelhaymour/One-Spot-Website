import { BEFORE_AFTER } from "@/content/copy";

/**
 * Geometry for the hero overview: the eight tools on a floor ring around the One Spot hub,
 * the CEO Agent standing at the back of that floor, the recommendation arriving at the front.
 *
 * Everything is authored by hand in one 760 x 640 viewBox (no trig at render), so the server and
 * the client draw the same picture. The CEO Agent and the recommendation card are DOM, positioned
 * from these same numbers through `--unit` (one viewBox unit in CSS px, see overview.module.css).
 */

export type Pt = readonly [number, number];

export const VIEW = { w: 760, h: 640 } as const;

/** The hub: where every line ends. Dead centre of the floor ring. */
export const HUB: Pt = [380, 352];
export const HUB_R = 27;
export const HUB_GLOW_R = 50;

/** The floor ring the tools stand on: an ellipse, a raised camera looking down at the company. */
export const ORBIT = { rx: 296, ry: 180 } as const;

/**
 * The CEO Agent's box stands on the floor with its bottom edge here. Its register ring sits at
 * 32% of its height and the ring's front at 37% (AgentSvg / flat network), which is where the
 * stem from the hub docks and where the recommendation leaves for the owner.
 */
export const AGENT_FOOT_Y = 268;
export const AGENT_RING_FRONT = 0.37;
/** The agent body's width as a fraction of its height (AgentSvg: 120 of a 400-high viewBox, drawn to fit). */
export const AGENT_BODY_W = 0.3;

/** Top of the hub's ring: the lower end of the stem. */
export const STEM_END_Y = HUB[1] - HUB_R;

/** Where the recommendation card's top edge sits: just under the hub, in front of it. */
export const CARD_TOP_Y = 392;

/**
 * Eight slots on the orbit, clockwise from 12 o'clock at 30, 66, 110, 140, 220, 250, 294, 330 deg.
 * The top gap is for the CEO Agent, the bottom gap for the card. Side spacing (135 units) leaves
 * room for a tile and its label at phone scale.
 */
const SLOTS = {
  topRight: [528.0, 196.1],
  right: [650.4, 278.8],
  lowRight: [658.2, 413.6],
  bottomRight: [570.3, 489.9],
  bottomLeft: [189.7, 489.9],
  lowLeft: [101.8, 413.6],
  left: [109.6, 278.8],
  topLeft: [232.0, 196.1],
} as const satisfies Record<string, Pt>;

type Slot = keyof typeof SLOTS;

/**
 * Which tool stands where, by BEFORE_AFTER.tools order. Short labels go next to neighbours that
 * sit below and inward (lowRight / lowLeft), where a long label would run into the next tile on phones.
 */
const SLOT_OF: readonly Slot[] = [
  "topLeft", // Email
  "lowRight", // CRM
  "left", // Spreadsheets
  "right", // Documents
  "lowLeft", // Chat
  "bottomLeft", // Accounting
  "bottomRight", // Calendar
  "topRight", // Support
];

/** The order beads set off in: back to front, alternating sides, so the hub is fed from all around. */
const ORDER: readonly number[] = [0, 4, 3, 2, 5, 7, 6, 1];

export interface Tool {
  index: number;
  label: string;
  at: Pt;
  /** stagger index for the line draw-on and the bead */
  order: number;
  /** straight from the tile centre to the hub; the tile hides its own end */
  path: string;
}

const r1 = (v: number) => Math.round(v * 10) / 10;
export const translate = (p: Pt) => `translate(${r1(p[0])} ${r1(p[1])})`;

export const TOOLS: readonly Tool[] = BEFORE_AFTER.tools.map((label, index) => {
  const at = SLOTS[SLOT_OF[index]];
  return {
    index,
    label,
    at,
    order: ORDER[index],
    path: `M${r1(at[0])} ${r1(at[1])}L${HUB[0]} ${HUB[1]}`,
  };
});
