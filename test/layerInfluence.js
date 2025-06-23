import assert from 'assert';
import LayerPipeline from '../src/LayerPipeline.js';

const coords = [
  [0.1, 0.2, 0.3],
  [0.4, -0.1, 0.2],
  [0.7, 0.3, -0.2]
];

for (const [x, y, z] of coords) {
  const p1 = new LayerPipeline(1234);
  const p2 = new LayerPipeline(1234);
  const inf1 = p1.getLayerInfluence('tectonics', x, y, z);
  const inf2 = p2.getLayerInfluence('tectonics', x, y, z);
  assert.strictEqual(inf1, inf2);
}

console.log('Layer influence test passed.');
