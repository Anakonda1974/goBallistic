import * as THREE from 'three';
import Plate from './Plate.js';

function mulberry32(a) {
  return function() {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomPointOnSphere(rand) {
  const u = rand() * 2 - 1;
  const theta = rand() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return new THREE.Vector3(s * Math.cos(theta), s * Math.sin(theta), u);
}

function randomTangent(center, rand) {
  const r = new THREE.Vector3(rand(), rand(), rand()).normalize();
  return r.sub(center.clone().multiplyScalar(center.dot(r))).normalize();
}

export default class PlateTectonics {
  constructor(seed = 1337, plateCount = 16, boundaryRadius = 0.1) {
    this.seed = seed;
    this.rand = mulberry32(seed);
    this.boundaryRadius = boundaryRadius;
    this.plates = [];
    for (let i = 0; i < plateCount; i++) {
      const center = randomPointOnSphere(this.rand);
      const vector = randomTangent(center, this.rand);
      this.plates.push(new Plate(i, center, vector));
    }
  }

  getNearest(point) {
    let first = null;
    let second = null;
    for (const p of this.plates) {
      const dist = point.distanceTo(p.center);
      if (!first || dist < first.dist) {
        second = first;
        first = { plate: p, dist };
      } else if (!second || dist < second.dist) {
        second = { plate: p, dist };
      }
    }
    return { first, second };
  }

  getBoundaryInfo(point, radius = this.boundaryRadius) {
    const n = point.clone().normalize();
    const { first, second } = this.getNearest(n);
    if (!first || !second) return null;
    const diff = second.dist - first.dist;
    if (diff > radius) return null;

    const a = first.plate;
    const b = second.plate;
    const relative = b.vector.clone().sub(a.vector);
    const normal = b.center.clone().sub(a.center).normalize();
    const dot = relative.dot(normal);
    let type;
    if (dot > 0.3) type = 'divergent';
    else if (dot < -0.3) type = 'convergent';
    else type = 'transform';
    return { type, distance: diff };
  }
}
