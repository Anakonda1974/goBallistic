import FastNoiseLite from 'fastnoise-lite';
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
  constructor(seed = 0) {
    this.seed = seed;
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

    // tectonics
    this.plates = new PlateTectonics(seed, 20, 0.1);
    this.plateModifier = new PlateModifier(this.plates, 0.05);

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
    return ctx.elevation ?? 0;
  }
}
