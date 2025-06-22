import * as THREE from 'three';

export function cubeToSphere(v) {
  const x2 = v.x * v.x;
  const y2 = v.y * v.y;
  const z2 = v.z * v.z;
  return new THREE.Vector3(
    v.x * Math.sqrt(1 - (y2 + z2) / 2 + (y2 * z2) / 3),
    v.y * Math.sqrt(1 - (z2 + x2) / 2 + (z2 * x2) / 3),
    v.z * Math.sqrt(1 - (x2 + y2) / 2 + (x2 * y2) / 3)
  );
}
