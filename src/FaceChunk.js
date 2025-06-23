import * as THREE from 'three';
import { intersectsFrustum } from './utils/BoundingUtils.js';

export default class FaceChunk {
  constructor(face, builder, resolution = 16) {
    this.face = face;
    this.builder = builder;
    this.baseResolution = resolution;
    this.resolution = resolution;
    this.level = 0;
    this.mesh = null;
    this.children = [];

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

  update(camera, lodController) {
    const distance = camera.position.distanceTo(this.center);
    const targetLevel = lodController.getTargetLevel(distance);

    if (targetLevel !== this.level) {
      this.level = targetLevel;
      this.resolution = this.baseResolution * Math.pow(2, this.level);
      this.rebuild();
    }

    const visible = intersectsFrustum(this.center, this.radius, camera);
    if (this.mesh) this.mesh.visible = visible;
  }

  rebuild() {
    if (!this.mesh) return;
    const newGeom = this.builder.buildFace(this.face, this.resolution);
    this.mesh.geometry.dispose();
    this.mesh.geometry = newGeom;
  }
}
