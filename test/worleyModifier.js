import assert from 'assert';
import FastNoiseLite from 'fastnoise-lite';
import HeightmapStack, { WorleyModifier } from '../src/HeightmapStack.js';

function createStack(seed) {
  const fnl = new FastNoiseLite(seed);
  fnl.SetNoiseType(FastNoiseLite.NoiseType.Cellular);
  fnl.SetCellularReturnType(FastNoiseLite.CellularReturnType.CellValue);
  const stack = new HeightmapStack(seed);
  stack.add(new WorleyModifier(fnl, [1, 0.5, 0.25], [1, 2, 4]));
  return stack;
}

const coords = [
  [0.1, 0.2, 0.3],
  [0.4, -0.2, -0.1],
  [0.8, 0.5, 0.9]
];

const s1 = createStack(42);
const h1 = coords.map(c => s1.getHeight(...c));
const s2 = createStack(42);
const h2 = coords.map(c => s2.getHeight(...c));

assert.deepStrictEqual(h1, h2);
console.log('Worley modifier deterministic test passed.');

