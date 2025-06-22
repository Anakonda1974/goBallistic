# ProceduralPlanetLOD

## Overview
ProceduralPlanetLOD aims to create a fully procedural planet that dynamically adjusts its level of detail (LOD) depending on the camera position. The planet is modeled using a cube-to-sphere technique where each cube face is subdivided into quadtree patches. Noise-based terrain generation ensures deterministic and varied landscapes.

## Goals
- **True cube-to-sphere geometry** for a seamless spherical surface
- **Quadtree-based LOD** that refines patches near the camera and merges those far away
- **Deterministic height generation** using seeded noise (FastNoiseLite or GPU noise)
- **Asynchronous chunk creation** so heavy geometry updates do not stall the main thread
- **Extensible design** for future integration of biomes, water, atmosphere, and other modules

## Technology Stack
| Area | Technology |
|---|---|
| 3D Rendering | [Three.js](https://threejs.org/) |
| Noise | [fastnoise-lite](https://github.com/Auburn/FastNoiseLite) (JavaScript port) |
| Language | JavaScript (ES6 modules) |
| Build tooling | Vite (optional) |

## Folder Structure
```
/public
  index.html       - Demo entry point
  main.js          - Initializes renderer, camera, controls, and PlanetManager
/src
  PlanetManager.js - Coordinates cube faces and LOD updates
  FaceChunk.js     - Represents a chunk on a cube face
  GeometryBuilder.js - Produces sphere-mapped geometry
  HeightmapStack.js  - Modular noise modifiers
  NoiseGenerator.js  - Seeded noise wrapper (legacy)
  ChunkLODController.js - Chooses LOD level based on camera distance
  materials/
    TerrainShader.js
    WaterShader.js (optional)
  utils/
    MathUtils.js   - cubeToSphere mapping helpers
    BoundingUtils.js - frustum culling helpers
```

## Core Concepts
### Cube-to-Sphere Mapping
- Each of the six cube faces hosts a quadtree.
- Patches map 2D positions to 3D cube coordinates and then to a sphere via `cubeToSphere`.
- Geometry resolution increases for higher LOD levels near the camera.

### LOD & Chunk Management
- **ChunkLODController** evaluates which patches should split or merge according to camera distance.
- **FaceChunk** manages the geometry for a specific quadtree patch and handles LOD transitions.

### Terrain Generation
- **HeightmapStack** combines modular modifiers (FBM noise, domain warp, terracing, etc.) using FastNoiseLite for deterministic results.
- Each modifier can be toggled or extended for biome control and GPU-based implementations.
- Screenshots illustrate the effect of each modifier:
  - `FBMModifier` ![fbm](docs/screenshots/fbm.png)
  - `DomainWarpModifier` ![domainwarp](docs/screenshots/domain-warp.png)
  - `TerraceModifier` ![terrace](docs/screenshots/terrace.png)
  - `CliffModifier` ![cliff](docs/screenshots/cliff.png)

### Shader Structure
- **TerrainShader** colors terrain based on height or biome data.
- **WaterShader** (optional) renders a water surface with transparency and simple waves.

## Implementation Plan
1. **Base Infrastructure**: Project setup with ES modules and Three.js rendering.
2. **Cube-Sphere Geometry**: Implement GeometryBuilder with cube-to-sphere mapping.
3. **Quadtree LOD**: Build FaceChunk and ChunkLODController to manage dynamic LOD.
4. **Noise Integration**: Use HeightmapStack with FastNoiseLite-based modifiers for deterministic terrain heights.
5. **Asynchronous Chunk Generation**: Offload heavy geometry builds using `requestIdleCallback` or Web Workers.
6. **Shaders and Materials**: Provide extensible shader modules for terrain and water.
7. **Optional Enhancements**: Support biomes, atmosphere scattering, water simulation, and export functionality.

## Development and Testing
- Start the demo with `npm start` and open `http://localhost:5173` in the browser.
- Run `npm test` to verify deterministic height generation.
- Keep code modular to make integration with bundlers like Vite or Webpack straightforward.

## Future Extensions
- Biome maps controlled by temperature and humidity.
- Atmospheric scattering and day/night cycle.
- Exporting patches as OBJ/GLTF models.
- Landing or zoom modes for detailed exploration.
- Mini-map or strategic overview with chunk debugging tools.
