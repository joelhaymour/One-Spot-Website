import * as THREE from "three";
import { DEPARTMENT_BY_ID, type AgentMood } from "@/content/departments";
import { clamp, damp } from "@/lib/math";
import { DEPT } from "../agent/parts";
import { AgentRig } from "../agent/rig";
import { BeadPool } from "./beads";
import { createBacklight, createDockDisc, createFloor } from "./set";

/**
 * The scaling scene, as plain three.js: one Marketing agent at centre, two docks waiting either side,
 * and the choreography for five beats. React only tells it which beat is active.
 *
 * Every beat is a short list of timed cues on the scene's own clock, which only runs while the canvas
 * is being drawn. Entering a beat first puts the scene in that beat's base state, so any beat can be
 * reached from any other, forwards or backwards, and still read correctly.
 */

export const SCALING_CAMERA: { position: [number, number, number]; target: [number, number, number]; fov: number } = {
  position: [0, 1.55, 11.5],
  target: [0, 1.15, 0],
  fov: 24,
};

const SPECIALIST_SCALE = 0.8;
/** Underside of the original's dock: where the floor is. */
const FLOOR_Y = -0.14;
/** Lifts the smaller agents so their docks sit on the same floor. */
const SPECIALIST_Y = FLOOR_Y * (1 - SPECIALIST_SCALE);
const MIN_SPREAD = 1.9;
const MAX_SPREAD = 4;
/** Half-width one specialist needs beyond its centre: ring radius plus air. */
const RING_REACH = 0.95;
const SEED_FLIGHT = 1.4;
const BACKLIGHT = 0.085;
const WHITE = "#f4f7ff";

interface Cue {
  at: number;
  run: () => void;
}

export class ScalingScene {
  readonly group = new THREE.Group();

  private original: AgentRig;
  private specialists: AgentRig[];
  /** Whether each specialist belongs in the current beat. AgentRig cannot un-arrive, so the scene hides it. */
  private shown = [false, false];
  private docks: THREE.Mesh[] = [];
  private backlights: ReturnType<typeof createBacklight>[] = [];
  private floor = createFloor(FLOOR_Y - 0.001);
  private beads = new BeadPool(10);
  private accent: string;

  private step = -1;
  private clock = 0;
  private cues: Cue[] = [];
  private cursor = 0;
  /** Holds the beat's clock until both specialists have finished arriving. */
  private waitForTeam = false;
  /** Just above the top of the frame: where the CEO Agent is. */
  private topY = 4.4;
  /** The visitor paused motion: agents that would be busy stand at rest instead. */
  private calm = false;
  private intent = new Map<AgentRig, AgentMood>();

  private a = new THREE.Vector3();
  private b = new THREE.Vector3();
  private c = new THREE.Vector3();

  constructor() {
    const dept = DEPARTMENT_BY_ID.marketing;
    this.accent = dept.accent;

    this.original = new AgentRig({ id: dept.id, accent: dept.accent, dock: true, index: 0 });
    this.specialists = [1, 2].map(
      (index) => new AgentRig({ id: dept.id, accent: dept.accent, dock: true, spawnable: true, hidden: true, backlight: false, index }),
    );

    this.group.add(this.floor, this.original.group);
    for (const rig of this.specialists) {
      rig.group.scale.setScalar(SPECIALIST_SCALE);
      rig.group.position.y = SPECIALIST_Y;

      const dock = createDockDisc();
      dock.scale.setScalar(SPECIALIST_SCALE);
      dock.position.y = SPECIALIST_Y - 0.13 * SPECIALIST_SCALE;
      this.docks.push(dock);

      const card = createBacklight();
      card.scale.set(3.6 * SPECIALIST_SCALE, 4.6 * SPECIALIST_SCALE, 1);
      card.position.set(0, SPECIALIST_Y + rig.height * 0.55 * SPECIALIST_SCALE, -1.2 * SPECIALIST_SCALE);
      this.backlights.push(card);

      this.group.add(rig.group, dock, card);
    }
    this.group.add(this.beads.group);
    this.place(2.8);
  }

  /** Fit the three positions to the canvas: under wide canvases they line up with the three DOM lanes. */
  layout(camera: THREE.PerspectiveCamera, aspect: number) {
    const [, cy, cz] = SCALING_CAMERA.position;
    const [tx, ty, tz] = SCALING_CAMERA.target;
    const half = Math.tan((camera.fov * Math.PI) / 360);
    // A narrow canvas pulls the camera back until the outer rings fit.
    const dist = Math.max(cz, (MIN_SPREAD + RING_REACH) / (half * Math.max(0.2, aspect)));
    camera.position.set(0, cy, dist);
    camera.lookAt(tx, ty, tz);
    const halfWidth = half * dist * aspect;
    this.topY = ty + half * dist + 0.7;
    // Lane centres sit a third of the width either side of the middle.
    this.place(clamp((halfWidth * 2) / 3, MIN_SPREAD, Math.min(MAX_SPREAD, halfWidth - RING_REACH)));
  }

  private place(spread: number) {
    this.specialists.forEach((rig, i) => {
      const x = i === 0 ? -spread : spread;
      rig.group.position.x = x;
      this.docks[i].position.x = x;
      this.backlights[i].position.x = x;
    });
  }

  setStep(step: number) {
    if (step === this.step) return;
    const previous = this.step;
    this.step = step;
    this.clock = 0;
    this.cursor = 0;
    this.waitForTeam = false;
    // Going backwards, anything in flight belongs to a beat that has not happened yet.
    if (step < previous) this.beads.clear();

    const cues: Cue[] = [];
    const at = (time: number, run: () => void) => cues.push({ at: time, run });
    const o = this.original;
    const [left, right] = this.specialists;
    o.setGaze(null);
    if (step < 3) this.hideSpecialists();

    switch (step) {
      case 0: // a steady day
        this.mood(o, "act");
        o.setLoad(0.3);
        break;

      case 1: {
        // the work triples: the seam gauge climbs to full, then two glances down at it
        this.mood(o, "act");
        [0.5, 0.7, 0.85, 1].forEach((level, i) => at(i * 0.55, () => o.setLoad(level)));
        for (const start of [2.4, 3.5]) {
          at(start, () => o.setGaze(0, -1));
          at(start + 0.5, () => o.setGaze(null));
        }
        break;
      }

      case 2: // it says so: amber while the words are typed, then the message goes up
        o.setLoad(1);
        this.mood(o, "alert");
        at(2.4, () => {
          this.mood(o, "transmit");
          for (let k = 0; k < 3; k++) this.sendUp(k);
        });
        at(4.5, () => this.mood(o, "alert"));
        break;

      case 3: // specialists arrive
        o.setLoad(1);
        if (this.shown[0] && this.shown[1]) {
          // stepping back from the split: the team stays, the work has not moved yet
          this.mood(o, "act");
          for (const rig of this.specialists) {
            rig.setGaze(null);
            this.mood(rig, "idle");
            rig.setLoad(0);
          }
          break;
        }
        this.mood(o, "observe");
        o.setGaze(0, 0.9);
        at(0.7, () => this.seed(0));
        at(1.05, () => this.seed(1));
        // the original turns to meet each newcomer as its seed lands
        at(1.7, () => o.setGaze(-0.9, -0.1));
        at(2.5, () => o.setGaze(0.9, -0.1));
        at(3.5, () => {
          o.setGaze(null);
          this.mood(o, "act");
        });
        break;

      default: {
        // the work splits: two thirds of the gauge crosses to the newcomers, three beads each
        o.setLoad(1);
        this.mood(o, "act");
        this.specialists.forEach((rig, i) => {
          if (this.shown[i]) return;
          this.shown[i] = true;
          rig.setLoad(0);
          this.mood(rig, "idle");
          rig.arrive(i * 0.3);
        });
        this.waitForTeam = true;
        at(0.2, () => {
          this.mood(left, "observe");
          left.setGaze(0.9, -0.35);
          this.mood(right, "observe");
          right.setGaze(-0.9, -0.35);
        });
        for (let k = 0; k < 3; k++) {
          at(0.6 + k * 0.75, () => {
            o.setLoad(1 - (k + 1) * 0.223);
            this.share(0, (k + 1) * 0.11, 0);
            this.share(1, (k + 1) * 0.11, 0.22);
          });
        }
        at(3.6, () => {
          o.setLoad(0.33);
          for (const rig of this.specialists) {
            rig.setLoad(0.33);
            rig.setGaze(null);
            this.mood(rig, "act");
          }
        });
      }
    }

    this.cues = cues.sort((p, q) => p.at - q.at);
  }

  /** Pause switch (WCAG 2.2.2): the restless "act" loop becomes "idle"; one-shot story moves still play. */
  setCalm(calm: boolean) {
    if (calm === this.calm) return;
    this.calm = calm;
    for (const [rig, mood] of this.intent) this.mood(rig, mood);
  }

  private mood(rig: AgentRig, mood: AgentMood) {
    this.intent.set(rig, mood);
    rig.setMood(this.calm && mood === "act" ? "idle" : mood);
  }

  private hideSpecialists() {
    this.specialists.forEach((rig, i) => {
      this.shown[i] = false;
      rig.group.visible = false;
    });
  }

  /** One of the three white beads that carry the request up to the CEO Agent. */
  private sendUp(k: number) {
    const from = this.original.getTickWorld(this.a);
    this.b.set(from.x * 0.5, (from.y + this.topY) / 2, from.z + 0.35);
    this.c.set((k - 1) * 0.14, this.topY, -0.4);
    this.beads.launch({ from, via: this.b, to: this.c, duration: 1.5, delay: 0.05 + k * 0.15, color: WHITE });
  }

  /** A white seed comes down to an empty dock and becomes the new agent's Spot. */
  private seed(i: number) {
    const rig = this.specialists[i];
    rig.group.updateWorldMatrix(true, true);
    const to = rig.getSpotWorld(this.c);
    this.a.set(i === 0 ? -0.2 : 0.2, this.topY, -0.4);
    this.b.set(to.x, to.y + (this.topY - to.y) * 0.55, to.z + 0.25);
    this.beads.launch({ from: this.a, via: this.b, to, duration: SEED_FLIGHT, ease: "out", color: WHITE });
    this.shown[i] = true;
    rig.setGaze(null);
    this.mood(rig, "idle");
    rig.setLoad(0);
    // The arrival's own Spot fades up as the seed fades out.
    rig.arrive(SEED_FLIGHT - 0.12);
  }

  /** A share of the load crosses from the original's seam to a newcomer's. */
  private share(i: number, level: number, delay: number) {
    const rig = this.specialists[i];
    const from = this.original.group.localToWorld(this.a.set(0, DEPT.baseH, DEPT.d / 2 + 0.03));
    const to = rig.group.localToWorld(this.c.set(0, DEPT.baseH, DEPT.d / 2 + 0.03));
    this.b.set((from.x + to.x) / 2, Math.max(from.y, to.y) + 0.4, from.z + 0.55);
    this.beads.launch({ from, via: this.b, to, duration: 0.95, delay, color: this.accent, onLand: () => rig.setLoad(level) });
  }

  update(t: number, dtRaw: number, camera: THREE.Camera) {
    const dt = clamp(dtRaw, 0, 1 / 20);

    if (this.waitForTeam && this.specialists[0].arrived && this.specialists[1].arrived) this.waitForTeam = false;
    if (!this.waitForTeam) this.clock += dt;
    while (this.cursor < this.cues.length && this.cues[this.cursor].at <= this.clock) this.cues[this.cursor++].run();

    this.original.update(t, dt, camera);
    for (let i = 0; i < this.specialists.length; i++) {
      const rig = this.specialists[i];
      rig.update(t, dt, camera);
      // An arrival that was interrupted by scrolling back keeps running inside the rig; keep it out of sight.
      if (!this.shown[i]) rig.group.visible = false;
      const here = rig.group.visible;
      this.docks[i].visible = !here;
      const card = this.backlights[i].material;
      card.opacity = damp(card.opacity, here ? BACKLIGHT : 0, 2.4, dt);
    }
    this.beads.update(dt);
  }

  dispose() {
    this.original.dispose();
    for (const rig of this.specialists) rig.dispose();
    for (const card of this.backlights) card.material.dispose();
    this.beads.dispose();
    this.floor.geometry.dispose();
    this.floor.material.dispose();
  }
}
