import * as THREE from 'three';
import GeometryBuilder from './GeometryBuilder.js';
import FaceChunk from './FaceChunk.js';
import ChunkLODController from './ChunkLODController.js';
import createTerrainMaterial from './materials/TerrainShader.js';
import createWaterMaterial from './materials/WaterShader.js';
import LayerPipeline from './LayerPipeline.js';
import PlateDebugView from './PlateDebugView.js';
import LayerDebugView from './LayerDebugView.js';
import GPUHeightGenerator from './GPUHeightGenerator.js';
import { getCameraFrustum } from './utils/BoundingUtils.js';

export default class PlanetManager {
  constructor(scene, radius = 1, useGPU = true, useWorker = false, renderer = null) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scale = 1;
    scene.add(this.group);
    this.useGPU = useGPU;
    this.useWorker = useWorker;
    this.renderer = renderer;

    const seed = 1234;
    this.seed = seed;
    if (this.useGPU) {
      if (this.renderer) {

        this.gpuHeight = new GPUHeightGenerator(this.renderer, 33, seed);

        this.heightStack = this.gpuHeight;
      } else {
        this.heightStack = { getHeight() { return 0; } };
      }
    } else {
      this.pipeline = new LayerPipeline(seed);
      this.heightStack = this.pipeline;
      this.debugView = new PlateDebugView(this.pipeline.plates, radius);
      this.layerView = new LayerDebugView(this.pipeline, 'baseNoise', radius);
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
      chunk.addToScene(this.group);
      this.chunks.push(chunk);
    }

    this.water = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 0.99, 32, 32),
        createWaterMaterial({ envMap: scene.environment || null })
      );
      this.group.add(this.water);
      if (this.debugView) {
        this.debugView.addToScene(this.group);
        this.debugView.group.visible = false;
      }
      if (this.layerView) {
        this.layerView.addToScene(this.group);
        this.layerView.group.visible = false;
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
      if (this.gpuHeight) {
        this.gpuHeight.setParams({ amplitude, frequency, octaves, warpIntensity });
      }
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

    const reportTotal = () => {
      const sum = progress.reduce((a, b) => a + b, 0);
      const value = sum / total;
      if (progressCallback) progressCallback(value);
      return value;
    };

    if (statusCallback)
      statusCallback({ task: 'Rebuild', subtask: 'starting', progress: 0 });


    const startChunk = async (chunk, i) => {
      if (statusCallback)
        statusCallback({ task: 'Rebuild', subtask: `building ${chunk.face}`, progress: reportTotal() });

      await chunk.rebuildAsync((p) => {
        progress[i] = p;
        if (statusCallback)
          statusCallback({ task: 'Rebuild', subtask: `building ${chunk.face}`, progress: reportTotal() });
      });

      progress[i] = 1;
      if (statusCallback)
        statusCallback({ task: 'Rebuild', subtask: `completed ${chunk.face}`, progress: reportTotal() });
    };

    await Promise.all(this.chunks.map((c, i) => startChunk(c, i)));


    if (statusCallback)
      statusCallback({ task: 'Rebuild', subtask: 'complete', progress: 1 });

    this.updateLayerDebug();
  }

  setDebugVisible(visible) {
    this.showDebug = visible;
    if (this.debugView) {
      this.debugView.group.visible = visible;
    }
    if (this.layerView) {
      this.layerView.group.visible = visible;
    }
  }

  setDebugLayer(id) {
    if (this.layerView) {
      this.layerView.setLayer(id);
    }
  }

  updateLayerDebug() {
    if (this.layerView && this.layerView.group.visible) {
      this.layerView.update();
    }
  }

  setDayNightCycleEnabled(enabled) {
    this.enableDayNight = enabled;
  }

  setScale(scale) {
    this.scale = scale;
    this.group.scale.set(scale, scale, scale);
    for (const chunk of this.chunks) {
      chunk.setScale(scale);
    }
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
