import assert from 'assert';
import * as THREE from 'three';
import PlateTectonics from '../src/PlateTectonics.js';

const p1 = new PlateTectonics(42, 6, 0.1);
const p2 = new PlateTectonics(42, 6, 0.1);

assert.deepStrictEqual(
  p1.plates.map(pl => pl.center.toArray()),
  p2.plates.map(pl => pl.center.toArray())
);
assert.deepStrictEqual(
  p1.plates.map(pl => pl.vector.toArray()),
  p2.plates.map(pl => pl.vector.toArray())
);

const testPoint = p1.plates[0].center.clone().multiplyScalar(0.9);
const info = p1.getBoundaryInfo(testPoint, 2);
if (info) {
  assert(['divergent', 'convergent', 'transform'].includes(info.type));
}

console.log('Plate tectonics deterministic test passed.');

