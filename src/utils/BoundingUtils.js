import * as THREE from 'three';

const _frustum = new THREE.Frustum();
const _matrix = new THREE.Matrix4();
const _sphere = new THREE.Sphere();

export function getCameraFrustum(camera) {
  _matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  _frustum.setFromProjectionMatrix(_matrix);
  return _frustum;
}

export function sphereIntersectsFrustum(frustum, position, radius) {
  _sphere.center.copy(position);
  _sphere.radius = radius;
  return frustum.intersectsSphere(_sphere);
}
