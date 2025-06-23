# Tectonic Plates

The project simulates a simple plate tectonics model to add large scale features like trenches and ridges.
`PlateTectonics` splits the sphere into a set of plates using a seeded random generator.
Each plate receives a random tangent motion vector which is used to classify
boundaries as **divergent**, **convergent**, or **transform**.

`PlateModifier` deforms the heightmap near these boundaries. Divergent margins
lower terrain to form ocean trenches, convergent margins raise terrain and add
occasional volcanic peaks, while transform boundaries apply a subtle displacement.

A `PlateDebugView` helper can visualize plate assignments by color.

**Parameters**
- `plateCount` – number of plates to generate (default `20`).
- `boundaryRadius` – distance used when searching for boundary information (default `0.1`).
- `effectRadius` – radius around boundaries that deform the heightmap (default `0.05`).

```js
import LayerPipeline from './src/LayerPipeline.js';

// create a pipeline with custom plate settings
const pipeline = new LayerPipeline(1234, {
  plateCount: 32,
  boundaryRadius: 0.1,
  effectRadius: 0.05
});
```

