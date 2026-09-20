import { SCALING } from "@/content/copy";

/**
 * The scaling scene's numbers, in one place, so the DOM queue, the metrics and the 3D agents tell
 * the same story.
 *
 * The model: one agent clears 26 tasks an hour flat out. A steady day brings 12 an hour (47% load).
 * Then the work triples to 36 an hour: 36 / 26 = 140% of capacity, which is the figure the agent
 * reports. Three agents clear all 36 at 47% load each: throughput is three times the steady day.
 */

export type LaneIndex = 0 | 1 | 2;

/** Research, Execution, Reporting. The original agent keeps the middle lane. */
export const LANES = SCALING.lanes;
export const ORIGINAL_LANE: LaneIndex = 1;

export interface QueueCardData {
  id: number;
  lane: LaneIndex;
  text: string;
  /** Created by a live arrival, so it slides in. Seeded and still-frame cards are simply there. */
  fresh: boolean;
  leaving: boolean;
}

export interface QueueSnapshot {
  cards: QueueCardData[];
  /** Work waiting beyond the cards on screen: the "+N". */
  overflow: number;
  done: number;
}

/** Interleaved so every lane receives the same share and neighbouring cards differ in type. */
const TASKS: { lane: LaneIndex; text: string }[] = [
  { lane: 0, text: "Audience research" },
  { lane: 1, text: "Draft 3 headlines" },
  { lane: 2, text: "Weekly report" },
  { lane: 1, text: "Schedule posts" },
  { lane: 0, text: "Competitor scan" },
  { lane: 2, text: "Spend summary" },
  { lane: 0, text: "Keyword review" },
  { lane: 2, text: "Channel results" },
  { lane: 1, text: "Update ad copy" },
];

export const taskAt = (seq: number) => TASKS[seq % TASKS.length];

/** Cards kept in the DOM. Anything beyond is counted, not drawn. */
export const MAX_CARDS = 14;

export interface BeatFlow {
  /** Seconds between arrivals. */
  arrival: number;
  /** Seconds between completions, across every agent on the queue. */
  service: number;
  /** Depth this beat is about. Below it work arrives in a burst and nothing clears. */
  min: number;
  /** Depth this beat can hold. At it arrivals wait; above it the backlog clears in a burst. */
  max: number;
}

/**
 * Screen time, not clock time. Arrivals triple between the steady day and the surge, and completions
 * triple once three agents share the queue, exactly as the numbers say. The saturated agent's own
 * pace and the burst thresholds are tuned so every beat resolves within a few seconds of arriving.
 */
export const FLOW: BeatFlow[] = [
  { arrival: 2.2, service: 2.2, min: 2, max: 4 },
  { arrival: 0.73, service: 2, min: 9, max: 38 },
  { arrival: 2, service: 2, min: 16, max: 38 },
  { arrival: 2, service: 2, min: 16, max: 38 },
  { arrival: 0.73, service: 0.73, min: 3, max: 6 },
];

export const CAPACITY_PER_AGENT = 26;

export const BEAT_METRICS = [
  { load: 47, throughput: 12, agents: 1 },
  { load: 140, throughput: 26, agents: 1 },
  { load: 140, throughput: 26, agents: 1 },
  { load: 140, throughput: 26, agents: 1 },
  { load: 47, throughput: 36, agents: 3 },
] as const;

export const waitMinutes = (depth: number, agents: number) => Math.round((depth * 60) / (CAPACITY_PER_AGENT * agents));

const seed = (count: number, offset: number, idBase: number): QueueCardData[] =>
  Array.from({ length: count }, (_, i) => ({ id: idBase + i, ...taskAt(offset + i), fresh: false, leaving: false }));

/**
 * One representative still per beat: what reduced-motion and paused visitors see, what the server
 * renders, and where the live queue starts from when it wakes up.
 */
export const STILLS: QueueSnapshot[] = [
  { cards: seed(3, 0, 1), overflow: 0, done: 41 },
  { cards: seed(MAX_CARDS, 3, 101), overflow: 17, done: 52 },
  { cards: seed(MAX_CARDS, 5, 201), overflow: 24, done: 58 },
  { cards: seed(MAX_CARDS, 7, 301), overflow: 24, done: 63 },
  { cards: seed(5, 1, 401), overflow: 0, done: 97 },
];

/** New short interface strings, in the deck's voice. Story copy lives in content/copy.ts. */
export const UI = {
  surface: "Work queue",
  done: "Done",
  growing: "Queue growing",
  queue: "Queue",
  lanes: "Lanes",
  waiting: "waiting",
  approved: "CEO Agent approved 2 specialists",
  metrics: { load: "Load", depth: "In queue", wait: "Avg wait", throughput: "Per hour" },
  each: "each",
  tripled: "3x",
  alone: "One agent works the queue alone.",
  team: "Three agents work side by side, one lane each.",
} as const;
