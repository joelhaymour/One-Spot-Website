/**
 * The company map: every position is authored by hand, so the drawing is identical on the server,
 * on the client, and on every visit. Each node has two homes:
 *   a  where it sits in the company as found (scattered, organic)
 *   b  where it sits once the agents are connected (three calm tiers: CEO Agent / agents / the company)
 * The diagram interpolates a -> b with one number, so links stay attached to their nodes while it re-organises.
 */

export type Pt = readonly [number, number];

export const VIEW = { w: 720, h: 600 } as const;

export type ClusterId = "people" | "departments" | "processes" | "software" | "information" | "customers" | "revenue";

interface ClusterDef {
  id: ClusterId;
  label: string;
  /** label position in the scattered map */
  labelAt: Pt;
  /** members as found; index 0 is the node agents attach to, and the top of the column once organised */
  nodes: readonly Pt[];
}

/** Left-to-right order of the organised bottom tier. */
const CLUSTER_DEFS: readonly ClusterDef[] = [
  { id: "people", label: "People", labelAt: [132, 50], nodes: [[112, 142], [100, 90], [150, 78], [168, 128]] },
  { id: "departments", label: "Departments", labelAt: [108, 410], nodes: [[125, 310], [78, 322], [92, 375], [140, 358]] },
  { id: "processes", label: "Processes", labelAt: [348, 158], nodes: [[322, 252], [310, 205], [352, 185], [388, 215], [372, 258]] },
  { id: "software", label: "Software", labelAt: [592, 34], nodes: [[560, 132], [550, 85], [598, 62], [632, 100], [608, 142]] },
  { id: "information", label: "Information", labelAt: [640, 278], nodes: [[590, 305], [640, 300], [648, 350], [600, 358]] },
  { id: "customers", label: "Customers", labelAt: [525, 562], nodes: [[530, 455], [488, 475], [498, 522], [548, 528], [562, 485]] },
  { id: "revenue", label: "Revenue", labelAt: [252, 554], nodes: [[285, 505], [270, 460], [222, 470], [235, 520]] },
];

export const CLUSTER_INDEX = Object.fromEntries(CLUSTER_DEFS.map((c, i) => [c.id, i])) as Record<ClusterId, number>;

const COLUMN_X = (col: number) => 60 + col * 100;
const COLUMN_Y = (row: number) => 430 + row * 24;
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
  /** people stay involved: this node carries a human sign-off marker */
  signOff: boolean;
}

export interface ClusterLabel extends MapNode {
  cluster: ClusterId;
  clusterIndex: number;
  text: string;
}

const SIGN_OFF = new Set(["people-1", "departments-1", "revenue-1"]);
/** The node whose marker carries the written "human sign-off" label. */
export const SIGN_OFF_LABEL_NODE = "revenue-1";

export const MEMBERS: readonly MemberNode[] = CLUSTER_DEFS.flatMap((c, col) =>
  c.nodes.map((a, row) => {
    const id = `${c.id}-${row}`;
    return { id, cluster: c.id, clusterIndex: col, a, b: [COLUMN_X(col), COLUMN_Y(row)] as Pt, signOff: SIGN_OFF.has(id) };
  }),
);

export const CLUSTER_LABELS: readonly ClusterLabel[] = CLUSTER_DEFS.map((c, col) => ({
  id: `label-${c.id}`,
  cluster: c.id,
  clusterIndex: col,
  text: c.label,
  a: c.labelAt,
  b: [COLUMN_X(col), LABEL_Y(col)] as Pt,
}));

export interface AgentNode extends MapNode {
  index: number;
  serves: readonly ClusterId[];
}

/**
 * Agents are placed exactly where the costliest friction was found, between the areas they serve.
 * Once organised they form one level row, each centred above its areas.
 */
export const AGENTS: readonly AgentNode[] = [
  { id: "agent-0", index: 0, a: [118.5, 226], b: [110, 250], serves: ["people", "departments"] },
  { id: "agent-1", index: 1, a: [231, 305], b: [210, 250], serves: ["departments", "processes"] },
  { id: "agent-2", index: 2, a: [481, 281.5], b: [360, 250], serves: ["processes", "software", "information"] },
  { id: "agent-3", index: 3, a: [565, 406.5], b: [510, 250], serves: ["information", "customers"] },
  { id: "agent-4", index: 4, a: [386.5, 490], b: [610, 250], serves: ["customers", "revenue"] },
];

/** Built first, proved first. It sits on friction point 1. */
export const LIVE_AGENT = 3;
export const LIVE_CLUSTERS: ReadonlySet<ClusterId> = new Set(AGENTS[LIVE_AGENT].serves);

export const CEO: MapNode = { id: "ceo", a: [360, 84], b: [360, 84] };

/** Surfaces in the monthly review, on a friction point no agent covers yet. */
export const CANDIDATE: MapNode & { serves: readonly ClusterId[] } = {
  id: "candidate",
  a: [296, 356],
  b: [435, 250],
  serves: ["software", "information"],
};

export type LinkKind = "intra" | "closing" | "relation" | "agent" | "ceo" | "candidate";

export interface MapLink {
  id: string;
  kind: LinkKind;
  from: string;
  to: string;
  /** agent index for agent and CEO links */
  agent?: number;
  /** owning cluster for structure links */
  cluster?: ClusterId;
  /** relation carries a friction point in step 2 */
  friction?: boolean;
}

const intraLinks: MapLink[] = CLUSTER_DEFS.flatMap((c) =>
  c.nodes.map((_, i) => {
    const last = i === c.nodes.length - 1;
    // The last link closes the constellation; once organised it would lie on top of the column, so it fades.
    return { id: `intra-${c.id}-${i}`, kind: last ? "closing" : "intra", cluster: c.id, from: `${c.id}-${i}`, to: `${c.id}-${last ? 0 : i + 1}` } satisfies MapLink;
  }),
);

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

const relationLinks: MapLink[] = RELATIONS.map(([from, to, friction], i) => ({ id: `rel-${i}`, kind: "relation", from, to, friction }));

const agentLinks: MapLink[] = AGENTS.flatMap((agent) =>
  agent.serves.map((cluster) => ({ id: `${agent.id}-${cluster}`, kind: "agent", from: agent.id, to: `${cluster}-0`, agent: agent.index }) satisfies MapLink),
);

const ceoLinks: MapLink[] = AGENTS.map((agent) => ({ id: `ceo-${agent.id}`, kind: "ceo", from: CEO.id, to: agent.id, agent: agent.index }));

const candidateLinks: MapLink[] = CANDIDATE.serves.map((cluster) => ({ id: `candidate-${cluster}`, kind: "candidate", from: CANDIDATE.id, to: `${cluster}-0` }));

/** Paint order: quiet structure first, agent wiring above it. */
export const LINKS: readonly MapLink[] = [...intraLinks, ...relationLinks, ...agentLinks, ...candidateLinks, ...ceoLinks];

const NODE_BY_ID: ReadonlyMap<string, MapNode> = new Map<string, MapNode>(
  [...MEMBERS, ...AGENTS, CEO, CANDIDATE].map((n) => [n.id, n] as const),
);

/** Everything that moves when the map re-organises (labels included). */
export const MOVERS: readonly MapNode[] = [...MEMBERS, ...CLUSTER_LABELS, ...AGENTS, CANDIDATE];

/* ------------------------------------------------------------------ */
/* Friction                                                            */
/* ------------------------------------------------------------------ */

export interface FrictionPoint {
  /** 1 = costs the most */
  rank: number;
  label: string;
  at: Pt;
  /** label placement relative to the marker */
  side: "left" | "right" | "above";
  /** an agent is placed on this point in step 3 */
  covered: boolean;
}

export const FRICTION: readonly FrictionPoint[] = [
  { rank: 1, label: "slow customer response", at: [565, 406.5], side: "left", covered: true },
  { rank: 2, label: "slow handoffs", at: [231, 305], side: "left", covered: true },
  { rank: 3, label: "manual reporting", at: [296, 356], side: "right", covered: false },
  { rank: 4, label: "duplicate work", at: [550, 85], side: "left", covered: false },
  { rank: 5, label: "information silos", at: [481, 281.5], side: "above", covered: true },
  { rank: 6, label: "repetitive work", at: [239, 166.5], side: "left", covered: false },
  { rank: 7, label: "human errors", at: [118.5, 226], side: "right", covered: true },
  { rank: 8, label: "missed opportunities", at: [386.5, 490], side: "above", covered: true },
];

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const r1 = (v: number) => Math.round(v * 10) / 10;

export const positionAt = (node: MapNode, t: number): Pt => [mix(node.a[0], node.b[0], t), mix(node.a[1], node.b[1], t)];

export const translate = (p: Pt) => `translate(${r1(p[0])} ${r1(p[1])})`;

/** Wiring that belongs to the hierarchy bends into vertical-tangent curves as it organises; structure stays straight. */
const BENDS: ReadonlySet<LinkKind> = new Set<LinkKind>(["agent", "ceo", "candidate"]);

type Cubic = readonly [Pt, Pt, Pt, Pt];

function cubicFor(link: MapLink, t: number): Cubic {
  const from = NODE_BY_ID.get(link.from);
  const to = NODE_BY_ID.get(link.to);
  if (!from || !to) throw new Error(`Unknown node on link ${link.id}`);
  const p = positionAt(from, t);
  const q = positionAt(to, t);
  const bend = BENDS.has(link.kind) ? t : 0;
  const midY = (p[1] + q[1]) / 2;
  const c1: Pt = [mix(p[0] + (q[0] - p[0]) / 3, p[0], bend), mix(p[1] + (q[1] - p[1]) / 3, midY, bend)];
  const c2: Pt = [mix(p[0] + ((q[0] - p[0]) * 2) / 3, q[0], bend), mix(p[1] + ((q[1] - p[1]) * 2) / 3, midY, bend)];
  return [p, c1, c2, q];
}

export function linkPath(link: MapLink, t: number): string {
  const [p, c1, c2, q] = cubicFor(link, t);
  return `M${r1(p[0])} ${r1(p[1])}C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(q[0])} ${r1(q[1])}`;
}

/** The routes the monthly pulse travels, in the organised layout: wave 0 = CEO Agent to agents, wave 1 = agents to the company. */
export const PULSE_ROUTES: ReadonlyArray<{ id: string; wave: 0 | 1; curve: Cubic }> = LINKS.filter((l) => l.kind === "ceo" || l.kind === "agent").map((l) => ({
  id: l.id,
  wave: l.kind === "ceo" ? 0 : 1,
  curve: cubicFor(l, 1),
}));

export function pointOnCubic([p, c1, c2, q]: Cubic, u: number): Pt {
  const v = 1 - u;
  const a = v * v * v;
  const b = 3 * v * v * u;
  const c = 3 * v * u * u;
  const d = u * u * u;
  return [a * p[0] + b * c1[0] + c * c2[0] + d * q[0], a * p[1] + b * c1[1] + c * c2[1] + d * q[1]];
}
