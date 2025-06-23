import assert from 'assert';
import * as THREE from 'three';
import { getCameraFrustum, sphereIntersectsFrustum } from '../src/utils/BoundingUtils.js';

const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
camera.position.set(0, 0, 5);
camera.lookAt(new THREE.Vector3(0, 0, 0));
camera.updateMatrixWorld();
camera.updateProjectionMatrix();

const frustum = getCameraFrustum(camera);
const inside = sphereIntersectsFrustum(frustum, new THREE.Vector3(0, 0, 0), 1);
const behind = sphereIntersectsFrustum(frustum, new THREE.Vector3(0, 0, 10), 1);

assert.strictEqual(inside, true);
assert.strictEqual(behind, false);
console.log('Frustum utils test passed.');
