import * as THREE from 'three';
import NoiseGenerator from './NoiseGenerator.js';
import GeometryBuilder from './GeometryBuilder.js';
import FaceChunk from './FaceChunk.js';
import ChunkLODController from './ChunkLODController.js';
import createTerrainMaterial from './materials/TerrainShader.js';

export default class PlanetManager {
  constructor(scene, radius = 1) {
    this.scene = scene;
    this.noise = new NoiseGenerator(1234);
    this.builder = new GeometryBuilder(this.noise, radius);
    this.lod = new ChunkLODController();
    this.chunks = [];

    const faces = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
    for (const face of faces) {
      const chunk = new FaceChunk(face, this.builder, 32);
      chunk.createMesh(createTerrainMaterial());
      chunk.addToScene(scene);
      this.chunks.push(chunk);
    }

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x333333));
  }

  update(camera) {
    for (const chunk of this.chunks) {
      chunk.update(camera, this.lod);
    }
  }
}
