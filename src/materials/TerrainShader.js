import * as THREE from 'three';

export default function createTerrainMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0x88aa55,
    flatShading: true,
  });
}
