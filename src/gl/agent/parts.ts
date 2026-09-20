import * as THREE from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { AgentId } from "@/content/departments";

/**
 * DATUM parts bin. Geometries and textures are built once per page and shared by every agent
 * in every canvas (three tracks GPU copies per renderer, so sharing CPU-side objects is safe).
 *
 * 1 unit = a department agent's body width.
 */

/* ------------------------------------------------------------------ dimensions */

export const DEPT = {
  w: 1.0,
  d: 0.44,
  r: 0.18,
  baseH: 0.9,
  seamH: 0.014,
  upperH: 1.6,
  glassW: 0.6,
  glassH: 1.48,
  glassR: 0.1,
  ringR: 0.85,
  /** Spot home in faceplate-local space */
  home: [0, 0.138] as const,
  travel: [0.23, 0.62] as const,
  markY: -0.66,
} as const;

export const CEO_DIM = {
  w: 1.2,
  d: 0.5,
  r: 0.2,
  h: 3.6,
  glassW: 0.76,
  glassH: 3.3,
  glassR: 0.12,
  ringR: 1.02,
  registerR: 1.45,
  home: [0, 1.08] as const,
  travel: [0.3, 1.5] as const,
  markY: -1.57,
} as const;

export const BEVEL = 0.03;

/* ------------------------------------------------------------------ shapes */

export function roundedRect(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

/** Upright block with soft machined edges. Base sits on y = 0, front faces +z. */
function blockGeometry(w: number, d: number, r: number, h: number): THREE.BufferGeometry {
  const geo = new THREE.ExtrudeGeometry(roundedRect(w, d, r), {
    depth: h - BEVEL * 2,
    bevelEnabled: true,
    bevelSize: BEVEL,
    bevelThickness: BEVEL,
    bevelOffset: -BEVEL,
    bevelSegments: 4,
    curveSegments: 28,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, BEVEL, 0);
  // Extrusions are flat-shaded; without creased normals the facets show up in the strip reflections.
  return toCreasedNormals(geo, 0.7);
}

function slabGeometry(w: number, d: number, r: number, h: number): THREE.BufferGeometry {
  const geo = new THREE.ExtrudeGeometry(roundedRect(w, d, r), { depth: h, bevelEnabled: false, curveSegments: 28 });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function frameGeometry(w: number, h: number, r: number, t = 0.017): THREE.BufferGeometry {
  const outer = roundedRect(w + t * 2, h + t * 2, r + t);
  outer.holes.push(new THREE.Path(roundedRect(w, h, r).getPoints(10)));
  return new THREE.ExtrudeGeometry(outer, { depth: 0.006, bevelEnabled: false, curveSegments: 14 });
}

/** Where ring angle `a` sits in the ring's own XZ plane. 0 = front (+z, toward the camera). */
export const ringPoint = (radius: number, a: number, y = 0) => new THREE.Vector3(-Math.sin(a) * radius, y, Math.cos(a) * radius);

/** Flat band lying in the XZ plane, centred on y = 0. Angles follow ringPoint(). */
export function bandGeometry(radius: number, radial = 0.022, axial = 0.05, a0 = 0, a1 = Math.PI * 2): THREE.BufferGeometry {
  const full = Math.abs(a1 - a0) >= Math.PI * 2 - 1e-4;
  const shape = new THREE.Shape();
  const ro = radius + radial / 2;
  const ri = radius - radial / 2;
  if (full) {
    shape.absarc(0, 0, ro, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, ri, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  } else {
    shape.absarc(0, 0, ro, a0, a1, false);
    shape.absarc(0, 0, ri, a1, a0, true);
    shape.closePath();
  }
  const bevel = 0.004;
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: axial - bevel * 2,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelOffset: -bevel,
    bevelSegments: 1,
    curveSegments: full ? 128 : 96,
  });
  geo.translate(0, 0, -(axial - bevel * 2) / 2);
  // Shape lives in XY with angle 0 on +x. Lay it flat, then turn it so angle 0 faces the camera (+z).
  // A point at shape angle a ends up at ringPoint(radius, a).
  geo.rotateX(Math.PI / 2);
  geo.rotateY(-Math.PI / 2);
  return toCreasedNormals(geo, 0.5);
}

/** Coned band, like a receiver dish. Customer Service only. */
function dishedBandGeometry(radius: number): THREE.BufferGeometry {
  const pts = [
    new THREE.Vector2(radius - 0.011, -0.025),
    new THREE.Vector2(radius + 0.011, -0.025),
    new THREE.Vector2(radius + 0.024, 0.025),
    new THREE.Vector2(radius + 0.002, 0.025),
    new THREE.Vector2(radius - 0.011, -0.025),
  ];
  return toCreasedNormals(new THREE.LatheGeometry(pts, 128), 0.5);
}

/* ------------------------------------------------------------------ caches */

interface Geometries {
  deptBase: THREE.BufferGeometry;
  deptUpper: THREE.BufferGeometry;
  deptSeam: THREE.BufferGeometry;
  deptGlass: THREE.BufferGeometry;
  deptFrame: THREE.BufferGeometry;
  deptCap: THREE.BufferGeometry;
  ceoBlock: THREE.BufferGeometry;
  ceoGlass: THREE.BufferGeometry;
  ceoFrame: THREE.BufferGeometry;
  ceoCap: THREE.BufferGeometry;
  tick: THREE.BufferGeometry;
  stud: THREE.BufferGeometry;
  rider: THREE.BufferGeometry;
  dock: THREE.BufferGeometry;
  plane: THREE.BufferGeometry;
}

let geometries: Geometries | null = null;

export function getGeometries(): Geometries {
  if (geometries) return geometries;
  geometries = {
    deptBase: blockGeometry(DEPT.w, DEPT.d, DEPT.r, DEPT.baseH),
    deptUpper: blockGeometry(DEPT.w, DEPT.d, DEPT.r, DEPT.upperH),
    deptSeam: slabGeometry(DEPT.w * 0.965, DEPT.d * 0.92, DEPT.r * 0.95, DEPT.seamH),
    deptGlass: new THREE.ShapeGeometry(roundedRect(DEPT.glassW, DEPT.glassH, DEPT.glassR), 14),
    deptFrame: frameGeometry(DEPT.glassW, DEPT.glassH, DEPT.glassR),
    deptCap: new THREE.ShapeGeometry(roundedRect(DEPT.w - 0.02, DEPT.d - 0.02, DEPT.r), 20).rotateX(-Math.PI / 2),
    ceoBlock: blockGeometry(CEO_DIM.w, CEO_DIM.d, CEO_DIM.r, CEO_DIM.h),
    ceoGlass: new THREE.ShapeGeometry(roundedRect(CEO_DIM.glassW, CEO_DIM.glassH, CEO_DIM.glassR), 14),
    ceoFrame: frameGeometry(CEO_DIM.glassW, CEO_DIM.glassH, CEO_DIM.glassR),
    ceoCap: new THREE.ShapeGeometry(roundedRect(CEO_DIM.w - 0.02, CEO_DIM.d - 0.02, CEO_DIM.r), 20).rotateX(-Math.PI / 2),
    tick: new THREE.BoxGeometry(0.014, 0.014, 0.052),
    stud: new THREE.BoxGeometry(0.02, 0.03, 0.02),
    rider: new THREE.BoxGeometry(0.06, 0.06, 0.03),
    dock: new THREE.CylinderGeometry(0.7, 0.7, 0.02, 72),
    plane: new THREE.PlaneGeometry(1, 1),
  };
  return geometries;
}

const ringCache = new Map<string, THREE.BufferGeometry[]>();

/** The ring is cut from one blank; each department gets a different cut. Returned bands share one material. */
export function getRingBands(variant: AgentId): THREE.BufferGeometry[] {
  const hit = ringCache.get(variant);
  if (hit) return hit;
  const R = DEPT.ringR;
  const deg = Math.PI / 180;
  let bands: THREE.BufferGeometry[];
  switch (variant) {
    case "marketing": // open arc, the gap faces away from the CEO
      bands = [bandGeometry(R, 0.022, 0.05, -150 * deg, 150 * deg)];
      break;
    case "finance": // twin parallel bands
      bands = [bandGeometry(R, 0.022, 0.02).translate(0, 0.025, 0), bandGeometry(R, 0.022, 0.02).translate(0, -0.025, 0)];
      break;
    case "operations": // four equal segments
      bands = [0, 1, 2, 3].map((i) => bandGeometry(R, 0.022, 0.05, i * 90 * deg + 3 * deg + 45 * deg, (i + 1) * 90 * deg - 3 * deg + 45 * deg));
      break;
    case "knowledge": // laminated stack, like an archive spine
      bands = [-1, 0, 1].map((i) => bandGeometry(R, 0.022, 0.036).translate(0, i * 0.046, 0));
      break;
    case "service":
      bands = [dishedBandGeometry(R)];
      break;
    case "ceo":
      bands = [bandGeometry(CEO_DIM.ringR, 0.024, 0.05)];
      break;
    default: // sales, administration: plain band, differentiated by rider / studs
      bands = [bandGeometry(R, 0.022, 0.05)];
  }
  ringCache.set(variant, bands);
  return bands;
}

let registerRing: THREE.BufferGeometry | null = null;
export const getRegisterRing = () => (registerRing ??= bandGeometry(CEO_DIM.registerR, 0.022, 0.04));

/* ------------------------------------------------------------------ textures */

let glowTexture: THREE.CanvasTexture | null = null;
let softTexture: THREE.CanvasTexture | null = null;
let noiseTexture: THREE.CanvasTexture | null = null;

/** Tight radial falloff: the light around the Spot, beads, ticks. */
export function getGlowTexture(): THREE.CanvasTexture {
  if (glowTexture) return glowTexture;
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.12, "rgba(255,255,255,0.55)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.14)");
  grad.addColorStop(0.7, "rgba(255,255,255,0.025)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  glowTexture = new THREE.CanvasTexture(c);
  glowTexture.colorSpace = THREE.SRGBColorSpace;
  return glowTexture;
}

/** Wide soft falloff: backlight card, underglow, contact shadow. */
export function getSoftTexture(): THREE.CanvasTexture {
  if (softTexture) return softTexture;
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.4, "rgba(255,255,255,0.42)");
  grad.addColorStop(0.75, "rgba(255,255,255,0.08)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  softTexture = new THREE.CanvasTexture(c);
  softTexture.colorSpace = THREE.SRGBColorSpace;
  return softTexture;
}

/** Bead-blast micro-roughness. Value noise in the green channel, which is where three reads roughness. */
export function getNoiseTexture(): THREE.CanvasTexture {
  if (noiseTexture) return noiseTexture;
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const img = g.createImageData(size, size);
  let seed = 1337;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < size * size; i++) {
    const v = Math.round((0.3 + rand() * 0.14) * 255);
    img.data[i * 4] = 255;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = 0;
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  noiseTexture = new THREE.CanvasTexture(c);
  noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;
  noiseTexture.repeat.set(5, 5);
  return noiseTexture;
}
