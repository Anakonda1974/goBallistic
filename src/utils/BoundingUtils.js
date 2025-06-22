import * as THREE from 'three';

export function intersectsFrustum(position, radius, camera) {
  const frustum = new THREE.Frustum();
  const matrix = new THREE.Matrix4();
  matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(matrix);
  return frustum.intersectsSphere(new THREE.Sphere(position, radius));
}
