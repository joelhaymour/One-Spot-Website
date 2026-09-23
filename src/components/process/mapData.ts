/**
 * The company map: every position is authored by hand, so the drawing is identical on the server,
 * on the client, and on every visit. Each node has two homes:
 *   a  where it sits in the company as found (scattered, organic)
 *   b  where it sits once One Spot is built around it (the Hub at the top, the workforce floor
 *      beneath it, the seven areas in calm columns below)
 * The diagram interpolates a -> b with one number, so links stay attached to their nodes while it re-organises.
 *
 * Step by step (indices as the ScrollStory hands them over):
 *   0 learn    nodes and faint relationships, the sweep scans them
 *   1 map      relationships draw on, the areas get their labels
 *   2 friction eight amber points, each classified: agent / automate / connect / redesign / human
 *   3 build    the Hub takes the top, the map re-organises around it, seven spokes route to the Hub
 *   4 work     agents on the floor beneath the Hub; automation and integration marks on the spokes
 *   5 run      the pulse travels the system; three items rise to the "Needs you" line above the Hub
 */

export type Pt = readonly [number, number];

export const VIEW = { w: 720, h: 600 } as const;

export type ClusterId = "people" | "departments" | "processes" | "software" | "information" | "customers" | "revenue";

interface ClusterDef {
  id: ClusterId;
  label: string;
  /** label position in the scattered map */
  labelAt: Pt;
  /** members as found; index 0 is the node the Hub's spoke lands on, and the top of the column once organised */
  nodes: readonly Pt[];
}

/**
 * Left-to-right order of the organised bottom tier. Sorted by where each area sits in the scattered map,
 * so every cluster mostly travels straight down when the map re-organises.
 */
const CLUSTER_DEFS: readonly ClusterDef[] = [
  { id: "departments", label: "Departments", labelAt: [108, 410], nodes: [[125, 310], [78, 322], [92, 375], [140, 358]] },
  { id: "people", label: "People", labelAt: [132, 50], nodes: [[112, 142], [100, 90], [150, 78], [168, 128]] },
  { id: "revenue", label: "Revenue", labelAt: [252, 554], nodes: [[285, 505], [270, 460], [222, 470], [235, 520]] },
  { id: "processes", label: "Processes", labelAt: [348, 158], nodes: [[322, 252], [310, 205], [352, 185], [388, 215], [372, 258]] },
  { id: "customers", label: "Customers", labelAt: [525, 562], nodes: [[530, 455], [488, 475], [498, 522], [548, 528], [562, 485]] },
  { id: "software", label: "Software", labelAt: [592, 34], nodes: [[560, 132], [550, 85], [598, 62], [632, 100], [608, 142]] },
  { id: "information", label: "Information", labelAt: [640, 278], nodes: [[590, 305], [640, 300], [648, 350], [600, 358]] },
];

export const CLUSTER_INDEX = Object.fromEntries(CLUSTER_DEFS.map((c, i) => [c.id, i])) as Record<ClusterId, number>;

const COLUMN_X = (col: number) => 60 + col * 100;
const COLUMN_TOP = 430;
const COLUMN_Y = (row: number) => COLUMN_TOP + row * 24;
/** Organised labels alternate between two rows so neighbours never touch, even on a phone. */
const LABEL_Y = (col: number) => (col % 2 === 0 ? 556 : 579);

export interface MapNode {
  id: string;
  a: Pt;
  b: Pt;
}

export interface MemberNode extends MapNode {
  cluster: ClusterId;
  clusterIndex: number;
}

export interface ClusterLabel extends MapNode {
  cluster: ClusterId;
  clusterIndex: number;
  text: string;
}

export const MEMBERS: readonly MemberNode[] = CLUSTER_DEFS.flatMap((c, col) =>
  c.nodes.map((a, row) => ({ id: `${c.id}-${row}`, cluster: c.id, clusterIndex: col, a, b: [COLUMN_X(col), COLUMN_Y(row)] as Pt })),
);

export const CLUSTER_LABELS: readonly ClusterLabel[] = CLUSTER_DEFS.map((c, col) => ({
  id: `label-${c.id}`,
  cluster: c.id,
  clusterIndex: col,
  text: c.label,
  a: c.labelAt,
  b: [COLUMN_X(col), LABEL_Y(col)] as Pt,
}));

/* ------------------------------------------------------------------ */
/* The Hub, the workforce floor, the candidate                         */
/* ------------------------------------------------------------------ */

/** One Spot Hub: the command center. It never moves; the company re-organises around it. */
export const HUB: MapNode = { id: "hub", a: [360, 118], b: [360, 118] };

/** The "Needs you" line sits above the Hub. */
export const NEEDS_YOU_Y = 56;

/** The floor beneath the Hub where the digital workforce stands. */
export const FLOOR_Y = 262;

export interface AgentNode extends MapNode {
  index: number;
  /** the area the agent works in; its link lands on that column's top node */
  serves: ClusterId;
  /** the job, in two words at most (desktop label) */
  job: string;
  /** label side, so the two agents read outward from the Hub */
  side: "left" | "right";
}

/**
 * The digital workforce. Each agent stands on the floor beneath the Hub and is born on a friction point:
 * `a` is that point in the scattered map, so nothing in the drawing is placed twice.
 */
export const AGENTS: readonly AgentNode[] = [
  { id: "agent-0", index: 0, a: [296, 356], b: [318, FLOOR_Y], serves: "revenue", job: "receivables", side: "left" },
  { id: "agent-1", index: 1, a: [565, 406.5], b: [402, FLOOR_Y], serves: "customers", job: "customers", side: "right" },
];

/** Surfaces at the end as intelligence: the operating history has found the next job worth an agent. */
export const CANDIDATE: MapNode & { serves: ClusterId } = { id: "candidate", a: [560, FLOOR_Y], b: [560, FLOOR_Y], serves: "software" };

/* ------------------------------------------------------------------ */
/* Links                                                               */
/* ------------------------------------------------------------------ */

export type LinkKind = "intra" | "closing" | "relation" | "hub" | "agent" | "serve" | "candidate";

export interface MapLink {
  id: string;
  kind: LinkKind;
  from: string;
  to: string;
  /** owning cluster (structure links, spokes) */
  cluster?: ClusterId;
  /** agent index (agent and serve links) */
  agent?: number;
  /** a relation that carries a friction point in step 3 */
  friction?: boolean;
  /** draw-on order within the kind (relations stagger by it) */
  order: number;
}

const intraLinks: MapLink[] = CLUSTER_DEFS.flatMap((c, col) =>
  c.nodes.map((_, i) => {
    const last = i === c.nodes.length - 1;
    // The last link closes the constellation; once organised it would lie on top of the column, so it fades.
    return { id: `intra-${c.id}-${i}`, kind: last ? "closing" : "intra", cluster: c.id, from: `${c.id}-${i}`, to: `${c.id}-${last ? 0 : i + 1}`, order: col } satisfies MapLink;
  }),
);

/** Handoffs between areas, as found. The third value marks the ones that carry friction. */
const RELATIONS: ReadonlyArray<readonly [string, string, boolean]> = [
  ["people-3", "processes-1", true],
  ["people-0", "departments-0", true],
  ["departments-3", "processes-0", true],
  ["processes-3", "software-0", false],
  ["software-4", "information-0", false],
  ["processes-4", "information-0", true],
  ["information-3", "customers-0", true],
  ["customers-1", "revenue-0", true],
  ["revenue-1", "processes-0", true],
  ["departments-2", "revenue-2", false],
];

const relationLinks: MapLink[] = RELATIONS.map(([from, to, friction], i) => ({ id: `rel-${i}`, kind: "relation", from, to, friction, order: i }));

/** Seven spokes: every area routes to the Hub. */
const hubLinks: MapLink[] = CLUSTER_DEFS.map((c, col) => ({ id: `hub-${c.id}`, kind: "hub", cluster: c.id, from: HUB.id, to: `${c.id}-0`, order: col }));

const agentLinks: MapLink[] = AGENTS.map((agent) => ({ id: `${agent.id}-hub`, kind: "agent", from: HUB.id, to: agent.id, agent: agent.index, order: agent.index }));

const serveLinks: MapLink[] = AGENTS.map((agent) => ({ id: `${agent.id}-${agent.serves}`, kind: "serve", from: agent.id, to: `${agent.serves}-0`, agent: agent.index, order: agent.index }));

const candidateLinks: MapLink[] = [{ id: `candidate-${CANDIDATE.serves}`, kind: "candidate", from: CANDIDATE.id, to: `${CANDIDATE.serves}-0`, order: 0 }];

/** Paint order: quiet structure first, the Hub's wiring above it. */
export const LINKS: readonly MapLink[] = [...intraLinks, ...relationLinks, ...hubLinks, ...serveLinks, ...agentLinks, ...candidateLinks];

/** What the map readout counts as handoffs: every relationship drawn in step 2. */
export const HANDOFFS = intraLinks.length + relationLinks.length;

const NODE_BY_ID: ReadonlyMap<string, MapNode> = new Map<string, MapNode>([...MEMBERS, ...AGENTS, HUB, CANDIDATE].map((n) => [n.id, n] as const));

/* ------------------------------------------------------------------ */
/* Friction                                                            */
/* ------------------------------------------------------------------ */

/** How each opportunity is classified (the note under step 3). */
export type Remedy = "agent" | "automate" | "connect" | "redesign" | "human";

/** The chip word, the word the mark carries once the remedy is in place, and how the readout counts it. */
export const REMEDY: Record<Remedy, { chip: string; mark: string; one: string; many: string }> = {
  agent: { chip: "agent", mark: "agent", one: "agent", many: "agents" },
  automate: { chip: "automate", mark: "automation", one: "automation", many: "automations" },
  connect: { chip: "connect", mark: "integration", one: "integration", many: "integrations" },
  redesign: { chip: "redesign", mark: "redesigned", one: "redesign", many: "redesigns" },
  human: { chip: "human", mark: "human", one: "stays human", many: "stay human" },
};

export interface FrictionPoint extends MapNode {
  /** 1 = costs the most */
  rank: number;
  /** the symptom, in the words of step 3 */
  label: string;
  remedy: Remedy;
  /** label and chip placement in the scattered map */
  side: "left" | "right" | "above";
  /** once organised, the mark's label alternates rows so neighbours on the spokes never touch */
  markSide: "above" | "below";
}

/** A point along an organised spoke (Hub to the top of a column), for the marks that sit on it. */
function spokePoint(cluster: ClusterId, u: number): Pt {
  const col = CLUSTER_INDEX[cluster];
  const q: Pt = [COLUMN_X(col), COLUMN_TOP];
  const [x, y] = pointOnCubic(bentCubic(HUB.b, q, 1), u);
  return [r1(x), r1(y)];
}

const MARK_U = 0.72;

/**
 * Where work waits, gets repeated, gets forgotten, needs a manual handoff or depends on the owner.
 * `a` sits on the relationship (or node) where it was found; `b` is where its remedy lands once One Spot
 * is built: the agents' points travel to the workforce floor, the rest sit on the spoke of the area they fix.
 */
export const FRICTION: readonly FrictionPoint[] = [
  { id: "friction-1", rank: 1, label: "waits", remedy: "agent", a: [565, 406.5], b: AGENTS[1].b, side: "left", markSide: "above" },
  { id: "friction-2", rank: 2, label: "forgotten", remedy: "agent", a: [296, 356], b: AGENTS[0].b, side: "right", markSide: "above" },
  { id: "friction-3", rank: 3, label: "manual handoff", remedy: "automate", a: [231, 305], b: spokePoint("departments", MARK_U), side: "above", markSide: "above" },
  { id: "friction-4", rank: 4, label: "repeated", remedy: "automate", a: [118.5, 226], b: spokePoint("people", MARK_U), side: "right", markSide: "below" },
  { id: "friction-5", rank: 5, label: "manual handoff", remedy: "connect", a: [481, 281.5], b: spokePoint("information", MARK_U), side: "above", markSide: "below" },
  { id: "friction-6", rank: 6, label: "repeated", remedy: "connect", a: [550, 85], b: spokePoint("software", MARK_U), side: "left", markSide: "above" },
  { id: "friction-7", rank: 7, label: "depends on you", remedy: "redesign", a: [239, 166.5], b: spokePoint("processes", MARK_U), side: "left", markSide: "below" },
  { id: "friction-8", rank: 8, label: "depends on you", remedy: "human", a: [386.5, 490], b: spokePoint("revenue", MARK_U), side: "above", markSide: "above" },
];

/** Remedy counts, in the order the readout speaks them. */
export const REMEDY_ORDER: readonly Remedy[] = ["agent", "automate", "connect", "redesign", "human"];
export const REMEDY_COUNT: Record<Remedy, number> = REMEDY_ORDER.reduce(
  (acc, r) => ({ ...acc, [r]: FRICTION.filter((f) => f.remedy === r).length }),
  {} as Record<Remedy, number>,
);

/** The three items that rise to the owner in step 6. Everything else keeps running below. */
export const NEEDS_YOU: readonly string[] = ["approval", "exception", "decision"];

/** Everything that moves when the map re-organises (labels and friction points included). */
export const MOVERS: readonly MapNode[] = [...MEMBERS, ...CLUSTER_LABELS, ...FRICTION];

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

// Function declarations: the friction positions above call into this section while the module initialises.
function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function r1(v: number) {
  return Math.round(v * 10) / 10;
}

export const positionAt = (node: MapNode, t: number): Pt => [mix(node.a[0], node.b[0], t), mix(node.a[1], node.b[1], t)];

export const translate = (p: Pt) => `translate(${r1(p[0])} ${r1(p[1])})`;

/** Wiring that belongs to the Hub bends into vertical-tangent curves as it organises; structure stays straight. */
const BENDS: ReadonlySet<LinkKind> = new Set<LinkKind>(["hub", "agent", "serve", "candidate"]);

export type Cubic = readonly [Pt, Pt, Pt, Pt];

/** A cubic from p to q: straight at bend 0, vertical tangents at bend 1. */
function bentCubic(p: Pt, q: Pt, bend: number): Cubic {
  const midY = (p[1] + q[1]) / 2;
  const c1: Pt = [mix(p[0] + (q[0] - p[0]) / 3, p[0], bend), mix(p[1] + (q[1] - p[1]) / 3, midY, bend)];
  const c2: Pt = [mix(p[0] + ((q[0] - p[0]) * 2) / 3, q[0], bend), mix(p[1] + ((q[1] - p[1]) * 2) / 3, midY, bend)];
  return [p, c1, c2, q];
}

function cubicFor(link: MapLink, t: number): Cubic {
  const from = NODE_BY_ID.get(link.from);
  const to = NODE_BY_ID.get(link.to);
  if (!from || !to) throw new Error(`Unknown node on link ${link.id}`);
  return bentCubic(positionAt(from, t), positionAt(to, t), BENDS.has(link.kind) ? t : 0);
}

export function linkPath(link: MapLink, t: number): string {
  const [p, c1, c2, q] = cubicFor(link, t);
  return `M${r1(p[0])} ${r1(p[1])}C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(q[0])} ${r1(q[1])}`;
}

export function pointOnCubic([p, c1, c2, q]: Cubic, u: number): Pt {
  const v = 1 - u;
  const a = v * v * v;
  const b = 3 * v * v * u;
  const c = 3 * v * u * u;
  const d = u * u * u;
  return [a * p[0] + b * c1[0] + c * c2[0] + d * q[0], a * p[1] + b * c1[1] + c * c2[1] + d * q[1]];
}

/**
 * The routes the pulse travels in step 6, in the organised layout:
 *   wave 0  Hub to the agents
 *   wave 1  agents into the areas they work
 *   wave 2  one bead rises from the Hub to the "Needs you" line
 */
export interface PulseRoute {
  id: string;
  wave: 0 | 1 | 2;
  curve: Cubic;
}

export const PULSE_ROUTES: readonly PulseRoute[] = [
  ...LINKS.filter((l) => l.kind === "agent" || l.kind === "serve").map((l): PulseRoute => ({ id: l.id, wave: l.kind === "agent" ? 0 : 1, curve: cubicFor(l, 1) })),
  { id: "rise", wave: 2, curve: [HUB.b, [HUB.b[0], HUB.b[1] - 28], [HUB.b[0], NEEDS_YOU_Y + 20], [HUB.b[0], NEEDS_YOU_Y]] },
];
