import assert from 'assert';
import LayerPipeline from '../src/LayerPipeline.js';

const coords = [
  [0.1, 0.2, 0.3],
  [0.4, 0.0, 0.2],
  [0.7, -0.3, 0.1]
];

const p1 = new LayerPipeline(1234);
p1.setCliffParams({ threshold: 0.3, boost: 2 });
p1.setEnabled('rocky', true);
const p2 = new LayerPipeline(1234);
p2.setCliffParams({ threshold: 0.3, boost: 2 });
p2.setEnabled('rocky', true);

for (const [x, y, z] of coords) {
  const h1 = p1.getHeight(x, y, z);
  const h2 = p2.getHeight(x, y, z);
  assert.strictEqual(h1, h2);
}

console.log('Rocky layer deterministic test passed.');
