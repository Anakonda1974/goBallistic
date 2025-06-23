import assert from 'assert';
import FastNoiseLite from 'fastnoise-lite';
import HeightmapStack, { FBMModifier, DomainWarpModifier, TerraceModifier, PlateauModifier } from '../src/HeightmapStack.js';

function createStack(seed) {
  const fnl = new FastNoiseLite(seed);
  fnl.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2);
  const stack = new HeightmapStack(seed);
  stack.add(new DomainWarpModifier(fnl, 0.2));
  stack.add(new FBMModifier(fnl, 1.0, 1.2, 5));
  stack.add(new TerraceModifier(8, 0.8));
  stack.add(new PlateauModifier(0.5, 0.2));
  return stack;
}

const coords = [
  [0.1, 0.2, 0.3],
  [0.4, -0.2, -0.1],
  [0.8, 0.5, 0.9]
];

const stack1 = createStack(1234);
const heights1 = coords.map(([x, y, z]) => stack1.getHeight(x, y, z));

const stack2 = createStack(1234);
const heights2 = coords.map(([x, y, z]) => stack2.getHeight(x, y, z));

assert.deepStrictEqual(heights1, heights2);
console.log('Deterministic heightmap test passed.');

// Run frustum utils test
import './frustumUtils.js';
import './plateTectonics.js';
import './rockyLayer.js';
import './gpuHeight.js';
import './plateModifier.js';
