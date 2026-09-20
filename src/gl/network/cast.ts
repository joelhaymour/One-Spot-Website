import * as THREE from "three";
import { CEO, DEPARTMENTS } from "@/content/departments";
import { FLOOR_Y, type NetworkLayout, type Placement } from "@/components/network/layout";
import { agentSlot, involvedIn } from "@/components/network/relay";
import type { QualityTier } from "@/lib/capabilities";
import { easeInOutCubic } from "@/lib/math";
import { AgentRig } from "../agent/rig";
import { getSoftTexture } from "../agent/parts";
import { Bead } from "./bead";
import { Choreography } from "./choreography";

/**
 * The room: eight agents, a floor, one bead, one camera operator. Plain three.js behind a small
 * control surface, so the React layer only ever says "play this step" and "advance".
 */

/** How far the camera leans toward the pair in conversation, as a share of their offset from the look point. */
const LEAN = 0.12;
/** Camera moves breathe: 1.1 to 1.4 s, ease in and out, no overshoot. */
const DRIFT_SECONDS = 1.3;
/**
 * The stage's stock haze is tuned for one agent a few units away. This room is seen from about 18 U,
 * where it would swallow half of every agent, so it is thinned: the cast stays crisp, the far floor still melts.
 */
const HAZE = 0.022;
/** After "pause motion", springs get this long to reach their final state, then the room is still. */
const SETTLE_SECONDS = 1.6;
const DEG = Math.PI / 180;

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

function place(object: THREE.Object3D, p: Placement) {
  object.position.set(p.x, p.y, p.z);
  object.scale.setScalar(p.scale);
}

export class NetworkCast {
  readonly group = new THREE.Group();
  private ceo: AgentRig;
  private departments: AgentRig[];
  private rigs: AgentRig[];
  private bead: Bead;
  private choreography: Choreography;
  private owned: { dispose: () => void }[] = [];

  private still = false;
  private settle = 0;

  private pos = new THREE.Vector3();
  private look = new THREE.Vector3();
  private fromPos = new THREE.Vector3();
  private fromLook = new THREE.Vector3();
  private toPos = new THREE.Vector3();
  private toLook = new THREE.Vector3();
  private driftT = 1;

  constructor(
    private layout: NetworkLayout,
    tier: QualityTier,
  ) {
    this.ceo = new AgentRig({
      id: "ceo",
      accent: CEO.accent,
      backlight: true,
      // ringPoint() measures its angle toward -x. A true bearing (positive = screen right) goes in negated,
      // which puts every tick on the side of the ring that actually faces its department.
      ticks: DEPARTMENTS.map((d, i) => ({ accent: d.accent, angle: -layout.bearings[i] })),
    });
    place(this.ceo.group, layout.ceo);

    this.departments = DEPARTMENTS.map((d, i) => {
      const rig = new AgentRig({ id: d.id, accent: d.accent, dock: true, backlight: false, index: i + 1, ceoBearing: layout.ceoBearings[i] });
      place(rig.group, layout.departments[i]);
      return rig;
    });
    this.rigs = [this.ceo, ...this.departments];

    const floorGeometry = new THREE.PlaneGeometry(200, 140);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: "#08090b", metalness: 0.9, roughness: tier === "full" ? 0.32 : 0.5 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, FLOOR_Y, -30);
    this.group.add(floor);
    this.owned.push(floorGeometry, floorMaterial);

    if (tier === "full") {
      // The CEO Agent has no dock, so nothing ties it to the floor. One soft pool of its own light does.
      const poolGeometry = new THREE.PlaneGeometry(1, 1);
      const poolMaterial = new THREE.MeshBasicMaterial({
        map: getSoftTexture(),
        color: CEO.accent,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        opacity: 0.05,
      });
      const pool = new THREE.Mesh(poolGeometry, poolMaterial);
      pool.rotation.x = -Math.PI / 2;
      pool.scale.set(5.2, 3.2, 1);
      pool.position.set(layout.ceo.x, FLOOR_Y + 0.004, layout.ceo.z);
      this.group.add(pool);
      this.owned.push(poolGeometry, poolMaterial);
    }

    for (const rig of this.rigs) this.group.add(rig.group);

    this.bead = new Bead(layout.compact ? 0.9 : 1);
    this.group.add(this.bead.group);
    this.choreography = new Choreography(this.ceo, this.departments, layout, this.bead);

    this.pos.set(...layout.camera);
    this.look.set(...layout.look);
    this.toPos.copy(this.pos);
    this.toLook.copy(this.look);
  }

  /** Called once the room is in a scene. */
  enter(scene: THREE.Scene) {
    if (scene.fog instanceof THREE.FogExp2) scene.fog.density = HAZE;
  }

  /** A step became active. `still`: the visitor paused motion, so go straight to where the step ends. */
  play(step: number, still: boolean) {
    this.still = still;
    this.settle = SETTLE_SECONDS;
    this.choreography.play(step, still);
    this.aim(step);
    if (still) {
      this.driftT = 1;
      this.pos.copy(this.toPos);
      this.look.copy(this.toLook);
    }
  }

  /** The one per-frame entry point for the whole scene. */
  update(time: number, delta: number, camera: THREE.Camera) {
    const dt = Math.min(delta, 1 / 20);
    if (this.still) {
      if (this.settle <= 0) return;
      this.settle -= dt;
    }

    if (this.driftT < 1) {
      this.driftT = Math.min(1, this.driftT + dt / DRIFT_SECONDS);
      const e = easeInOutCubic(this.driftT);
      this.pos.lerpVectors(this.fromPos, this.toPos, e);
      this.look.lerpVectors(this.fromLook, this.toLook, e);
    }
    camera.position.copy(this.pos);
    camera.lookAt(this.look);

    this.choreography.update(dt, camera);
    for (let i = 0; i < this.rigs.length; i++) this.rigs[i].update(time, delta, camera);
  }

  /**
   * Fit the lens so the layout's nominal frame lands exactly on a DOM box. The camera never moves for this,
   * only its field of view and principal point do, so the SVG composition drawn in that box (same projection)
   * and the chips anchored to it line up with the 3D scene at every canvas size.
   */
  frame(camera: THREE.Camera, canvas: Rect, target: Rect | null) {
    if (!(camera instanceof THREE.PerspectiveCamera) || canvas.width < 1 || canvas.height < 1) return;
    // No usable box (not laid out yet): centre the frame in the canvas, as large as it goes.
    const box = target && target.height > 1 ? target : null;
    const height = box ? box.height : Math.min(canvas.height, canvas.width / this.layout.aspect);
    const focal = height / 2 / Math.tan((this.layout.fov * DEG) / 2);
    camera.fov = (2 * Math.atan(canvas.height / 2 / focal)) / DEG;
    camera.aspect = canvas.width / canvas.height;
    const dx = box ? box.left + box.width / 2 - (canvas.left + canvas.width / 2) : 0;
    const dy = box ? box.top + box.height / 2 - (canvas.top + canvas.height / 2) : 0;
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) camera.setViewOffset(canvas.width, canvas.height, -dx, -dy, canvas.width, canvas.height);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }

  dispose() {
    for (const rig of this.rigs) rig.dispose();
    this.bead.dispose();
    for (const o of this.owned) o.dispose();
  }

  /** Lean toward whoever is talking. Small: the wide shot is the point, this only says where to look. */
  private aim(step: number) {
    const { layout } = this;
    const [cx, cy, cz] = layout.camera;
    const [lx, ly, lz] = layout.look;
    this.fromPos.copy(this.pos);
    this.fromLook.copy(this.look);
    this.toPos.set(cx, cy, cz);
    this.toLook.set(lx, ly, lz);

    const involved = involvedIn(step);
    if (involved.length > 0) {
      let fx = 0;
      let fy = 0;
      for (const id of involved) {
        const slot = agentSlot(id);
        const p = slot === 0 ? layout.ceo : layout.departments[slot - 1];
        fx += p.x / involved.length;
        fy += (p.y + (slot === 0 ? 2.4 : 1.4)) / involved.length;
      }
      if (involved.length === 1) {
        // Only the CEO Agent is on stage: it is speaking to the visitor. Step in, toward it.
        this.toPos.lerp(this.toLook, 0.05);
      }
      this.toLook.x += (fx - lx) * LEAN;
      this.toLook.y += (fy - ly) * LEAN * 0.5;
      this.toPos.x += (fx - lx) * LEAN * 0.6;
    }
    this.driftT = 0;
  }
}
