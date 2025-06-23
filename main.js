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

const amp = document.getElementById('amp');
const freq = document.getElementById('freq');
const octaves = document.getElementById('octaves');
const warp = document.getElementById('warp');
const rebuildBtn = document.getElementById('rebuild');
const progressBar = document.getElementById('progress-bar');

function updateParams() {
  planet.setNoiseParams({
    amplitude: parseFloat(amp.value),
    frequency: parseFloat(freq.value),
    octaves: parseInt(octaves.value, 10),
    warpIntensity: parseFloat(warp.value)
  });
}

rebuildBtn.addEventListener('click', async () => {
  updateParams();
  progressBar.style.width = '0%';
  await planet.rebuild(p => {
    progressBar.style.width = `${p * 100}%`;
  });
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  planet.update(camera);
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
