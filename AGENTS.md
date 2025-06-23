# Project Tasks

This file lists outstanding tasks and opportunities for future improvements.


- [ ] Integrate GPU-based height map generation in `PlanetManager`.

- [ ] Expand project README with setup and usage instructions.
- [ ] Explore using Web Workers for asynchronous chunk generation.
- [ ] Implement seeded global Voronoi segmentation for tectonic plates.
- [ ] Assign each plate a random tangent motion vector.
- [ ] Classify boundaries as divergent, convergent, or transform.
- [ ] Modify the heightmap around boundaries to form trenches, ridges, and volcanoes.
- [ ] Introduce a `Plate` structure with center, vector, type, and vertex list.
- [ ] Add a debug view to visualize color-coded plates.


## Open Issues

The following items remain unfinished or have been identified as longer-term goals. Addressing them will push the project toward a more complete simulation.

 - [x] **GPU heightmap pipeline** – implemented compute shaders with a CPU fallback so GPU and CPU paths produce consistent results.
- [ ] **Biome integration** – generate temperature and humidity maps, then blend layers based on those values to produce varied biomes.
- [ ] **Atmospheric scattering** – add a shader-based atmosphere to enhance realism.
- [ ] **Advanced water simulation** – extend `WaterShader` with wave dynamics and reflections.
- [ ] **Export tools** – allow patch geometry to be exported as OBJ/GLTF using Three.js exporters.
- [ ] **Landing/zoom mode** – implement camera transitions for surface exploration and update LOD accordingly.
- [ ] **Mini-map/overview** – provide a separate debug view showing chunk boundaries from afar.

Each item should be tackled in isolation on feature branches, accompanied by targeted tests and documentation updates.

