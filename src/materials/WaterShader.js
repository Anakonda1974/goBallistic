import * as THREE from 'three';

export default function createWaterMaterial() {
  return new THREE.MeshPhongMaterial({
    color: 0x3366ff,
    transparent: true,
    opacity: 0.6,
  });
}
