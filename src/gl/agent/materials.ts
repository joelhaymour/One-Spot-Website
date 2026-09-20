import * as THREE from "three";
import { getNoiseTexture } from "./parts";

/**
 * Three material families across every agent: graphite body, polished/satin metal, smoked glass.
 * Shared instances are used wherever an agent does not need private state; glass and seam always
 * carry per-agent uniforms but compile to one shared program each.
 */

export interface SharedMaterials {
  body: THREE.MeshStandardMaterial;
  frame: THREE.MeshStandardMaterial;
  ring: THREE.MeshStandardMaterial;
  dock: THREE.MeshStandardMaterial;
}

let shared: SharedMaterials | null = null;

export function makeBodyMaterial() {
  return new THREE.MeshStandardMaterial({
    color: "#4a4f57",
    metalness: 1,
    roughness: 1,
    roughnessMap: getNoiseTexture(),
    envMapIntensity: 1.7,
    dithering: true,
  });
}

export function makeFrameMaterial() {
  return new THREE.MeshStandardMaterial({ color: "#b9bec6", metalness: 1, roughness: 0.14, envMapIntensity: 1.35 });
}

export function getSharedMaterials(): SharedMaterials {
  if (shared) return shared;
  shared = {
    body: makeBodyMaterial(),
    frame: makeFrameMaterial(),
    ring: new THREE.MeshStandardMaterial({ color: "#9299a3", metalness: 1, roughness: 0.25, envMapIntensity: 1.2 }),
    dock: new THREE.MeshStandardMaterial({ color: "#15171a", metalness: 1, roughness: 0.35 }),
  };
  return shared;
}

/* ------------------------------------------------------------------ ring that can draw itself on */

export interface RingUniforms {
  uDraw: { value: number };
}

export function makeDrawableRingMaterial(): { material: THREE.MeshStandardMaterial; uniforms: RingUniforms } {
  const uniforms: RingUniforms = { uDraw: { value: 1 } };
  const material = new THREE.MeshStandardMaterial({ color: "#9299a3", metalness: 1, roughness: 0.25, envMapIntensity: 1.2 });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uDraw = uniforms.uDraw;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vArc;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvArc = atan(-position.x, position.z) / 6.2831853 + 0.5;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vArc;\nuniform float uDraw;")
      .replace("#include <clipping_planes_fragment>", "#include <clipping_planes_fragment>\nif (vArc > uDraw) discard;");
  };
  material.customProgramCacheKey = () => "datum-ring-draw";
  return { material, uniforms };
}

/* ------------------------------------------------------------------ smoked glass + the Spot */

export interface GlassUniforms {
  uEye: { value: THREE.Vector3 };
  uC: { value: THREE.Vector2 };
  uDir: { value: THREE.Vector2 };
  uStretch: { value: number };
  uCore: { value: number };
  uHalo: { value: number };
  uI: { value: number };
  uAccent: { value: THREE.Color };
  uPingR: { value: number };
  uPingA: { value: number };
  uMarks: { value: number };
  uMark: { value: THREE.Vector2 };
}

const GLASS_PARS = /* glsl */ `
varying vec2 vP;
uniform vec3 uEye;
uniform vec2 uC;
uniform vec2 uDir;
uniform float uStretch;
uniform float uCore;
uniform float uHalo;
uniform float uI;
uniform vec3 uAccent;
uniform float uPingR;
uniform float uPingA;
uniform float uMarks;
uniform vec2 uMark;
`;

// The Spot sits 0.035 behind the glass, so it has real parallax as the block turns.
// Reflections are added after emission, so the glass sits physically over the light.
const GLASS_FRAG = /* glsl */ `
{
  vec3 vd = normalize(vec3(vP, 0.0) - uEye);
  vec2 q = vP + vd.xy * (0.035 / max(-vd.z, 0.25));
  vec2 dd = q - uC;
  dd = vec2(dot(dd, uDir), dot(dd, vec2(-uDir.y, uDir.x))) / vec2(1.0 + uStretch, 1.0);
  float r = length(dd);
  float core = 1.0 - smoothstep(uCore * 0.55, uCore, r);
  float halo = exp(-r * r / (uHalo * uHalo));
  float wide = exp(-r * r / (uHalo * uHalo * 9.0));
  float ping = (1.0 - smoothstep(0.0, 0.007, abs(r - uPingR))) * uPingA;
  vec2 m = vP - uMark;
  float ix = floor(m.x / 0.022 + 0.5);
  float mark = step(0.0, ix) * step(ix, uMarks - 0.5) * step(abs(m.x - ix * 0.022), 0.0022) * step(abs(m.y), 0.015);
  float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  totalEmissiveRadiance += vec3(1.0) * core * uI * 3.2
    + uAccent * (halo * uI * 0.9 + wide * uI * 0.05 + ping * 1.6 + mark * 0.55)
    + n / 255.0;
}
`;

export function makeGlassMaterial(accent: THREE.Color, mark: [number, number]): { material: THREE.MeshPhysicalMaterial; uniforms: GlassUniforms } {
  const uniforms: GlassUniforms = {
    uEye: { value: new THREE.Vector3(0, 0, 8) },
    uC: { value: new THREE.Vector2() },
    uDir: { value: new THREE.Vector2(1, 0) },
    uStretch: { value: 0 },
    uCore: { value: 0.035 },
    uHalo: { value: 0.11 },
    uI: { value: 0.6 },
    uAccent: { value: accent.clone() },
    uPingR: { value: 0 },
    uPingA: { value: 0 },
    uMarks: { value: 0 },
    uMark: { value: new THREE.Vector2(mark[0], mark[1]) },
  };
  const material = new THREE.MeshPhysicalMaterial({
    color: "#050607",
    metalness: 0,
    roughness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.25,
    dithering: true,
  });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vP;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvP = position.xy;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${GLASS_PARS}`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\n${GLASS_FRAG}`);
  };
  material.customProgramCacheKey = () => "datum-glass";
  return { material, uniforms };
}

/* ------------------------------------------------------------------ the lit seam (also a load gauge) */

export interface SeamUniforms {
  uAccent: { value: THREE.Color };
  uSeam: { value: number };
  uLoad: { value: number };
}

export function makeSeamMaterial(accent: THREE.Color): { material: THREE.MeshBasicMaterial; uniforms: SeamUniforms } {
  const uniforms: SeamUniforms = { uAccent: { value: accent.clone() }, uSeam: { value: 0.3 }, uLoad: { value: 0 } };
  const material = new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vSeamP;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvSeamP = position;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vSeamP;\nuniform vec3 uAccent;\nuniform float uSeam;\nuniform float uLoad;")
      .replace(
        "vec4 diffuseColor = vec4( diffuse, opacity );",
        /* glsl */ `
        float seamA = abs(atan(vSeamP.x, vSeamP.z)) / 3.14159265;
        float seamLit = (1.0 - smoothstep(uLoad - 0.012, uLoad + 0.012, seamA)) * step(0.002, uLoad);
        vec4 diffuseColor = vec4(uAccent * (0.32 * uSeam + 1.9 * seamLit), opacity);
        `,
      );
  };
  material.customProgramCacheKey = () => "datum-seam";
  return { material, uniforms };
}
