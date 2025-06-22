import * as THREE from 'three';
import FastNoiseLite from 'fastnoise-lite';
import GeometryBuilder from './GeometryBuilder.js';
import FaceChunk from './FaceChunk.js';
import ChunkLODController from './ChunkLODController.js';
import createTerrainMaterial from './materials/TerrainShader.js';
import HeightmapStack, { FBMModifier, DomainWarpModifier, TerraceModifier, CliffModifier } from './HeightmapStack.js';

const requestIdle = typeof requestIdleCallback === 'function'
  ? requestIdleCallback
  : (fn) => setTimeout(() => fn({ timeRemaining: () => 0, didTimeout: true }), 0);

export default class PlanetManager {
  constructor(scene, radius = 1) {
    this.scene = scene;

    const seed = 1234;
    const fnl = new FastNoiseLite(seed);
    fnl.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2);

    this.heightStack = new HeightmapStack(seed);
    this.heightStack.add(new DomainWarpModifier(fnl, 0.2));
    this.heightStack.add(new FBMModifier(fnl, 1.0, 1.2, 5));
    this.heightStack.add(new TerraceModifier(8, 0.8));

    this.builder = new GeometryBuilder(this.heightStack, radius);
    this.lod = new ChunkLODController();
    this.chunks = [];

    this.initChunks();

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x333333));
  }

  initChunks() {
    const faces = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
    const buildNext = () => {
      const face = faces.shift();
      if (!face) return;
      const chunk = new FaceChunk(face, this.builder, 32);
      chunk.createMesh(createTerrainMaterial());
      chunk.addToScene(this.scene);
      this.chunks.push(chunk);
      if (faces.length > 0) {
        requestIdle(buildNext);
      }
    };
    requestIdle(buildNext);
  }

  update(camera) {
    for (const chunk of this.chunks) {
      chunk.update(camera, this.lod);
    }
  }
}
