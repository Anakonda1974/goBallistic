# Layer Influence

`LayerPipeline` exposes a helper for measuring how much a single layer affects the final height.

```js
import LayerPipeline from './src/LayerPipeline.js';

const pipeline = new LayerPipeline(1234);
const influence = pipeline.getLayerInfluence('tectonics', 0.1, 0.2, 0.3);
console.log(influence);
```

`getLayerInfluence(id, x, y, z)` temporarily disables the chosen layer, computes the terrain height, then re-enables it to measure the difference. Higher absolute values indicate that the layer strongly shapes the terrain at that point.
