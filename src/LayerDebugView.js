import * as THREE from 'three';

export default class LayerDebugView {
  constructor(pipeline, layerId, radius = 1) {
    this.pipeline = pipeline;
    this.layerId = layerId;
    this.radius = radius;
    this.group = new THREE.Group();
    this.createMesh();
  }

  createMesh() {
    const resolution = 32;
    const geometry = new THREE.SphereGeometry(this.radius, resolution, resolution);
    const colors = new Float32Array(geometry.attributes.position.count * 3);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ vertexColors: true, wireframe: false })
    );
    this.group.add(this.mesh);
    this.update();
  }

  setLayer(layerId) {
    this.layerId = layerId;
    this.update();
  }

  update() {
    const position = this.mesh.geometry.getAttribute('position');
    const colors = this.mesh.geometry.getAttribute('color');
    const color = new THREE.Color();
    for (let i = 0; i < position.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(position, i).normalize();
      const ctx = this.pipeline.compute(v.x, v.y, v.z);
      const h = ctx[this.layerId] ?? 0;
      const t = (h + 1) / 2; // map [-1,1] to [0,1]
      color.setRGB(t, t, t);
      colors.array[i * 3] = color.r;
      colors.array[i * 3 + 1] = color.g;
      colors.array[i * 3 + 2] = color.b;
    }
    colors.needsUpdate = true;
  }

  addToScene(scene) {
    scene.add(this.group);
  }

  removeFromScene(scene) {
    scene.remove(this.group);
  }
}
