import * as THREE from "three";
import { getSharedMaterials } from "../agent/materials";
import { getGeometries, getSoftTexture } from "../agent/parts";

/**
 * The set for the scaling scene: a dark studio floor, the two docks that wait for specialists,
 * and the backlight that lifts a new agent off the void as it arrives.
 */

/**
 * Product-film floor: dark, slightly glossy, fading to nothing in every direction so the canvas
 * never shows an edge or a horizon against the page.
 */
export function createFloor(y: number): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial> {
  const material = new THREE.MeshStandardMaterial({
    color: "#0a0b0e",
    metalness: 0.9,
    roughness: 0.46,
    envMapIntensity: 0.45,
    // The soft texture is white with a radial alpha falloff: it shapes the floor into a pool.
    map: getSoftTexture(),
    transparent: true,
    depthWrite: false,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(36, 36), material);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = y;
  floor.renderOrder = -3;
  return floor;
}

/** An empty dock: the same disc an agent stands over, shown before anyone has arrived. */
export function createDockDisc(): THREE.Mesh {
  return new THREE.Mesh(getGeometries().dock, getSharedMaterials().dock);
}

/** Same card the rig carries, but owned by the scene so it can fade in instead of switching on. */
export function createBacklight(): THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial> {
  const card = new THREE.Mesh(
    getGeometries().plane,
    new THREE.MeshBasicMaterial({
      map: getSoftTexture(),
      color: "#9fb4d8",
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      opacity: 0,
      fog: false,
    }),
  );
  card.renderOrder = -1;
  return card;
}
