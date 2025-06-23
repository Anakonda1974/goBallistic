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

function faceIndex(face) {
  switch (face) {
    case 'px': return 0;
    case 'nx': return 1;
    case 'py': return 2;
    case 'ny': return 3;
    case 'pz': return 4;
    case 'nz': return 5;
    default: return 0;
  }
}

export default class GeometryBuilder {
  constructor(heightStack, radius = 1) {
    this.heightStack = heightStack;
    this.radius = radius;
  }

  buildFaceGPU(face, resolution = 16) {
    if (!this.heightStack.generate) return this.buildFace(face, resolution);
    const data = this.heightStack.generate(faceIndex(face));
    const vertices = [];
    const indices = [];
    for (let y = 0; y <= resolution; y++) {
      for (let x = 0; x <= resolution; x++) {
        const u = (x / resolution) * 2 - 1;
        const v = (y / resolution) * 2 - 1;
        const cube = cubeFaceVector(face, u, v);
        const sphere = cubeToSphere(cube);
        const idx = (y * (resolution + 1) + x) * 4;
        const h = 1 + data[idx];
        vertices.push(
          sphere.x * this.radius * h,
          sphere.y * this.radius * h,
          sphere.z * this.radius * h
        );
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

  getVertexHeight(x, y, z) {
    return 1 + this.heightStack.getHeight(x, y, z);
  }

  buildFace(face, resolution = 16) {
    if (this.heightStack.generate) {
      return this.buildFaceGPU(face, resolution);
    }
    const vertices = [];
    const indices = [];
    for (let y = 0; y <= resolution; y++) {
      for (let x = 0; x <= resolution; x++) {
        const u = (x / resolution) * 2 - 1;
        const v = (y / resolution) * 2 - 1;
        const cube = cubeFaceVector(face, u, v);
        const sphere = cubeToSphere(cube);
        const height = this.getVertexHeight(sphere.x, sphere.y, sphere.z);
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

  async buildFaceAsync(face, resolution = 16, progressCallback) {
    if (this.heightStack.generate) {
      return this.buildFaceGPU(face, resolution);
    }
    const vertices = [];
    const indices = [];
    for (let y = 0; y <= resolution; y++) {
      for (let x = 0; x <= resolution; x++) {
        const u = (x / resolution) * 2 - 1;
        const v = (y / resolution) * 2 - 1;
        const cube = cubeFaceVector(face, u, v);
        const sphere = cubeToSphere(cube);
        const height = this.getVertexHeight(sphere.x, sphere.y, sphere.z);
        vertices.push(
          sphere.x * this.radius * height,
          sphere.y * this.radius * height,
          sphere.z * this.radius * height
        );
      }
      if (progressCallback) progressCallback(y / resolution);
      await new Promise((r) => setTimeout(r, 0));
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
