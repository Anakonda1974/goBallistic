import * as THREE from 'three';
import { cubeToSphere } from './utils/MathUtils.js';

function cubeFaceVector(face, u, v) {
  switch (face) {
    case 'px': return new THREE.Vector3(1, v, -u);
    case 'nx': return new THREE.Vector3(-1, v, u);
    case 'py': return new THREE.Vector3(u, 1, -v);
    case 'ny': return new THREE.Vector3(u, -1, v);
    case 'pz': return new THREE.Vector3(u, v, 1);
    case 'nz': return new THREE.Vector3(-u, v, -1);
    default: return new THREE.Vector3(u, v, 1);
  }
}

export default class GeometryBuilder {
  constructor(noiseGen, radius = 1) {
    this.noiseGen = noiseGen;
    this.radius = radius;
  }

  buildFace(face, resolution = 16) {
    const vertices = [];
    const indices = [];
    for (let y = 0; y <= resolution; y++) {
      for (let x = 0; x <= resolution; x++) {
        const u = (x / resolution) * 2 - 1;
        const v = (y / resolution) * 2 - 1;
        const cube = cubeFaceVector(face, u, v);
        const sphere = cubeToSphere(cube);
        const height = 1 + 0.1 * this.noiseGen.getElevation(sphere.x, sphere.y, sphere.z);
        vertices.push(sphere.x * this.radius * height,
                      sphere.y * this.radius * height,
                      sphere.z * this.radius * height);
      }
    }
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const i = y * (resolution + 1) + x;
        const a = i;
        const b = i + 1;
        const c = i + resolution + 1;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }
}
