import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import PlanetManager from '/src/PlanetManager.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 3, 6);

const controls = new OrbitControls(camera, renderer.domElement);

const planet = new PlanetManager(scene);

const info = document.createElement('div');
info.style.position = 'absolute';
info.style.top = '0';
info.style.left = '0';
info.style.padding = '4px';
info.style.color = 'white';
info.style.background = 'rgba(0,0,0,0.5)';
info.style.fontFamily = 'monospace';
document.body.appendChild(info);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  planet.update(camera);
  info.textContent = `Chunks: ${planet.chunks.length} | Modifiers: ${planet.heightStack.modifiers.length}`;
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
