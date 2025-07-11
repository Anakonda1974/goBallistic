// NOTE: This wrapper remains for backward compatibility. New features should
// rely on HeightmapStack and its modifiers instead.
import FastNoiseLite from 'fastnoise-lite';

export default class NoiseGenerator {
  constructor(seed = 1337) {
    this.noise = new FastNoiseLite(seed);
    this.noise.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2);
  }

  getElevation(x, y, z) {
    return this.noise.GetNoise(x, y, z);
  }
}
