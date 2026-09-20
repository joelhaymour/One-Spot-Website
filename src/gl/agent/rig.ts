import * as THREE from "three";
import type { AgentId, AgentMood } from "@/content/departments";
import { clamp, easeInOutCubic, easeOutCubic, segment } from "@/lib/math";
import { CEO_DIM, DEPT, getGeometries, getGlowTexture, getRegisterRing, getRingBands, getSoftTexture, ringPoint } from "./parts";
import {
  getSharedMaterials,
  makeBodyMaterial,
  makeDrawableRingMaterial,
  makeFrameMaterial,
  makeGlassMaterial,
  makeSeamMaterial,
  type GlassUniforms,
  type RingUniforms,
  type SeamUniforms,
} from "./materials";

/**
 * AgentRig — one DATUM agent. Pure three.js: no React, no allocation per frame.
 *
 * Motion is "slew, settle, hold": every moving value is a critically damped spring, so nothing
 * ever overshoots or bounces. Attention cascades through the object at different speeds
 * (Spot, then upper block, then ring, then base), which is what makes a gaze read as a decision.
 */

const DEG = Math.PI / 180;
const AMBER = new THREE.Color("#ffb347");
const WHITE = new THREE.Color("#f4f7ff");

class Spring {
  x: number;
  v = 0;
  constructor(x = 0) {
    this.x = x;
  }
  /** Critically damped step toward g. w = angular frequency in rad/s. */
  to(g: number, w: number, dt: number) {
    const a = this.x - g;
    const e = Math.exp(-w * dt);
    const b = this.v + w * a;
    this.x = g + (a + b * dt) * e;
    this.v = (this.v - w * b * dt) * e;
    return this.x;
  }
  snap(x: number) {
    this.x = x;
    this.v = 0;
  }
}

export interface AgentRigOptions {
  id: AgentId;
  accent: string;
  /** Show the dock disc and its underglow. Use where there is a floor. */
  dock?: boolean;
  backlight?: boolean;
  /** Build private clipped materials so the agent can run the arrival sequence. */
  spawnable?: boolean;
  /** Start hidden and wait for arrive(). */
  hidden?: boolean;
  /** CEO only: accent + bearing (radians, 0 = toward camera) of each register tick. */
  ticks?: { accent: string; angle: number }[];
  /** Phase offset so a room full of agents never moves in unison. */
  index?: number;
  /** Bearing (view-space x, -1..1) of the CEO Agent. Idle posture and reports lean this way. */
  ceoBearing?: number;
}

interface MoodTarget {
  core: number;
  halo: number;
  intensity: number;
  incline: number;
  seam: number;
  hover: number;
}

const MOODS: Record<AgentMood, MoodTarget> = {
  idle: { core: 0.035, halo: 0.11, intensity: 0.6, incline: 10, seam: 0.3, hover: 1 },
  observe: { core: 0.05, halo: 0.17, intensity: 1.0, incline: 18, seam: 0.45, hover: 0.8 },
  think: { core: 0.02, halo: 0.05, intensity: 1.3, incline: 0, seam: 0.4, hover: 0.3 },
  act: { core: 0.035, halo: 0.11, intensity: 0.9, incline: 14, seam: 0.6, hover: 0.6 },
  transmit: { core: 0.04, halo: 0.14, intensity: 1.0, incline: 6, seam: 0.5, hover: 0.6 },
  alert: { core: 0.04, halo: 0.16, intensity: 1.0, incline: 0, seam: 1.0, hover: 0.4 },
  arrive: { core: 0.035, halo: 0.11, intensity: 0.8, incline: 10, seam: 0.3, hover: 0.5 },
};

export class AgentRig {
  readonly group = new THREE.Group();
  readonly id: AgentId;
  readonly isCeo: boolean;
  /** World-space height of the ring plane / Spot, for aiming beads and cameras. */
  readonly ringY: number;
  readonly height: number;

  private hoverGroup = new THREE.Group();
  private base: THREE.Group | null = null;
  private upper = new THREE.Group();
  private ringYaw = new THREE.Group();
  private ringTilt = new THREE.Group();
  private ringSpin = new THREE.Group();
  private glassMesh: THREE.Mesh;
  private glow: THREE.Sprite;
  private underglow: THREE.Mesh | null = null;
  private tickMesh: THREE.Mesh;
  private tickMaterial: THREE.MeshBasicMaterial;
  private rider: THREE.Mesh | null = null;
  private registerTicks: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; glow: THREE.Sprite; color: THREE.Color; value: Spring; target: number }[] = [];
  private caps: THREE.Mesh[] = [];
  private capMaterial: THREE.MeshBasicMaterial | null = null;

  private glass: GlassUniforms;
  private seam: SeamUniforms | null = null;
  private ringDraw: RingUniforms | null = null;
  private clipTop: THREE.Plane | null = null;
  private clipBottom: THREE.Plane | null = null;

  private accent: THREE.Color;
  private mood: AgentMood = "idle";
  private gaze: { x: number; y: number } | null = null;
  private emphasis = new Spring(1);
  private emphasisTarget = 1;
  private load = new Spring(0);
  private loadTarget = 0;
  private marks = 0;

  private sx = new Spring(0);
  private sy = new Spring(0);
  private core = new Spring(0.035);
  private halo = new Spring(0.11);
  private intensity = new Spring(0.6);
  private yaw = new Spring(0);
  private baseYaw = new Spring(0);
  private incline = new Spring(10 * DEG);
  private inclineAz = new Spring(0);
  private seamLevel = new Spring(0.3);
  private pitch = new Spring(0);
  private alertMix = new Spring(0);
  private spin = 0;
  private stroke = 0; // decaying halo stroke, 0..1
  private beatT = -1; // seconds into a three-beat transmit, <0 = inactive
  private pingT = 0;

  private wander = { x: 0, y: 0, next: 0 };
  private arrival = { active: false, t: 0, delay: 0 };
  private present: boolean;
  private phase: number;
  private ceoBearing: number;
  private dims: typeof DEPT | typeof CEO_DIM;
  private tmpV = new THREE.Vector3();
  private tmpC = new THREE.Color();
  private speed: number;

  constructor(opts: AgentRigOptions) {
    this.id = opts.id;
    this.isCeo = opts.id === "ceo";
    this.dims = this.isCeo ? CEO_DIM : DEPT;
    this.accent = new THREE.Color(opts.accent);
    this.phase = (opts.index ?? 0) * 0.618 * Math.PI * 2;
    this.ceoBearing = opts.ceoBearing ?? 0;
    this.speed = this.isCeo ? 0.6 : 1;
    this.present = !opts.hidden;

    const geo = getGeometries();
    const sharedMat = getSharedMaterials();
    const spawnable = !!opts.spawnable;

    let planes: THREE.Plane[] | null = null;
    if (spawnable) {
      this.clipTop = new THREE.Plane(new THREE.Vector3(0, -1, 0), 99);
      this.clipBottom = new THREE.Plane(new THREE.Vector3(0, 1, 0), 99);
      planes = [this.clipTop, this.clipBottom];
    }
    const clipped = <T extends THREE.Material>(m: T): T => {
      if (planes) m.clippingPlanes = planes;
      return m;
    };
    const bodyMat = spawnable ? clipped(makeBodyMaterial()) : sharedMat.body;
    const frameMat = spawnable ? clipped(makeFrameMaterial()) : sharedMat.frame;

    this.group.add(this.hoverGroup);

    /* --- body ------------------------------------------------------------------------------ */
    let upperBaseY = 0;
    let upperH: number;
    if (this.isCeo) {
      upperH = CEO_DIM.h;
      const block = new THREE.Mesh(geo.ceoBlock, bodyMat);
      this.upper.add(block);
      this.height = CEO_DIM.h;
    } else {
      upperH = DEPT.upperH;
      upperBaseY = DEPT.baseH + DEPT.seamH;
      this.base = new THREE.Group();
      this.base.add(new THREE.Mesh(geo.deptBase, bodyMat));
      const seam = makeSeamMaterial(this.accent);
      clipped(seam.material);
      this.seam = seam.uniforms;
      const seamMesh = new THREE.Mesh(geo.deptSeam, seam.material);
      seamMesh.position.y = DEPT.baseH;
      this.base.add(seamMesh);
      this.hoverGroup.add(this.base);
      this.upper.add(new THREE.Mesh(geo.deptUpper, bodyMat));
      this.height = DEPT.baseH + DEPT.seamH + DEPT.upperH;
    }
    this.upper.position.y = upperBaseY;
    this.hoverGroup.add(this.upper);

    /* --- glass + Spot ---------------------------------------------------------------------- */
    const glassCentreY = upperH / 2;
    const glass = makeGlassMaterial(this.accent, [-0.121, this.dims.markY]);
    clipped(glass.material);
    this.glass = glass.uniforms;
    this.glassMesh = new THREE.Mesh(this.isCeo ? geo.ceoGlass : geo.deptGlass, glass.material);
    this.glassMesh.position.set(0, glassCentreY, this.dims.d / 2 + 0.0012);
    this.upper.add(this.glassMesh);

    const frame = new THREE.Mesh(this.isCeo ? geo.ceoFrame : geo.deptFrame, frameMat);
    frame.position.set(0, glassCentreY, this.dims.d / 2 - 0.0045);
    this.upper.add(frame);

    this.glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: getGlowTexture(),
        color: this.accent,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        transparent: true,
        toneMapped: false,
        opacity: 0.2,
      }),
    );
    this.glow.renderOrder = 10;
    this.upper.add(this.glow);

    this.ringY = upperBaseY + glassCentreY + this.dims.home[1];
    this.sx.snap(this.dims.home[0]);
    this.sy.snap(this.dims.home[1]);

    /* --- ring ------------------------------------------------------------------------------ */
    let ringMat: THREE.Material = sharedMat.ring;
    if (spawnable) {
      const drawable = makeDrawableRingMaterial();
      this.ringDraw = drawable.uniforms;
      ringMat = drawable.material;
    }
    for (const band of getRingBands(opts.id)) this.ringSpin.add(new THREE.Mesh(band, ringMat));

    this.tickMaterial = new THREE.MeshBasicMaterial({ color: this.accent.clone().multiplyScalar(0.4), toneMapped: false });
    this.tickMesh = new THREE.Mesh(geo.tick, this.tickMaterial);
    const ringR = this.isCeo ? CEO_DIM.ringR : DEPT.ringR;
    this.tickMesh.position.copy(ringPoint(ringR, 0, 0.026));
    this.ringSpin.add(this.tickMesh);

    if (opts.id === "sales") {
      this.rider = new THREE.Mesh(geo.rider, sharedMat.frame);
      this.ringSpin.add(this.rider);
      this.setRider(0.2);
    }
    if (opts.id === "administration") {
      const studs = new THREE.InstancedMesh(geo.stud, sharedMat.frame, 12);
      const m = new THREE.Matrix4();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
        m.makeRotationY(-a).setPosition(ringPoint(DEPT.ringR, a, 0.036));
        studs.setMatrixAt(i, m);
      }
      this.ringSpin.add(studs);
    }

    this.ringTilt.add(this.ringSpin);
    this.ringYaw.add(this.ringTilt);
    this.ringYaw.position.y = this.ringY;
    this.hoverGroup.add(this.ringYaw);

    /* --- CEO register ring: dead level, never moves, one tick per department ---------------- */
    if (this.isCeo) {
      const register = new THREE.Mesh(getRegisterRing(), sharedMat.ring);
      register.position.y = this.ringY - 0.32;
      this.hoverGroup.add(register);
      for (const t of opts.ticks ?? []) {
        const color = new THREE.Color(t.accent);
        const mat = new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(0.18), toneMapped: false });
        const mesh = new THREE.Mesh(geo.tick, mat);
        mesh.position.copy(ringPoint(CEO_DIM.registerR, t.angle, 0.022));
        mesh.rotation.y = -t.angle;
        mesh.scale.set(1.2, 1, 1.1);
        register.add(mesh);
        const glow = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: getGlowTexture(), color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false, opacity: 0 }),
        );
        glow.scale.setScalar(0.34);
        glow.position.copy(mesh.position);
        register.add(glow);
        this.registerTicks.push({ mesh, mat, glow, color, value: new Spring(0), target: 0 });
      }
    }

    /* --- stance ---------------------------------------------------------------------------- */
    if (opts.dock) {
      const dock = new THREE.Mesh(geo.dock, sharedMat.dock);
      dock.position.y = -0.13;
      this.group.add(dock);
      this.underglow = new THREE.Mesh(
        geo.plane,
        new THREE.MeshBasicMaterial({ map: getSoftTexture(), color: this.accent, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, opacity: 0.1 }),
      );
      this.underglow.rotation.x = -Math.PI / 2;
      this.underglow.scale.set(1.9, 1.3, 1);
      this.underglow.position.y = -0.115;
      this.group.add(this.underglow);
    }
    if (opts.backlight !== false) {
      const card = new THREE.Mesh(
        geo.plane,
        new THREE.MeshBasicMaterial({ map: getSoftTexture(), color: "#9fb4d8", blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, opacity: 0.085, fog: false }),
      );
      card.scale.set(this.isCeo ? 5.2 : 3.6, this.isCeo ? 6.4 : 4.6, 1);
      card.position.set(0, this.height * 0.55, -1.2);
      card.renderOrder = -1;
      this.group.add(card);
    }

    /* --- arrival caps: thin white machining fronts that ride the clip planes ----------------- */
    if (spawnable) {
      this.capMaterial = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0, toneMapped: false, depthWrite: false, side: THREE.DoubleSide });
      for (let i = 0; i < 2; i++) {
        const cap = new THREE.Mesh(this.isCeo ? geo.ceoCap : geo.deptCap, this.capMaterial);
        cap.visible = false;
        this.hoverGroup.add(cap);
        this.caps.push(cap);
      }
    }

    this.group.visible = this.present;
    this.wander.next = 1 + Math.random() * 2;
  }

  /* ------------------------------------------------------------------ control surface */

  setMood(mood: AgentMood) {
    if (mood === this.mood) return;
    this.mood = mood;
    this.wander.next = 0;
    if (mood === "transmit") this.beat();
  }

  /** Where to look, as a direction in view space (x right, y up, each -1..1). null = the mood decides. */
  setGaze(x: number | null, y = 0) {
    this.gaze = x === null ? null : { x: clamp(x, -1, 1), y: clamp(y, -1, 1) };
  }

  /** 0..1 workload. Fills the seam from the front centre outward. */
  setLoad(v: number) {
    this.loadTarget = clamp(v);
  }

  /** How loudly this agent speaks in colour. Unfocused agents in a group sit at 0.35. */
  setEmphasis(v: number) {
    this.emphasisTarget = clamp(v, 0, 1.2);
  }

  /** Light one more permanent record mark at the foot of the glass. */
  learn() {
    this.marks = Math.min(12, this.marks + 1);
    this.glass.uMarks.value = this.marks;
    this.pulse();
  }

  /** Set the record marks outright (scrolling back through a story un-learns). */
  setMarks(count: number) {
    this.marks = Math.max(0, Math.min(12, Math.round(count)));
    this.glass.uMarks.value = this.marks;
  }

  /** One short halo stroke: "that action is done". */
  pulse() {
    this.stroke = 1;
  }

  /** Three-beat transmit signature: 90 / 90 / 240 ms. */
  beat() {
    this.beatT = 0;
  }

  /** CEO: light a department's register tick (0..1). */
  setTick(index: number, value: number) {
    const t = this.registerTicks[index];
    if (t) t.target = value;
  }

  /** Sales: slide the rider round the ring with pipeline stage (0..1). */
  setRider(stage: number) {
    if (!this.rider) return;
    const a = (-120 + 240 * clamp(stage)) * DEG;
    this.rider.position.copy(ringPoint(DEPT.ringR, a, 0));
    this.rider.rotation.y = -a;
  }

  /** Spot, then ring, then the body extrudes out of the ring plane. Requires `spawnable`. */
  arrive(delay = 0) {
    if (!this.clipTop) {
      this.present = true;
      this.group.visible = true;
      return;
    }
    this.arrival = { active: true, t: 0, delay };
    this.present = true;
  }

  get arrived() {
    return this.present && !this.arrival.active;
  }

  /** World position of the ring tick: where beads leave from and land. */
  getTickWorld(target: THREE.Vector3) {
    return this.tickMesh.getWorldPosition(target);
  }

  getRegisterTickWorld(index: number, target: THREE.Vector3) {
    const t = this.registerTicks[index];
    return t ? t.mesh.getWorldPosition(target) : this.getTickWorld(target);
  }

  /** World position of the Spot, for cameras and hairlines. */
  getSpotWorld(target: THREE.Vector3) {
    return this.glassMesh.localToWorld(target.set(this.sx.x, this.sy.x, 0));
  }

  /* ------------------------------------------------------------------ per frame */

  update(t: number, dtRaw: number, camera: THREE.Camera) {
    if (!this.present) return;
    const dt = Math.min(dtRaw, 1 / 20);
    const k = this.speed;
    const m = MOODS[this.mood];
    const ph = this.phase;

    /* where is attention? ------------------------------------------------------------------ */
    let gx: number;
    let gy: number;
    if (this.gaze) {
      gx = this.gaze.x;
      gy = this.gaze.y;
    } else {
      this.wander.next -= dt;
      if (this.wander.next <= 0) this.pickWander();
      gx = this.wander.x;
      gy = this.wander.y;
    }

    const [tx, ty] = this.dims.travel;
    const [hx, hy] = this.dims.home;
    let targetX: number = hx;
    let targetY: number = hy;
    const attending = this.mood !== "think" && this.mood !== "alert";
    if (this.mood === "alert") {
      targetY = ty * 0.92;
    } else if (attending) {
      targetX = gx * tx * 0.92;
      targetY = gy >= 0 ? hy + gy * (ty * 0.92 - hy) : hy + gy * (ty * 0.92 + hy);
      // As the block catches up with the gaze, the Spot recentres part-way.
      targetX *= 1 - 0.35 * clamp(Math.abs(this.yaw.x) / (30 * DEG));
    }
    // keep inside the travel ellipse
    const e = Math.hypot(targetX / tx, targetY / ty);
    if (e > 1) {
      targetX /= e;
      targetY /= e;
    }

    const px = this.sx.x;
    const py = this.sy.x;
    const spotW = this.mood === "act" ? 30 : 18;
    this.sx.to(targetX, spotW * k, dt);
    this.sy.to(targetY, spotW * k, dt);
    const vx = (this.sx.x - px) / dt;
    const vy = (this.sy.x - py) / dt;
    const speed = Math.hypot(vx, vy);

    /* Spot look -------------------------------------------------------------------------------- */
    const breathe = this.mood === "idle" ? 1 + 0.06 * Math.sin(t * 0.12 * Math.PI * 2 + ph) : 1;
    this.core.to(m.core, 12, dt);
    this.halo.to(m.halo, 12, dt);
    this.intensity.to(m.intensity, 12, dt);
    this.emphasis.to(this.emphasisTarget, 6, dt);
    this.alertMix.to(this.mood === "alert" ? 1 : 0, 8, dt);

    // transmit three-beat, and the one-shot stroke
    let beatBoost = 0;
    if (this.beatT >= 0) {
      this.beatT += dt;
      const b = this.beatT;
      const pulse = (start: number, len: number) => (b >= start && b < start + len ? Math.sin(((b - start) / len) * Math.PI) : 0);
      beatBoost = Math.max(pulse(0, 0.09), pulse(0.15, 0.09), pulse(0.3, 0.24)) * 0.6;
      if (b > 0.6) this.beatT = this.mood === "transmit" && b > 1.9 ? 0 : b > 1.9 ? -1 : b;
    }
    this.stroke = Math.max(0, this.stroke - dt / 0.22);
    const strokeBoost = Math.sin(this.stroke * Math.PI) * 0.09;

    const emph = this.emphasis.x;
    const I = (this.intensity.x + beatBoost) * breathe * (0.55 + 0.45 * emph);
    const g = this.glass;
    g.uC.value.set(this.sx.x, this.sy.x);
    g.uCore.value = this.core.x;
    g.uHalo.value = this.halo.x + strokeBoost;
    g.uI.value = I;
    g.uStretch.value = Math.min(0.6, speed * 0.35);
    if (speed > 0.02) g.uDir.value.set(vx / speed, vy / speed);
    this.tmpC.copy(this.isCeo ? WHITE : this.accent).lerp(AMBER, this.alertMix.x);
    // Until the arrival sequence tints it, a new agent's light is pure white: the datum.
    if (this.arrival.active) this.tmpC.lerp(WHITE, 1 - segment(this.arrival.t, 1.6, 1.8));
    g.uAccent.value.copy(this.tmpC).multiplyScalar(0.35 + 0.65 * emph);

    // alert ping
    if (this.mood === "alert") {
      this.pingT = (this.pingT + dt / 1.6) % 1;
      g.uPingR.value = this.pingT * 0.18;
      g.uPingA.value = (1 - this.pingT) * 0.8;
    } else g.uPingA.value = 0;

    this.glassMesh.worldToLocal(this.tmpV.copy(camera.position));
    g.uEye.value.copy(this.tmpV);

    /* body -------------------------------------------------------------------------------------- */
    const rest = this.ceoBearing * 6 * DEG;
    const drift = (Math.sin((t / 11) * Math.PI * 2 + ph) + Math.sin((t / 17) * Math.PI * 2 + ph * 1.7)) * DEG * (this.isCeo ? 0.5 : 1);
    let yawTarget = rest + drift;
    if (attending && this.mood !== "idle") yawTarget = clamp(gx * (this.isCeo ? 10 : 40) * DEG * 0.7, -40 * DEG, 40 * DEG);
    else if (this.mood === "idle" && this.gaze) yawTarget = clamp(gx * (this.isCeo ? 10 : 28) * DEG * 0.7, -40 * DEG, 40 * DEG);
    if (this.mood === "transmit" && !this.isCeo) yawTarget = this.ceoBearing * 24 * DEG;
    this.yaw.to(yawTarget, 8 * k, dt);
    this.baseYaw.to(this.yaw.x * 0.2, 3.5 * k, dt);
    this.upper.rotation.y = this.yaw.x;
    if (this.base) this.base.rotation.y = this.baseYaw.x;

    this.pitch.to(this.mood === "act" ? 1.5 * DEG : 0, 6, dt);
    this.hoverGroup.rotation.x = this.pitch.x;
    this.hoverGroup.position.y = this.isCeo ? 0 : Math.sin(t * 0.17 * Math.PI * 2 + ph) * 0.015 * m.hover;

    /* ring -------------------------------------------------------------------------------------- */
    this.incline.to(m.incline * DEG, 5 * k, dt);
    const precess = (t / 90) * Math.PI * 2 + ph;
    const azTarget = attending && (this.gaze || this.mood !== "idle") ? gx * 60 * DEG : Math.sin(precess) * 25 * DEG;
    this.inclineAz.to(azTarget, 5 * k, dt);
    if (this.mood === "think") this.spin += 40 * DEG * dt;
    else this.spin += (Math.round(this.spin / (Math.PI * 2)) * Math.PI * 2 - this.spin) * Math.min(1, dt * 3);
    this.ringYaw.rotation.y = this.inclineAz.x;
    if (!this.arrival.active) this.ringTilt.rotation.x = this.incline.x;
    this.ringSpin.rotation.y = this.spin;
    const tickLevel = this.mood === "act" || this.mood === "transmit" ? 2.4 : this.mood === "idle" ? 0.35 : 1.2;
    this.tickMaterial.color.copy(this.tmpC).multiplyScalar(tickLevel * (0.4 + 0.6 * emph));

    /* seam --------------------------------------------------------------------------------------- */
    if (this.seam) {
      this.seamLevel.to(m.seam, 6, dt);
      this.load.to(this.loadTarget, 5, dt);
      this.seam.uSeam.value = this.seamLevel.x * (0.4 + 0.6 * emph) * (this.arrival.active ? segment(this.arrival.t, 1.6, 1.8) : 1);
      this.seam.uLoad.value = this.load.x;
      this.seam.uAccent.value.copy(this.tmpC);
    }

    /* glow sprite: sits at the apparent Spot position ---------------------------------------------- */
    const eye = g.uEye.value;
    const par = 0.035 / (Math.max(0.5, eye.z) + 0.035);
    this.glow.position.set(
      this.sx.x + (this.sx.x - eye.x) * -par,
      this.glassMesh.position.y + this.sy.x + (this.sy.x - eye.y) * -par,
      this.glassMesh.position.z + 0.012,
    );
    const facing = clamp(eye.z / Math.max(0.001, eye.length()), 0, 1);
    const gs = Math.max(2.6 * (this.halo.x + strokeBoost), 0.2);
    this.glow.scale.setScalar(gs);
    const glowMat = this.glow.material;
    glowMat.color.copy(this.tmpC);
    glowMat.opacity = (0.05 + 0.16 * I) * segment(facing, 0, 0.25) * (0.4 + 0.6 * emph);

    if (this.underglow) (this.underglow.material as THREE.MeshBasicMaterial).opacity = (0.05 + 0.07 * I) * emph;

    /* CEO register ticks ------------------------------------------------------------------------ */
    for (const r of this.registerTicks) {
      r.value.to(r.target, 14, dt);
      const v = r.value.x;
      r.mat.color.copy(r.color).multiplyScalar(0.18 + 2.3 * v);
      r.glow.material.opacity = v * 0.55;
    }

    if (this.arrival.active) this.stepArrival(dt);
  }

  private pickWander() {
    const w = this.wander;
    switch (this.mood) {
      case "observe": // reading the console below: slow sweeps
        w.x = (Math.random() * 2 - 1) * 0.75;
        w.y = -0.35 - Math.random() * 0.55;
        w.next = 0.9 + Math.random() * 1.1;
        break;
      case "act": // snapping between work items
        w.x = (Math.random() * 2 - 1) * 0.85;
        w.y = -0.25 - Math.random() * 0.7;
        w.next = 0.25 + Math.random() * 0.15;
        this.pulse();
        break;
      case "transmit": // toward the CEO
        w.x = this.ceoBearing * 0.6;
        w.y = this.isCeo ? -0.5 : 0.85;
        w.next = 2;
        break;
      default:
        if (this.isCeo) {
          // surveys the business beneath it, region by region
          w.x = (Math.random() * 2 - 1) * 0.8;
          w.y = -0.35 - Math.random() * 0.6;
          w.next = 2.2 + Math.random() * 0.9;
        } else {
          w.x = this.ceoBearing * 0.15 + (Math.random() * 2 - 1) * 0.22;
          w.y = (Math.random() * 2 - 1) * 0.12;
          w.next = 4 + Math.random() * 5;
        }
    }
  }

  private stepArrival(dt: number) {
    const a = this.arrival;
    if (a.delay > 0) {
      a.delay -= dt;
      this.group.visible = false;
      return;
    }
    this.group.visible = true;
    a.t += dt;
    const t = a.t;
    const draw = easeInOutCubic(segment(t, 0.25, 0.75));
    const tip = easeInOutCubic(segment(t, 0.75, 1.15));
    const extrude = easeOutCubic(segment(t, 1.0, 1.6));

    if (this.ringDraw) this.ringDraw.uDraw.value = draw;
    // The ring first faces the camera, so for half a second the logo hangs in the air. Then it tips to rest.
    this.ringTilt.rotation.x = THREE.MathUtils.lerp(Math.PI / 2, this.incline.x, tip);
    this.tickMesh.visible = t > 0.75;

    const s = this.group.getWorldScale(this.tmpV).y;
    const origin = this.group.getWorldPosition(this.tmpV).y + this.hoverGroup.position.y * s;
    const datum = this.ringY;
    const top = datum + (this.height + 0.05 - datum) * extrude;
    const bottom = datum - (datum + 0.05) * extrude;
    if (this.clipTop && this.clipBottom) {
      this.clipTop.constant = origin + top * s;
      this.clipBottom.constant = -(origin + bottom * s);
    }
    if (this.capMaterial) {
      const moving = extrude > 0 && extrude < 1;
      this.capMaterial.opacity = moving ? 0.85 * Math.sin(extrude * Math.PI) ** 0.5 : 0;
      this.caps[0].visible = this.caps[1].visible = moving;
      this.caps[0].position.y = top;
      this.caps[1].position.y = bottom;
      this.caps[0].rotation.y = this.caps[1].rotation.y = 0;
    }
    // Before the body exists the Spot is only the sprite, hanging alone in space.
    this.glow.material.opacity = Math.max(this.glow.material.opacity, 0.9 * segment(t, 0, 0.25) * (1 - extrude));
    if (extrude < 1) this.glow.scale.setScalar(THREE.MathUtils.lerp(0.55, this.glow.scale.x, extrude));

    if (t >= 1.85) {
      a.active = false;
      if (this.clipTop && this.clipBottom) {
        // Park, never null: changing the plane count would recompile every clipped material.
        this.clipTop.constant = 99;
        this.clipBottom.constant = 99;
      }
      if (this.ringDraw) this.ringDraw.uDraw.value = 1;
      this.tickMesh.visible = true;
      this.beat();
    }
  }

  dispose() {
    if (this.glassMesh.material instanceof THREE.Material) this.glassMesh.material.dispose();
    this.glow.material.dispose();
    this.tickMaterial.dispose();
    this.capMaterial?.dispose();
    for (const r of this.registerTicks) {
      r.mat.dispose();
      r.glow.material.dispose();
    }
  }
}
