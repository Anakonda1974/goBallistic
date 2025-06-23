# Procedural Planet LOD

This project demonstrates a procedural planet generated with a quadtree level of detail system using [Three.js](https://threejs.org/).

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```
   Then open `http://localhost:5173` in your browser.

## Usage

Move the sliders in the UI to tweak noise parameters. Click **Rebuild** to regenerate planet chunks. A progress bar in the UI now updates in real time while geometry is built in Web Workers. Status messages below the bar show the current subtask in the format `Rebuild -> face (50%)`. Tests can be run with:

```bash
npm test
```

The demo also includes a basic day/night cycle with the main light orbiting the planet.

## Documentation

See [`PROJECT.md`](PROJECT.md) for an overview of the architecture and future plans. Modifier screenshots are located in [`docs/screenshots`](docs/screenshots). Details about the rocky layer are in [`docs/RockyLayer.md`](docs/RockyLayer.md).

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
