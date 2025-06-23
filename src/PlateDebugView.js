import * as THREE from 'three';


export default class PlateDebugView {
  constructor(plates, radius = 1) {
    this.plates = plates;
    this.radius = radius;
    this.group = new THREE.Group();
    this.createMesh();
  }

  createMesh() {
    const resolution = 32;
    const geometry = new THREE.SphereGeometry(this.radius, resolution, resolution);
    const position = geometry.getAttribute('position');
    const colors = new Float32Array(position.count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < position.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(position, i).normalize();
      const { first } = this.plates.getNearest(v);
      const h = (first.plate.id % this.plates.plates.length) / this.plates.plates.length;
      color.setHSL(h, 0.5, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ vertexColors: true, wireframe: true })
    );
    this.group.add(this.mesh);
  }

  addToScene(scene) {
    scene.add(this.group);
  }

  removeFromScene(scene) {
    scene.remove(this.group);
  }
}
