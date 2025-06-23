import * as THREE from 'three';

export default class FaceChunk {
  constructor(face, builder, resolution = 16) {
    this.face = face;
    this.builder = builder;
    this.resolution = resolution;
    this.mesh = null;
    this.children = [];
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

  update(camera) {
    // LOD update placeholder
  }

  rebuild() {
    if (!this.mesh) return;
    const newGeom = this.builder.buildFace(this.face, this.resolution);
    this.mesh.geometry.dispose();
    this.mesh.geometry = newGeom;
  }
}
