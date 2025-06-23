import * as THREE from 'three';
import FastNoiseLite from 'fastnoise-lite';
import GeometryBuilder from './GeometryBuilder.js';
import FaceChunk from './FaceChunk.js';
import ChunkLODController from './ChunkLODController.js';
import createTerrainMaterial from './materials/TerrainShader.js';
import createWaterMaterial from './materials/WaterShader.js';
import HeightmapStack, { FBMModifier, DomainWarpModifier, TerraceModifier, CliffModifier } from './HeightmapStack.js';
import PlateTectonics from './PlateTectonics.js';
import PlateModifier from './PlateModifier.js';
import { getCameraFrustum } from './utils/BoundingUtils.js';

export default class PlanetManager {
  constructor(scene, radius = 1, useGPU = true) {
    this.scene = scene;
    this.useGPU = useGPU;

    const seed = 1234;
    this.seed = seed;
    let fnl;
    if (!this.useGPU) {
      fnl = new FastNoiseLite(seed);
      fnl.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2);
    }

    if (this.useGPU) {
      this.heightStack = { getHeight() { return 0; } };
    } else {
      this.heightStack = new HeightmapStack(seed);
      this.domainWarp = new DomainWarpModifier(fnl, 0.2);
      this.fbm = new FBMModifier(fnl, 1.0, 1.2, 5);
      this.terrace = new TerraceModifier(8, 0.8);
      this.cliff = new CliffModifier(0.25, 2.2);

      this.plates = new PlateTectonics(seed, 20, 0.1);
      this.plateModifier = new PlateModifier(this.plates, 0.05);

      this.modifiers = [this.domainWarp, this.fbm, this.terrace, this.plateModifier];
      for (const m of this.modifiers) this.heightStack.add(m);

      this.useDomainWarp = true;
      this.useTerrace = true;
      this.useCliff = false;
    }

    this.builder = new GeometryBuilder(this.heightStack, radius);
    this.lod = new ChunkLODController();
    this.chunks = [];
    this.terrainMaterial = createTerrainMaterial({
      seed,
      radius,
      amplitude: 0.3,
      frequency: 1.2,
    });

    const faces = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
    for (const face of faces) {
      const chunk = new FaceChunk(face, this.builder, 32);
      chunk.createMesh(this.terrainMaterial);
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

  setNoiseParams({
    amplitude,
    frequency,
    octaves,
    warpIntensity,
    terraceSteps,
    terraceRange,
  }) {
    if (this.useGPU) {
      if (amplitude !== undefined) this.terrainMaterial.uniforms.uAmplitude.value = amplitude;
      if (frequency !== undefined) this.terrainMaterial.uniforms.uFrequency.value = frequency;
    } else {
      if (amplitude !== undefined) this.fbm.amplitude = amplitude;
      if (frequency !== undefined) this.fbm.frequency = frequency;
      if (octaves !== undefined) this.fbm.octaves = octaves;
      if (warpIntensity !== undefined) this.domainWarp.intensity = warpIntensity;
      if (terraceSteps !== undefined) this.terrace.steps = terraceSteps;
      if (terraceRange !== undefined) this.terrace.heightRange = terraceRange;
    }
  }

  setModifierEnabled(name, enabled) {
    switch (name) {
      case 'domainWarp':
        this.useDomainWarp = enabled;
        this._toggleModifier(this.domainWarp, enabled);
        break;
      case 'terrace':
        this.useTerrace = enabled;
        this._toggleModifier(this.terrace, enabled);
        break;
      case 'cliff':
        this.useCliff = enabled;
        this._toggleModifier(this.cliff, enabled);
        break;
    }
  }

  _toggleModifier(mod, enabled) {
    if (this.useGPU) return;

    const hasMod = this.heightStack.modifiers.includes(mod);
    if (enabled && !hasMod) {
      this.heightStack.modifiers.push(mod);
    } else if (!enabled && hasMod) {
      this.heightStack.modifiers = this.heightStack.modifiers.filter(m => m !== mod);
    }
    // Re-order modifiers to maintain consistent stack
    const ordered = [];
    if (this.useDomainWarp) ordered.push(this.domainWarp);
    ordered.push(this.fbm);
    if (this.useTerrace) ordered.push(this.terrace);
    if (this.useCliff) ordered.push(this.cliff);
    ordered.push(this.plateModifier);
    this.heightStack.modifiers = ordered;
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
