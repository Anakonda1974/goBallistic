import FastNoiseLite from 'fastnoise-lite';
import * as THREE from 'three';
import HeightmapStack, { FBMModifier, DomainWarpModifier } from './HeightmapStack.js';
import PlateTectonics from './PlateTectonics.js';
import PlateModifier from './PlateModifier.js';

export class Layer {
  constructor(id, fn, enabled = true) {
    this.id = id;
    this.fn = fn;
    this.enabled = enabled;
  }
}

export default class LayerPipeline {
  constructor(seed = 0, options = {}) {
    this.seed = seed;
    const {
      plateCount = 20,
      boundaryRadius = 0.1,
      effectRadius = 0.05
    } = options;
    this.layers = [];
    this.enabled = new Map();

    const fnl = new FastNoiseLite(seed);
    fnl.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2);

    // base noise stack
    this.baseStack = new HeightmapStack(seed);
    this.domainWarp = new DomainWarpModifier(fnl, 0.2);
    this.fbm = new FBMModifier(fnl, 1.0, 1.2, 5);
    this.baseStack.add(this.domainWarp);
    this.baseStack.add(this.fbm);

    this.cliffParams = { threshold: 0.3, boost: 2.0 };

    // tectonics
    this.plates = new PlateTectonics(seed, plateCount, boundaryRadius);
    this.plateModifier = new PlateModifier(this.plates, effectRadius);

    this.addLayer('baseNoise', (x, y, z, ctx) => this.baseStack.getHeight(x, y, z));
    this.addLayer('tectonics', (x, y, z, ctx) => this.plateModifier.apply(x, y, z, ctx.baseNoise || 0));
    this.addLayer('elevation', (x, y, z, ctx) => {
      const base = ctx.baseNoise || 0;
      const tect = ctx.tectonics || 0;
      // Blend the layers and clamp to keep terrain heights realistic
      const h = base + tect;
      return Math.max(-1, Math.min(1, h));
    });
    this.addLayer('moisture', (x, y, z) => fnl.GetNoise(x * 0.5, y * 0.5, z * 0.5));
    this.addLayer('temperature', (x, y, z, ctx) => {
      const lat = Math.abs(y);
      const base = 1 - lat;
      const height = Math.max(0, 1 + (ctx.elevation || 0));
      return base - height * 0.5;
    });
    this.addLayer('biome', (x, y, z, ctx) => {
      const t = ctx.temperature ?? 0;
      const m = ctx.moisture ?? 0;
      if (t > 0.5) return m > 0 ? 2 : 1; // 2=tropical,1=desert
      if (t > 0) return m > 0.2 ? 3 : 1; // 3=temperate
      return 0; // polar
    });
    this.addLayer('vegetation', (x, y, z, ctx) => (ctx.moisture ?? 0) * 0.5 + 0.5);
    this.addLayer('cloudDensity', (x, y, z, ctx) => (ctx.moisture ?? 0) * (1 - Math.abs(ctx.temperature ?? 0)));
    this.addLayer('cloudFlow', (x, y, z) => ({ x: fnl.GetNoise(x, 0, 0), y: 0, z: fnl.GetNoise(0, 0, z) }));
    this.addLayer('rocky', (x, y, z, ctx) => {
      const h = ctx.elevation ?? 0;
      const slope = this.computeSlope(x, y, z);
      if (slope > this.cliffParams.threshold) {
        const boosted = h * this.cliffParams.boost;
        return Math.max(-1, Math.min(1, boosted));
      }
      return h;
    });
  }

  computeSlope(x, y, z, eps = 0.002) {


    const info = this.plates.getBoundaryInfo(
      new THREE.Vector3(x, y, z),
      this.plateModifier.boundaryRadius
    );


    const sample = (sx, sy, sz) =>
      this.plateModifier.applyWithInfo(
        info,
        sx,
        sy,
        sz,
        this.baseStack.getHeight(sx, sy, sz)
      );

    const hx1 = sample(x + eps, y, z);
    const hx2 = sample(x - eps, y, z);
    const hy1 = sample(x, y + eps, z);
    const hy2 = sample(x, y - eps, z);
    const hz1 = sample(x, y, z + eps);
    const hz2 = sample(x, y, z - eps);

    const dx = (hx1 - hx2) / (2 * eps);
    const dy = (hy1 - hy2) / (2 * eps);
    const dz = (hz1 - hz2) / (2 * eps);

    return Math.sqrt(dx * dx + dy * dy + dz * dz);

  }

  computeElevation(x, y, z) {
    const base = this.baseStack.getHeight(x, y, z);
    const tect = this.plateModifier.apply(x, y, z, base);
    return Math.max(-1, Math.min(1, tect));

  }

  addLayer(id, fn, enabled = true) {
    this.layers.push(new Layer(id, fn, enabled));
    this.enabled.set(id, enabled);
  }

  setEnabled(id, enabled) {
    this.enabled.set(id, enabled);
  }

  setBaseNoiseParams({ amplitude, frequency, octaves, warpIntensity }) {
    if (amplitude !== undefined) this.fbm.amplitude = amplitude;
    if (frequency !== undefined) this.fbm.frequency = frequency;
    if (octaves !== undefined) this.fbm.octaves = octaves;
    if (warpIntensity !== undefined) this.domainWarp.intensity = warpIntensity;
  }

  setCliffParams({ threshold, boost }) {
    if (threshold !== undefined) this.cliffParams.threshold = threshold;
    if (boost !== undefined) this.cliffParams.boost = boost;
  }

  compute(x, y, z) {
    const context = {};
    for (const layer of this.layers) {
      if (this.enabled.get(layer.id)) {
        context[layer.id] = layer.fn(x, y, z, context);
      }
    }
    return context;
  }

  getHeight(x, y, z) {
    const ctx = this.compute(x, y, z);
    return ctx.rocky ?? ctx.elevation ?? 0;
  }
}
