# Agent Tasks

The following items outline remaining or future tasks for the project.

## Heightmap System
- Document each modifier (FBM noise, domain warp, terracing, cliff) with screenshots demonstrating their effect.
- Implement a shader-compatible GLSL version of the modifier stack for GPU usage.
- Add additional modifiers such as biome weighting, plateaus, and more complex cliffs.
- Provide tests ensuring deterministic output for a given seed.

## Planet Features
- Integrate asynchronous chunk generation (use `requestIdleCallback` or Web Workers).
- Implement dynamic LOD transitions in `ChunkLODController` and `FaceChunk.update`.
- Expand shader modules to support water and other visual effects.
- Add optional biome maps with temperature and humidity control.

## Documentation
- Extend `PROJECT.md` or additional docs with screenshots and examples for each modifier.
- Keep `NoiseGenerator.js` marked as legacy; new work should rely on `HeightmapStack`.

