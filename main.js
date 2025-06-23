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

const planet = new PlanetManager(scene, 1, true, true);
planet.setDayNightCycleEnabled(true);

const amp = document.getElementById('amp');
const freq = document.getElementById('freq');
const octaves = document.getElementById('octaves');
const warp = document.getElementById('warp');
const baseNoiseCheck = document.getElementById('baseNoiseCheck');
const tectonicsCheck = document.getElementById('tectonicsCheck');
const moistureCheck = document.getElementById('moistureCheck');
const temperatureCheck = document.getElementById('temperatureCheck');
const biomeCheck = document.getElementById('biomeCheck');
const vegetationCheck = document.getElementById('vegetationCheck');
const cloudDensityCheck = document.getElementById('cloudDensityCheck');
const cloudFlowCheck = document.getElementById('cloudFlowCheck');
const rebuildBtn = document.getElementById('rebuild');
const progressBar = document.getElementById('progress-bar');

function updateParams() {
  planet.setNoiseParams({
    amplitude: parseFloat(amp.value),
    frequency: parseFloat(freq.value),
    octaves: parseInt(octaves.value, 10),
    warpIntensity: parseFloat(warp.value)
  });
  planet.setLayerEnabled('baseNoise', baseNoiseCheck.checked);
  planet.setLayerEnabled('tectonics', tectonicsCheck.checked);
  planet.setLayerEnabled('moisture', moistureCheck.checked);
  planet.setLayerEnabled('temperature', temperatureCheck.checked);
  planet.setLayerEnabled('biome', biomeCheck.checked);
  planet.setLayerEnabled('vegetation', vegetationCheck.checked);
  planet.setLayerEnabled('cloudDensity', cloudDensityCheck.checked);
  planet.setLayerEnabled('cloudFlow', cloudFlowCheck.checked);
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
  baseNoiseCheck, tectonicsCheck, moistureCheck, temperatureCheck,
  biomeCheck, vegetationCheck, cloudDensityCheck, cloudFlowCheck
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
