import assert from 'assert';
import PlateTectonics from '../src/PlateTectonics.js';
import PlateModifier from '../src/PlateModifier.js';

const coords = [
  [0.1, 0.2, 0.3],
  [0.4, -0.2, -0.1],
  [0.8, 0.5, 0.9]
];

const t1 = new PlateTectonics(123, 8, 0.1);
const m1 = new PlateModifier(t1, 0.05);
const t2 = new PlateTectonics(123, 8, 0.1);
const m2 = new PlateModifier(t2, 0.05);

const h1 = coords.map(([x, y, z]) => m1.apply(x, y, z, 0));
const h2 = coords.map(([x, y, z]) => m2.apply(x, y, z, 0));

assert.deepStrictEqual(h1, h2);
console.log('Plate modifier deterministic test passed.');

