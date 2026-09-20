import * as THREE from "three";
import { easeInOutCubic, easeOutCubic, segment } from "@/lib/math";
import { getGlowTexture } from "../agent/parts";

/**
 * Beads: the small lights that carry a message or a share of work between agents.
 * A fixed pool of additive sprites flown along quadratic curves. Nothing is allocated per frame.
 */

export interface BeadFlight {
  from: THREE.Vector3;
  to: THREE.Vector3;
  /** Curve control point: where the path leans on its way. */
  via: THREE.Vector3;
  /** seconds */
  duration: number;
  delay?: number;
  /** Halo colour. The core is always white. */
  color?: THREE.ColorRepresentation;
  /** "out" arrives gently (a landing); "inOut" slews away and settles (a send). */
  ease?: "out" | "inOut";
  onLand?: () => void;
}

interface Bead {
  core: THREE.Sprite;
  halo: THREE.Sprite;
  p0: THREE.Vector3;
  p1: THREE.Vector3;
  p2: THREE.Vector3;
  t: number;
  delay: number;
  duration: number;
  ease: "out" | "inOut";
  active: boolean;
  onLand?: () => void;
}

const CORE_SCALE = 0.3;
const HALO_SCALE = 0.72;

function makeSprite(scale: number) {
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: getGlowTexture(),
      color: "#ffffff",
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      fog: false,
      opacity: 0,
    }),
  );
  sprite.scale.setScalar(scale);
  sprite.visible = false;
  sprite.renderOrder = 12;
  return sprite;
}

export class BeadPool {
  readonly group = new THREE.Group();
  private beads: Bead[] = [];

  constructor(size = 8) {
    for (let i = 0; i < size; i++) {
      const core = makeSprite(CORE_SCALE);
      const halo = makeSprite(HALO_SCALE);
      this.group.add(halo, core);
      this.beads.push({
        core,
        halo,
        p0: new THREE.Vector3(),
        p1: new THREE.Vector3(),
        p2: new THREE.Vector3(),
        t: 0,
        delay: 0,
        duration: 1,
        ease: "inOut",
        active: false,
      });
    }
  }

  launch(flight: BeadFlight) {
    const bead = this.beads.find((b) => !b.active);
    if (!bead) return;
    bead.p0.copy(flight.from);
    bead.p1.copy(flight.via);
    bead.p2.copy(flight.to);
    bead.t = 0;
    bead.delay = flight.delay ?? 0;
    bead.duration = flight.duration;
    bead.ease = flight.ease ?? "inOut";
    bead.onLand = flight.onLand;
    bead.active = true;
    bead.halo.material.color.set(flight.color ?? "#ffffff");
  }

  /** Drop everything in flight without landing it. */
  clear() {
    for (const bead of this.beads) {
      bead.active = false;
      bead.onLand = undefined;
      bead.core.visible = bead.halo.visible = false;
    }
  }

  update(dt: number) {
    for (const bead of this.beads) {
      if (!bead.active) continue;
      if (bead.delay > 0) {
        bead.delay -= dt;
        continue;
      }
      bead.t = Math.min(1, bead.t + dt / bead.duration);
      const e = bead.ease === "out" ? easeOutCubic(bead.t) : easeInOutCubic(bead.t);
      const a = (1 - e) * (1 - e);
      const b = 2 * (1 - e) * e;
      const c = e * e;
      const { p0, p1, p2 } = bead;
      bead.core.position.set(a * p0.x + b * p1.x + c * p2.x, a * p0.y + b * p1.y + c * p2.y, a * p0.z + b * p1.z + c * p2.z);
      bead.halo.position.copy(bead.core.position);
      const fade = segment(bead.t, 0, 0.12) * (1 - segment(bead.t, 0.84, 1));
      bead.core.material.opacity = fade;
      bead.halo.material.opacity = fade * 0.4;
      bead.core.visible = bead.halo.visible = true;

      if (bead.t >= 1) {
        bead.active = false;
        bead.core.visible = bead.halo.visible = false;
        const land = bead.onLand;
        bead.onLand = undefined;
        land?.();
      }
    }
  }

  dispose() {
    for (const bead of this.beads) {
      bead.core.material.dispose();
      bead.halo.material.dispose();
    }
  }
}
