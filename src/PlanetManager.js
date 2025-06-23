import * as THREE from 'three';
import GeometryBuilder from './GeometryBuilder.js';
import FaceChunk from './FaceChunk.js';
import ChunkLODController from './ChunkLODController.js';
import createTerrainMaterial from './materials/TerrainShader.js';
import createWaterMaterial from './materials/WaterShader.js';
import LayerPipeline from './LayerPipeline.js';
import PlateDebugView from './PlateDebugView.js';
import { getCameraFrustum } from './utils/BoundingUtils.js';

export default class PlanetManager {
  constructor(scene, radius = 1, useGPU = true, useWorker = false) {
    this.scene = scene;
    this.useGPU = useGPU;
    this.useWorker = useWorker;

    const seed = 1234;
    this.seed = seed;
    if (this.useGPU) {
      this.heightStack = { getHeight() { return 0; } };
    } else {
      this.pipeline = new LayerPipeline(seed);
      this.heightStack = this.pipeline;
      this.debugView = new PlateDebugView(this.pipeline.plates, radius);
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
      const chunk = new FaceChunk(face, this.builder, 32, this.useWorker);
      chunk.createMesh(this.terrainMaterial);
      chunk.addToScene(scene);
      this.chunks.push(chunk);
    }

      this.water = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 0.99, 32, 32),
        createWaterMaterial({ envMap: scene.environment || null })
      );
      scene.add(this.water);
      if (this.debugView) {
        this.debugView.addToScene(scene);
        this.debugView.group.visible = false;
      }
      this.showDebug = false;

    this.light = new THREE.DirectionalLight(0xffffff, 1);
    this.light.position.set(5, 5, 5);
    scene.add(this.light);
    scene.add(new THREE.AmbientLight(0x333333));
    this.enableDayNight = false;
    this.lightAngle = 0;
  }

  setNoiseParams({ amplitude, frequency, octaves, warpIntensity }) {
    if (this.useGPU) {
      if (amplitude !== undefined) this.terrainMaterial.uniforms.uAmplitude.value = amplitude;
      if (frequency !== undefined) this.terrainMaterial.uniforms.uFrequency.value = frequency;
    } else if (this.pipeline) {
      this.pipeline.setBaseNoiseParams({ amplitude, frequency, octaves, warpIntensity });
    }
  }

  setCliffParams({ threshold, boost }) {
    if (this.pipeline) {
      this.pipeline.setCliffParams({ threshold, boost });
    }
  }

  setLayerEnabled(id, enabled) {
    if (this.pipeline) this.pipeline.setEnabled(id, enabled);
  }

  async rebuild(progressCallback, statusCallback) {
    const total = this.chunks.length;
    const progress = new Array(total).fill(0);

    const update = (idx, p) => {
      progress[idx] = p;
      if (progressCallback) {
        const sum = progress.reduce((a, b) => a + b, 0);
        progressCallback(sum / total);
      }
    };

    if (statusCallback) statusCallback({ task: 'Rebuild', subtask: 'starting', progress: 0 });

    for (let i = 0; i < total; i++) {
      const chunk = this.chunks[i];
      if (statusCallback) statusCallback({ task: 'Rebuild', subtask: `building ${chunk.face}`, progress: i / total });
      await chunk.rebuildAsync((p) => {
        update(i, p);
        if (statusCallback) statusCallback({ task: 'Rebuild', subtask: `building ${chunk.face}`, progress: (i + p) / total });
      });
      update(i, 1);
      if (statusCallback) statusCallback({ task: 'Rebuild', subtask: `completed ${chunk.face}`, progress: (i + 1) / total });
      await new Promise((r) => requestAnimationFrame(r));
    }

    if (statusCallback) statusCallback({ task: 'Rebuild', subtask: 'complete', progress: 1 });

  }

  setDebugVisible(visible) {
    this.showDebug = visible;
    if (this.debugView) {
      this.debugView.group.visible = visible;
    }
  }

  setDayNightCycleEnabled(enabled) {
    this.enableDayNight = enabled;
  }

  update(camera) {
    const frustum = getCameraFrustum(camera);
    if (this.enableDayNight && this.light) {
      this.lightAngle += 0.01;
      const r = 5;
      this.light.position.set(
        Math.cos(this.lightAngle) * r,
        Math.sin(this.lightAngle) * r,
        5
      );
      this.light.lookAt(0, 0, 0);
    }
    for (const chunk of this.chunks) {
      chunk.update(camera, this.lod, frustum);
    }
  }
}
