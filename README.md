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

Move the sliders in the UI to tweak noise parameters. Click **Rebuild** to regenerate planet chunks. A progress bar in the UI now updates in real time while geometry is built in Web Workers. Tests can be run with:

```bash
npm test
```

## Documentation

See [`PROJECT.md`](PROJECT.md) for an overview of the architecture and future plans. Modifier screenshots are located in [`docs/screenshots`](docs/screenshots).
