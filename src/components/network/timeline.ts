import { DEPARTMENTS, type AgentMood } from "@/content/departments";
import { clamp } from "@/lib/math";
import { BODY, COMPACT_LAYOUT, WIDE_LAYOUT, shortArc, type NetworkLayout } from "./layout";
import { RELAY, beatAt, departmentIndex, isDepartment, originOf } from "./relay";

/**
 * One relay beat as a score: what each agent does and where the bead is, second by second.
 * Pure data, so the WebGL choreography plays it and the DOM reads the same clock for its own entrances
 * (a chip appears when its agent speaks, the owner's card when the bead reaches them).
 *
 * `who` is a slot in AGENT_ORDER (0 = the CEO Agent). `dept` is a DEPARTMENTS index.
 */

export type Anchor = { on: "tick"; dept: number } | { on: "register"; dept: number };

export type Segment =
  /** Open air, between a department's ring tick and its tick on the CEO Agent's register ring. */
  | { kind: "arc"; t0: number; t1: number; from: Anchor; to: Anchor }
  /** Along the register ring, between two bearings, by the shorter way round. */
  | { kind: "ring"; t0: number; t1: number; from: number; to: number }
  /** Off the front of the register ring, toward the visitor. */
  | { kind: "exit"; t0: number; t1: number };

export type Cue =
  | { at: number; type: "mood"; who: number; mood: AgentMood }
  | { at: number; type: "gaze"; who: number; gaze: readonly [number, number] | null }
  | { at: number; type: "tick"; dept: number; value: number }
  | { at: number; type: "load"; who: number; value: number }
  | { at: number; type: "beat" | "pulse"; who: number }
  /** The recipient's Spot follows the bead in. */
  | { at: number; type: "track"; who: number; on: boolean };

export interface BeatTimeline {
  cues: Cue[];
  segments: Segment[];
  /** When the speaker starts to speak. */
  speak: number;
  /** When the message is received. */
  land: number;
  end: number;
}

const DEG = Math.PI / 180;
/** The transmit signature is 90 / 90 / 240 ms with two 60 ms rests. The bead leaves on the last beat. */
const THREE_BEAT = 0.55;
const GLANCE = 0.35;
const THINK = 0.4;
const RING_SPEED = 140 * DEG;
const BEAD_SPEED = 2.4;
/** A recipient turns to meet the bead this long before it lands. */
const MEET = 0.2;
const EXIT = 0.9;
/** Operations' line is "88% booked." Its seam gauge says the same. */
const BOOKED = 0.88;
const CEO_SLOT = 0;

function flight(layout: NetworkLayout, dept: number): number {
  const p = layout.departments[dept];
  const b = layout.bearings[dept];
  const dx = layout.ceo.x + Math.sin(b) * BODY.ceoRegisterR - p.x;
  const dy = layout.ceo.y + BODY.ceoRegisterY - (p.y + BODY.deptRingY * p.scale);
  const dz = layout.ceo.z + Math.cos(b) * BODY.ceoRegisterR - (p.z + BODY.deptRingR * p.scale);
  return clamp(Math.hypot(dx, dy, dz) / BEAD_SPEED, 0.7, 0.9);
}

const ringRun = (from: number, to: number) => Math.max(0.2, Math.abs(shortArc(from, to)) / RING_SPEED);

/** The CEO Agent looks at a register tick: a little down, toward that bearing. */
const toTick = (layout: NetworkLayout, dept: number): readonly [number, number] => [Math.sin(layout.bearings[dept]), -0.2];
/** A department looks up at the CEO Agent. */
const toCeo = (layout: NetworkLayout, dept: number): readonly [number, number] => [layout.ceoBearings[dept] * 0.85, 0.75];

function reportUp(layout: NetworkLayout, dept: number): BeatTimeline {
  const who = dept + 1;
  const land = THREE_BEAT + flight(layout, dept);
  const end = land + 0.15 + THINK + 0.35;
  const cues: Cue[] = [
    { at: 0, type: "mood", who, mood: "transmit" },
    { at: 0, type: "gaze", who, gaze: toCeo(layout, dept) },
    { at: THREE_BEAT, type: "mood", who, mood: "observe" },
    { at: land - MEET, type: "mood", who: CEO_SLOT, mood: "observe" },
    { at: land - MEET, type: "gaze", who: CEO_SLOT, gaze: toTick(layout, dept) },
    { at: land, type: "tick", dept, value: 1 },
    { at: land, type: "pulse", who: CEO_SLOT },
    { at: land + 0.15, type: "mood", who: CEO_SLOT, mood: "think" },
    { at: land + 0.15 + THINK, type: "mood", who: CEO_SLOT, mood: "observe" },
    { at: end, type: "mood", who, mood: "idle" },
    { at: end, type: "gaze", who, gaze: null },
  ];
  if (DEPARTMENTS[dept].id === "operations") cues.unshift({ at: 0, type: "load", who, value: BOOKED });
  return {
    cues,
    segments: [{ kind: "arc", t0: THREE_BEAT, t1: land, from: { on: "tick", dept }, to: { on: "register", dept } }],
    speak: 0,
    land,
    end,
  };
}

/** The CEO Agent passes word on: to a department, or (dept === null) to the owner. `origin` is whose news it is. */
function passOn(layout: NetworkLayout, origin: number | null, dept: number | null): BeatTimeline {
  const speak = GLANCE + THINK;
  const startBearing = origin !== null ? layout.bearings[origin] : dept !== null ? layout.bearings[dept] : 0;
  const endBearing = dept !== null ? layout.bearings[dept] : 0;
  const ringStart = speak + 0.05;
  const ringEnd = ringStart + ringRun(startBearing, endBearing);
  const land = ringEnd + (dept !== null ? flight(layout, dept) : EXIT);
  const end = land + (dept !== null ? 0.9 : 0.6);

  const cues: Cue[] = [{ at: 0, type: "mood", who: CEO_SLOT, mood: "observe" }];
  if (origin !== null) {
    cues.push(
      { at: 0, type: "gaze", who: CEO_SLOT, gaze: toTick(layout, origin) },
      { at: 0, type: "tick", dept: origin, value: 1 },
      { at: ringStart, type: "tick", dept: origin, value: 0.3 },
    );
  }
  cues.push(
    { at: GLANCE, type: "mood", who: CEO_SLOT, mood: "think" },
    { at: speak, type: "mood", who: CEO_SLOT, mood: "observe" },
    { at: speak, type: "beat", who: CEO_SLOT },
  );

  const segments: Segment[] = [{ kind: "ring", t0: ringStart, t1: ringEnd, from: startBearing, to: endBearing }];
  if (dept !== null) {
    const who = dept + 1;
    cues.push(
      { at: speak, type: "gaze", who: CEO_SLOT, gaze: toTick(layout, dept) },
      { at: ringEnd, type: "tick", dept, value: 1 },
      { at: ringEnd + 0.15, type: "tick", dept, value: 0.3 },
      { at: land - MEET, type: "mood", who, mood: "observe" },
      { at: land - MEET, type: "track", who, on: true },
      { at: land, type: "track", who, on: false },
      { at: land, type: "pulse", who },
      { at: land, type: "mood", who, mood: "act" },
      { at: land, type: "gaze", who, gaze: null },
    );
    segments.push({ kind: "arc", t0: ringEnd, t1: land, from: { on: "register", dept }, to: { on: "tick", dept } });
  } else {
    cues.push(
      // Out of the scene, at whoever is reading. Released again at the end: no agent stares.
      { at: speak, type: "gaze", who: CEO_SLOT, gaze: [0, -0.35] },
      { at: end, type: "gaze", who: CEO_SLOT, gaze: null },
      { at: end, type: "mood", who: CEO_SLOT, mood: "idle" },
    );
    segments.push({ kind: "exit", t0: ringEnd, t1: land });
  }
  return { cues, segments, speak, land, end };
}

export function buildTimeline(layout: NetworkLayout, step: number): BeatTimeline | null {
  const beat = beatAt(step);
  if (!beat) return null;
  let timeline: BeatTimeline;
  if (isDepartment(beat.from)) {
    // Every message goes to the CEO Agent first, whoever it is for: beads never travel department to department.
    timeline = reportUp(layout, departmentIndex(beat.from));
  } else {
    const origin = originOf(step);
    timeline = passOn(layout, origin ? departmentIndex(origin) : null, isDepartment(beat.to) ? departmentIndex(beat.to) : null);
  }
  timeline.cues.sort((a, b) => a.at - b.at);
  return timeline;
}

/** Index 0 is step 1. */
export const buildTimelines = (layout: NetworkLayout): BeatTimeline[] =>
  RELAY.flatMap((_, i) => buildTimeline(layout, i + 1) ?? []);

export const WIDE_TIMELINES = buildTimelines(WIDE_LAYOUT);
export const COMPACT_TIMELINES = buildTimelines(COMPACT_LAYOUT);
