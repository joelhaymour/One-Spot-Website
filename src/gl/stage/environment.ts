import * as THREE from "three";

/**
 * The studio. Five softboxes in a black room, baked once per renderer into a PMREM.
 * No HDR download: the long vertical strips are what draw a dark object against a dark background.
 */

interface Lightformer {
  color: string;
  intensity: number;
  position: [number, number, number];
  scale: [number, number];
  target?: [number, number, number];
  faceDown?: boolean;
}

const RIG: Lightformer[] = [
  // top softbox: the long highlight on the crown and the ring
  { color: "#ffffff", intensity: 9, position: [0, 7, 1], scale: [8, 2.4], faceDown: true },
  // rear strips: the rim light that separates graphite from void
  { color: "#cfe0ff", intensity: 26, position: [-5, 2, -2.2], scale: [0.7, 8], target: [0, 1.5, 0] },
  { color: "#cfe0ff", intensity: 15, position: [5, 2, -2], scale: [0.5, 7], target: [0, 1.5, 0] },
  // side fills: a soft gradient across the flanks
  { color: "#dfe8ff", intensity: 2.2, position: [-7, 2, 3], scale: [3, 7], target: [0, 1.5, 0] },
  { color: "#dfe8ff", intensity: 1.1, position: [7, 2, 3], scale: [3, 7], target: [0, 1.5, 0] },
  // front strips: the long vertical reflections in the glass
  { color: "#ffffff", intensity: 5, position: [-2.6, 2.5, 6], scale: [0.22, 6], target: [0, 1.5, 0] },
  { color: "#ffffff", intensity: 2.4, position: [3.2, 2.2, 6], scale: [0.14, 5], target: [0, 1.5, 0] },
  // front fills, behind the camera: a flat face mirrors what is behind the viewer, so without these
  // the front of the body is a black hole. Offset left and high so the sheen falls off across the face.
  { color: "#eef3ff", intensity: 0.85, position: [-5, 5, 11], scale: [9, 7], target: [0, 1.5, 0] },
  { color: "#eef3ff", intensity: 0.3, position: [6, 1, 11], scale: [6, 6], target: [0, 1.5, 0] },
  { color: "#ffffff", intensity: 0.9, position: [0, 6.5, 7], scale: [9, 2.5], target: [0, 1.5, 0] },
  { color: "#ffe9d6", intensity: 1.4, position: [3, -1.5, 3], scale: [3, 0.3], target: [0, 1, 0] },
];

const cache = new WeakMap<THREE.WebGLRenderer, THREE.Texture>();

export function getEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const hit = cache.get(renderer);
  if (hit) return hit;

  const room = new THREE.Scene();
  room.background = new THREE.Color("#020203");
  const plane = new THREE.PlaneGeometry(1, 1);
  const materials: THREE.Material[] = [];
  for (const l of RIG) {
    const c = new THREE.Color(l.color).multiplyScalar(l.intensity);
    const mat = new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide, toneMapped: false });
    materials.push(mat);
    const mesh = new THREE.Mesh(plane, mat);
    mesh.position.set(...l.position);
    mesh.scale.set(l.scale[0], l.scale[1], 1);
    if (l.faceDown) mesh.rotation.x = Math.PI / 2;
    else if (l.target) mesh.lookAt(...l.target);
    room.add(mesh);
  }

  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(room, 0.03).texture;
  pmrem.dispose();
  plane.dispose();
  materials.forEach((m) => m.dispose());

  cache.set(renderer, texture);
  return texture;
}
