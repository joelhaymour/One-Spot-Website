import * as THREE from "three";
import type { AgentMood } from "@/content/departments";
import { shortArc, type NetworkLayout } from "@/components/network/layout";
import { AGENT_ORDER, accentOf, agentSlot, beatAt, involvedIn, originOf } from "@/components/network/relay";
import { buildTimelines, type Anchor, type BeatTimeline, type Cue } from "@/components/network/timeline";
import { easeInOutCubic, segment } from "@/lib/math";
import type { AgentRig } from "../agent/rig";
import type { Bead } from "./bead";

/**
 * Plays the relay. Each time a step becomes active its score runs once, on the scene's own clock.
 *
 * Before it starts, every agent is put in the state the previous steps leave behind. Scrolling forward
 * that changes nothing; scrolling back it rewinds the room, so the beat replays from a true beginning
 * and a fast flick can never leave a half-told message on stage.
 */

interface CastState {
  mood: AgentMood[];
  gaze: (readonly [number, number] | null)[];
  load: number[];
  tick: number[];
}

/** Volume of the agents a beat is not about, of a room at rest, and of the CEO Agent at rest. */
const BACKGROUND = 0.35;
const AT_REST = 0.6;
const CEO_AT_REST = 0.85;
/** Re-aim a tracking Spot only when the bead has visibly moved against it. */
const TRACK_EPSILON = 0.04;
/** How far across its glass a Spot travels to meet a bead. */
const TRACK_REACH = 0.8;

export class Choreography {
  private timelines: BeatTimeline[];
  private timeline: BeatTimeline | null = null;
  private t = 0;
  private next = 0;
  private tracking = -1;
  private trackedX = 0;
  private trackedY = 0;

  private ring = { x: 0, y: 0, z: 0, r: 1 };
  private exitTo = new THREE.Vector3();
  private p0 = new THREE.Vector3();
  private p2 = new THREE.Vector3();
  private control = new THREE.Vector3();
  private at = new THREE.Vector3();
  private tmp = new THREE.Vector3();

  constructor(
    private ceo: AgentRig,
    private departments: AgentRig[],
    private layout: NetworkLayout,
    private bead: Bead,
  ) {
    this.timelines = buildTimelines(layout);
  }

  /** `instant`: no performance, only the state the step ends in (the visitor paused motion). */
  play(step: number, instant: boolean) {
    const state: CastState = {
      mood: AGENT_ORDER.map((): AgentMood => "idle"),
      gaze: AGENT_ORDER.map(() => null),
      load: AGENT_ORDER.map(() => 0),
      tick: this.departments.map(() => 0),
    };
    const upTo = instant ? step : step - 1;
    for (let s = 1; s <= upTo; s++) fold(state, this.timelines[s - 1]?.cues ?? []);
    this.apply(state);

    const involved = involvedIn(step).map(agentSlot);
    AGENT_ORDER.forEach((_, slot) => {
      const rest = slot === 0 ? CEO_AT_REST : AT_REST;
      this.rig(slot).setEmphasis(step === 0 ? rest : involved.includes(slot) ? 1 : BACKGROUND);
    });

    this.bead.hide();
    this.tracking = -1;
    this.timeline = instant ? null : (this.timelines[step - 1] ?? null);
    this.t = 0;
    this.next = 0;
    if (!this.timeline) return;

    const beat = beatAt(step);
    this.bead.setAccent(accentOf(originOf(step) ?? beat?.from ?? "ceo"));
    this.measure();
  }

  update(dt: number, camera: THREE.Camera) {
    const timeline = this.timeline;
    if (!timeline) return;
    this.t += dt;
    const t = this.t;

    while (this.next < timeline.cues.length && timeline.cues[this.next].at <= t) this.fire(timeline.cues[this.next++]);

    let flying = false;
    const segments = timeline.segments;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (t < seg.t0 || t >= seg.t1) continue;
      flying = true;
      const u = (t - seg.t0) / (seg.t1 - seg.t0);
      if (seg.kind === "arc") {
        this.anchor(seg.from, this.p0);
        this.anchor(seg.to, this.p2);
        // Shallow arc: the control point floats above the chord by 18% of its length.
        this.control.addVectors(this.p0, this.p2).multiplyScalar(0.5);
        this.control.y += 0.18 * this.p0.distanceTo(this.p2);
        const e = easeInOutCubic(u);
        const a = (1 - e) * (1 - e);
        const b = 2 * (1 - e) * e;
        const d = e * e;
        this.at.set(
          a * this.p0.x + b * this.control.x + d * this.p2.x,
          a * this.p0.y + b * this.control.y + d * this.p2.y,
          a * this.p0.z + b * this.control.z + d * this.p2.z,
        );
        this.bead.show(this.at, segment(t - seg.t0, 0, 0.08));
        this.bead.drawTrail(this.p0, this.control, this.p2, e);
      } else if (seg.kind === "ring") {
        const bearing = seg.from + shortArc(seg.from, seg.to) * (u * u * (3 - 2 * u));
        this.onRing(bearing, this.at);
        this.bead.show(this.at, segment(t - seg.t0, 0, 0.12));
        this.bead.hideTrail();
      } else {
        const e = easeInOutCubic(u);
        this.onRing(0, this.p0);
        this.at.lerpVectors(this.p0, this.exitTo, e);
        // It is coming to the visitor: it swells as it nears and is gone before it would land.
        this.bead.show(this.at, 1 - segment(e, 0.4, 1), 1 + 0.8 * e);
        this.bead.hideTrail();
      }
      break;
    }
    if (!flying) this.bead.hide();

    if (this.tracking >= 0 && flying) {
      const rig = this.rig(this.tracking);
      rig.getSpotWorld(this.tmp);
      this.tmp.subVectors(this.at, this.tmp).transformDirection(camera.matrixWorldInverse);
      // Only where the bead is on screen matters to a gaze. Depth would shrink the turn to nothing as it closes in.
      const across = Math.hypot(this.tmp.x, this.tmp.y);
      if (across > 1e-3) {
        const gx = (this.tmp.x / across) * TRACK_REACH;
        const gy = (this.tmp.y / across) * TRACK_REACH;
        if (Math.abs(gx - this.trackedX) + Math.abs(gy - this.trackedY) > TRACK_EPSILON) {
          this.trackedX = gx;
          this.trackedY = gy;
          rig.setGaze(gx, gy);
        }
      }
    }

    if (t > timeline.end) this.timeline = null;
  }

  private rig(slot: number): AgentRig {
    return slot === 0 ? this.ceo : this.departments[slot - 1];
  }

  private anchor(a: Anchor, out: THREE.Vector3) {
    return a.on === "tick" ? this.departments[a.dept].getTickWorld(out) : this.ceo.getRegisterTickWorld(a.dept, out);
  }

  /** Read the register ring off the rig itself, so the bead rides the real ring whatever the rig's proportions. */
  private measure() {
    const centre = this.ceo.group.position;
    this.ceo.getRegisterTickWorld(0, this.tmp);
    this.ring.x = centre.x;
    this.ring.z = centre.z;
    this.ring.y = this.tmp.y + 0.03;
    this.ring.r = Math.hypot(this.tmp.x - centre.x, this.tmp.z - centre.z);

    const [cx, cy, cz] = this.layout.camera;
    this.onRing(0, this.p0);
    this.exitTo.set(cx, cy, cz).sub(this.p0).multiplyScalar(0.62).add(this.p0);
    this.exitTo.y -= 0.65 * this.layout.halfHeight;
  }

  private onRing(bearing: number, out: THREE.Vector3) {
    return out.set(this.ring.x + Math.sin(bearing) * this.ring.r, this.ring.y, this.ring.z + Math.cos(bearing) * this.ring.r);
  }

  private fire(cue: Cue) {
    switch (cue.type) {
      case "mood":
        this.rig(cue.who).setMood(cue.mood);
        break;
      case "gaze":
        if (cue.gaze) this.rig(cue.who).setGaze(cue.gaze[0], cue.gaze[1]);
        else this.rig(cue.who).setGaze(null);
        break;
      case "tick":
        this.ceo.setTick(cue.dept, cue.value);
        break;
      case "load":
        this.rig(cue.who).setLoad(cue.value);
        break;
      case "beat":
        this.rig(cue.who).beat();
        break;
      case "pulse":
        this.rig(cue.who).pulse();
        break;
      case "track":
        this.tracking = cue.on ? cue.who : -1;
        this.trackedX = this.trackedY = 2;
        break;
    }
  }

  private apply(state: CastState) {
    AGENT_ORDER.forEach((_, slot) => {
      const rig = this.rig(slot);
      rig.setMood(state.mood[slot]);
      const gaze = state.gaze[slot];
      if (gaze) rig.setGaze(gaze[0], gaze[1]);
      else rig.setGaze(null);
      rig.setLoad(state.load[slot]);
    });
    state.tick.forEach((value, dept) => this.ceo.setTick(dept, value));
  }
}

/** What a run of cues leaves behind. One-shot gestures (beats, pulses, tracking) leave nothing. */
function fold(state: CastState, cues: Cue[]) {
  for (const cue of cues) {
    if (cue.type === "mood") state.mood[cue.who] = cue.mood;
    else if (cue.type === "gaze") state.gaze[cue.who] = cue.gaze;
    else if (cue.type === "load") state.load[cue.who] = cue.value;
    else if (cue.type === "tick") state.tick[cue.dept] = cue.value;
  }
}
