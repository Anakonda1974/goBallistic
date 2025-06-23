import * as THREE from 'three';
import FastNoiseLite from 'fastnoise-lite';
import { Modifier } from './HeightmapStack.js';

export default class PlateModifier extends Modifier {
  constructor(plates, boundaryRadius = 0.05) {
    super();
    this.plates = plates;
    this.boundaryRadius = boundaryRadius;
    this.noise = new FastNoiseLite(plates.seed + 1);
    this.noise.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2);
  }

  apply(x, y, z, prevHeight) {
    const info = this.plates.getBoundaryInfo(new THREE.Vector3(x, y, z), this.boundaryRadius);
    if (!info) return prevHeight;
    const falloff = 1 - info.distance / this.boundaryRadius;
    switch (info.type) {
      case 'divergent':
        return prevHeight - falloff * 0.05;
      case 'convergent': {
        const volcanoFactor = Math.pow(falloff, 4);
        const volcanoNoise = this.noise.GetNoise(x * 10, y * 10, z * 10);
        return prevHeight + falloff * 0.05 + volcanoFactor * volcanoNoise * 0.1;
      }
      case 'transform':
        return prevHeight + falloff * 0.02;
      default:
        return prevHeight;
    }
  }
}
