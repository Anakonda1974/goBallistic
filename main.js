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
const terraceSteps = document.getElementById('terraceSteps');
const terraceRange = document.getElementById('terraceRange');
const domainWarpCheck = document.getElementById('domainWarpCheck');
const terraceCheck = document.getElementById('terraceCheck');
const cliffCheck = document.getElementById('cliffCheck');
const rebuildBtn = document.getElementById('rebuild');
const progressBar = document.getElementById('progress-bar');

function updateParams() {
  planet.setNoiseParams({
    amplitude: parseFloat(amp.value),
    frequency: parseFloat(freq.value),
    octaves: parseInt(octaves.value, 10),
    warpIntensity: parseFloat(warp.value),
    terraceSteps: parseInt(terraceSteps.value, 10),
    terraceRange: parseFloat(terraceRange.value)
  });
  planet.setModifierEnabled('domainWarp', domainWarpCheck.checked);
  planet.setModifierEnabled('terrace', terraceCheck.checked);
  planet.setModifierEnabled('cliff', cliffCheck.checked);
}

let rebuilding = false;
async function triggerRebuild() {
  if (rebuilding) return;
  rebuilding = true;
  updateParams();
  progressBar.style.width = '0%';
  await planet.rebuild(p => {
    progressBar.style.width = `${p * 100}%`;
  });
  rebuilding = false;
}

rebuildBtn.addEventListener('click', triggerRebuild);
[amp, freq, octaves, warp,
  terraceSteps, terraceRange,
  domainWarpCheck, terraceCheck, cliffCheck
].forEach(input => {
  input.addEventListener('input', triggerRebuild);
  if (input.type === 'checkbox') {
    input.addEventListener('change', triggerRebuild);
  }
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
