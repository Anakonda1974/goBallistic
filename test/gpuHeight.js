import assert from 'assert';
import GPUHeightGenerator from '../src/GPUHeightGenerator.js';

const coords = [
  [0.1, 0.2, 0.3],
  [0.4, -0.2, -0.1],
  [0.8, 0.5, 0.9]
];

const g1 = new GPUHeightGenerator(null, 4, 1234);
g1.setParams({ warpIntensity: 0.3 });
const g2 = new GPUHeightGenerator(null, 4, 1234);
g2.setParams({ warpIntensity: 0.3 });

const h1 = coords.map(([x, y, z]) => g1.getHeight(x, y, z));
const h2 = coords.map(([x, y, z]) => g2.getHeight(x, y, z));

assert.deepStrictEqual(h1, h2);
console.log('GPU height generator deterministic test passed.');
