import * as THREE from 'three';
import FastNoiseLite from 'fastnoise-lite';
import GeometryBuilder from './GeometryBuilder.js';
import FaceChunk from './FaceChunk.js';
import ChunkLODController from './ChunkLODController.js';
import createTerrainMaterial from './materials/TerrainShader.js';
import createWaterMaterial from './materials/WaterShader.js';
import HeightmapStack, { FBMModifier, DomainWarpModifier, TerraceModifier, CliffModifier } from './HeightmapStack.js';
import { getCameraFrustum } from './utils/BoundingUtils.js';

export default class PlanetManager {
  constructor(scene, radius = 1) {
    this.scene = scene;

    const seed = 1234;
    const fnl = new FastNoiseLite(seed);
    fnl.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2);

    this.heightStack = new HeightmapStack(seed);
    this.domainWarp = new DomainWarpModifier(fnl, 0.2);
    this.fbm = new FBMModifier(fnl, 1.0, 1.2, 5);
    this.heightStack.add(this.domainWarp);
    this.heightStack.add(this.fbm);
    this.heightStack.add(new TerraceModifier(8, 0.8));
    // this.heightStack.add(new CliffModifier(0.25, 2.2));

    this.builder = new GeometryBuilder(this.heightStack, radius);
    this.lod = new ChunkLODController();
    this.chunks = [];

    const faces = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
    for (const face of faces) {
      const chunk = new FaceChunk(face, this.builder, 32);
      chunk.createMesh(createTerrainMaterial());
      chunk.addToScene(scene);
      this.chunks.push(chunk);
    }

    this.water = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.99, 32, 32),
      createWaterMaterial()
    );
    scene.add(this.water);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x333333));
  }

  setNoiseParams({ amplitude, frequency, octaves, warpIntensity }) {
    if (amplitude !== undefined) this.fbm.amplitude = amplitude;
    if (frequency !== undefined) this.fbm.frequency = frequency;
    if (octaves !== undefined) this.fbm.octaves = octaves;
    if (warpIntensity !== undefined) this.domainWarp.intensity = warpIntensity;
  }

  async rebuild(progressCallback) {
    for (let i = 0; i < this.chunks.length; i++) {
      await this.chunks[i].rebuildAsync();
      if (progressCallback) progressCallback((i + 1) / this.chunks.length);
      await new Promise((r) => requestAnimationFrame(r));
    }
  }

  update(camera) {
    const frustum = getCameraFrustum(camera);
    for (const chunk of this.chunks) {
      chunk.update(camera, this.lod, frustum);
    }
  }
}
