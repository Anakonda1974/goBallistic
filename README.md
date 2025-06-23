# Procedural Planet LOD

This project demonstrates a procedural planet generated with a quadtree level of detail system using [Three.js](https://threejs.org/).

## Setup

Requires **Node.js 16+**. After cloning the repository install dependencies and start the dev server:

```bash
npm install
npm start
```

The app will be available at `http://localhost:5173`.
You can also open `index.html` directly from the filesystem as the main script
now uses a relative path, but running the dev server is recommended for hot
reloading and module resolution.

To produce an optimized build run:

```bash
npm run build
```

## Usage


Use the sliders in the UI to adjust every octave of the FBM and Worley noise stacks that drive the terrain. Click **Rebuild** to regenerate planet chunks. A progress bar updates in real time while geometry is built in Web Workers. Status messages below the bar show the current subtask in the format `Rebuild -> face (50%)`.

When a WebGL2 renderer is available, you can set `useGPU` to `true` to enable compute shader based height generation. The shader now supports the domain warp intensity parameter so GPU and CPU paths yield similar terrain. The demo defaults to CPU generation so that all layers can be toggled.

Tests can be run with:


```bash
npm test
```

The demo also includes a basic day/night cycle with the main light orbiting the planet. Enable the debug overlay to view color-coded tectonic plates and inspect individual layer contributions.
Additional controls let you scale the entire planet and toggle on-screen rulers (grid and axes) for reference.


## Documentation

See [`PROJECT.md`](PROJECT.md) for an overview of the architecture and future plans. Modifier screenshots are located in [`docs/screenshots`](docs/screenshots). Details about the rocky layer are in [`docs/RockyLayer.md`](docs/RockyLayer.md). Information about the tectonic plate system can be found in [`docs/TectonicPlates.md`](docs/TectonicPlates.md). See [`docs/Exporting.md`](docs/Exporting.md) for details on exporting chunk geometry.

## Terrain Layers

The `LayerPipeline` combines several modifiers to create the final heightmap. Layers
are evaluated sequentially in a fixed hierarchy and clamped so the resulting heights remain within `[-1, 1]`
for realistic geometry. The main layers are:

1. **baseNoise** – domain‑warped fractal noise defining large-scale features.
2. **tectonics** – displaces terrain near plate boundaries to form trenches and ridges.
3. **elevation** – merges the previous layers and clamps the result to prevent
   extreme spikes or pits.
4. **rocky** – amplifies heights on steep slopes using the cliff controls.
5. **moisture/temperature** – additional noise used for biome selection.

Adjusting these layers in the UI or code allows experimentation while keeping
terrain generation stable.
You can also measure how much a single layer contributes to the final height
with `pipeline.getLayerInfluence(id, x, y, z)`. See
[`docs/LayerInfluence.md`](docs/LayerInfluence.md) for details.

### Customizing Tectonic Plates

`LayerPipeline` accepts an optional options object to configure plate parameters.

```js
import LayerPipeline from './src/LayerPipeline.js';

const pipeline = new LayerPipeline(42, {
  plateCount: 32,
  boundaryRadius: 0.1,
  effectRadius: 0.05
});
```

See [`docs/TectonicPlates.md`](docs/TectonicPlates.md) for details.
