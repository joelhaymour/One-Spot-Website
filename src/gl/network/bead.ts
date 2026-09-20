import * as THREE from "three";
import { getGlowTexture } from "../agent/parts";

const TRAIL_POINTS = 32;

/**
 * A message in flight: a white core inside a halo in the colour of whoever's news it is,
 * with a hairline showing the way ahead. Additive sprites only, so it costs two quads and a line.
 */
export class Bead {
  readonly group = new THREE.Group();
  private core: THREE.Sprite;
  private halo: THREE.Sprite;
  private trail: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private positions = new Float32Array(TRAIL_POINTS * 3);
  private size: number;

  constructor(size = 1) {
    this.size = size;
    const sprite = (color: string) =>
      new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: getGlowTexture(),
          color,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true,
          toneMapped: false,
          fog: false,
          opacity: 0,
        }),
      );
    this.halo = sprite("#ffffff");
    this.core = sprite("#ffffff");
    this.halo.renderOrder = 11;
    this.core.renderOrder = 12;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    this.trail = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0, depthWrite: false, toneMapped: false, fog: false }),
    );
    // The line is rewritten every frame it shows; a stale bounding sphere must never cull it.
    this.trail.frustumCulled = false;
    this.trail.visible = false;

    this.group.add(this.trail, this.halo, this.core);
    this.group.visible = false;
  }

  setAccent(hex: string) {
    this.halo.material.color.set(hex);
  }

  show(p: THREE.Vector3, alpha: number, grow = 1) {
    this.group.visible = true;
    this.core.position.copy(p);
    this.halo.position.copy(p);
    this.core.scale.setScalar(0.3 * this.size * grow);
    this.halo.scale.setScalar(0.95 * this.size * grow);
    this.core.material.opacity = alpha;
    this.halo.material.opacity = 0.6 * alpha;
  }

  /** The part of a quadratic arc still ahead of the bead (u = how far along it is). */
  drawTrail(p0: THREE.Vector3, c: THREE.Vector3, p2: THREE.Vector3, u: number) {
    const first = Math.min(TRAIL_POINTS - 2, Math.floor(u * (TRAIL_POINTS - 1)));
    for (let i = first; i < TRAIL_POINTS; i++) {
      const t = i / (TRAIL_POINTS - 1);
      const a = (1 - t) * (1 - t);
      const b = 2 * (1 - t) * t;
      const d = t * t;
      this.positions[i * 3] = a * p0.x + b * c.x + d * p2.x;
      this.positions[i * 3 + 1] = a * p0.y + b * c.y + d * p2.y;
      this.positions[i * 3 + 2] = a * p0.z + b * c.z + d * p2.z;
    }
    this.trail.geometry.attributes.position.needsUpdate = true;
    this.trail.geometry.setDrawRange(first, TRAIL_POINTS - first);
    this.trail.material.opacity = 0.1 * Math.min(1, u / 0.1) * Math.min(1, (1 - u) / 0.2);
    this.trail.visible = true;
  }

  hideTrail() {
    this.trail.visible = false;
  }

  hide() {
    this.group.visible = false;
    this.trail.visible = false;
  }

  dispose() {
    this.core.material.dispose();
    this.halo.material.dispose();
    this.trail.geometry.dispose();
    this.trail.material.dispose();
  }
}
