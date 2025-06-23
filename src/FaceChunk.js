import * as THREE from 'three';
import { sphereIntersectsFrustum } from './utils/BoundingUtils.js';


export default class FaceChunk {
  constructor(face, builder, resolution = 16, useWorker = false) {
    this.face = face;
    this.builder = builder;
    this.baseResolution = resolution;
    this.resolution = resolution;
    this.level = 0;
    this.mesh = null;
    this.children = [];
    this.rebuilding = false;
    this.useWorker = useWorker;
    this.worker = null;

    // Pre-compute a simple bounding sphere for frustum checks
    this.center = new THREE.Vector3();
    switch (face) {
      case 'px': this.center.set(1, 0, 0); break;
      case 'nx': this.center.set(-1, 0, 0); break;
      case 'py': this.center.set(0, 1, 0); break;
      case 'ny': this.center.set(0, -1, 0); break;
      case 'pz': this.center.set(0, 0, 1); break;
      case 'nz': this.center.set(0, 0, -1); break;
    }
    this.center.multiplyScalar(this.builder.radius);
    this.radius = this.builder.radius * 1.1; // allow some slack for terrain height
  }

  getVertexHeight(x, y, z) {
    return this.builder.getVertexHeight(x, y, z);
  }

  createMesh(material) {
    const geometry = this.builder.buildFace(this.face, this.resolution);
    const mat = material || new THREE.MeshStandardMaterial({
      color: 0x88aa55,
      flatShading: true,
    });
    this.mesh = new THREE.Mesh(geometry, mat);
    return this.mesh;
  }

  addToScene(scene) {
    if (!this.mesh) this.createMesh();
    scene.add(this.mesh);
  }

  update(camera, lodController, frustum) {

    const distance = camera.position.distanceTo(this.center);
    const targetLevel = lodController.getTargetLevel(distance);

    if (targetLevel !== this.level) {
      this.level = targetLevel;
      this.resolution = this.baseResolution * Math.pow(2, this.level);
      this.rebuildAsync();
    }


    const visible = frustum ?
      sphereIntersectsFrustum(frustum, this.center, this.radius) : true;

    if (this.mesh) this.mesh.visible = visible;
  }

  rebuild() {
    if (!this.mesh || this.rebuilding) return;
    this.rebuilding = true;
    try {
      const newGeom = this.builder.buildFace(this.face, this.resolution);
      this.mesh.geometry.dispose();
      this.mesh.geometry = newGeom;
    } finally {
      this.rebuilding = false;
    }
  }

  async rebuildAsync(progressCallback) {
    if (!this.mesh || this.rebuilding) return;
    this.rebuilding = true;
    try {
      let geometry;
      if (this.useWorker && typeof Worker !== 'undefined') {
        if (!this.worker) {
          this.worker = new Worker(new URL('./workers/geometryWorker.js', import.meta.url), { type: 'module' });
        }
        const data = await new Promise((resolve) => {
          this.worker.onmessage = (e) => {
            if (e.data.progress !== undefined) {
              if (e.data.face === this.face && progressCallback) progressCallback(e.data.progress);
            } else {
              resolve(e.data);
            }
          };
          this.worker.postMessage({
            face: this.face,
            resolution: this.resolution,
            radius: this.builder.radius,
            seed: this.builder.heightStack.seed || 0
          });
        });
        geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(data.position, 3));
        geometry.setIndex(Array.from(data.index));
        geometry.computeVertexNormals();
      } else {
        geometry = await this.builder.buildFaceAsync(
          this.face,
          this.resolution,
          progressCallback
        );
      }
      this.mesh.geometry.dispose();
      this.mesh.geometry = geometry;
    } finally {
      this.rebuilding = false;
    }
  }
}
