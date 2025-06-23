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

const axes = new THREE.AxesHelper(2);
const grid = new THREE.GridHelper(4, 4);
scene.add(axes);
scene.add(grid);

// Use CPU-based height generation by default so all layers work
// Set the third argument to `true` to enable GPU compute shaders
const planet = new PlanetManager(scene, 1, false, true, renderer);

const amp = document.getElementById('amp');
const freq = document.getElementById('freq');
const octaves = document.getElementById('octaves');
const warp = document.getElementById('warp');
const cliffThreshold = document.getElementById('cliffThreshold');
const cliffBoost = document.getElementById('cliffBoost');
const dayNightCheck = document.getElementById('dayNightCheck');
planet.setDayNightCycleEnabled(dayNightCheck.checked);
const baseNoiseCheck = document.getElementById('baseNoiseCheck');
const tectonicsCheck = document.getElementById('tectonicsCheck');
const moistureCheck = document.getElementById('moistureCheck');
const temperatureCheck = document.getElementById('temperatureCheck');
const biomeCheck = document.getElementById('biomeCheck');
const vegetationCheck = document.getElementById('vegetationCheck');
const cloudDensityCheck = document.getElementById('cloudDensityCheck');
const cloudFlowCheck = document.getElementById('cloudFlowCheck');
const rockyCheck = document.getElementById('rockyCheck');
const layerDebugCheck = document.getElementById('layerDebugCheck');
const layerSelect = document.getElementById('layerSelect');
const scaleInput = document.getElementById('scale');
const rulerCheck = document.getElementById('rulerCheck');
const rebuildBtn = document.getElementById('rebuild');
const resetBtn = document.getElementById('reset');
const ui = document.getElementById('ui');
const toggleBtn = document.getElementById('toggle-ui');
const progressBar = document.getElementById('progress-bar');
const statusDiv = document.getElementById('status');

axes.visible = rulerCheck.checked;
grid.visible = rulerCheck.checked;
planet.setScale(parseFloat(scaleInput.value));

function updateParams() {
  planet.setNoiseParams({
    amplitude: parseFloat(amp.value),
    frequency: parseFloat(freq.value),
    octaves: parseInt(octaves.value, 10),
    warpIntensity: parseFloat(warp.value)
  });
  planet.setCliffParams({
    threshold: parseFloat(cliffThreshold.value),
    boost: parseFloat(cliffBoost.value)
  });
  planet.setLayerEnabled('baseNoise', baseNoiseCheck.checked);
  planet.setLayerEnabled('tectonics', tectonicsCheck.checked);
  planet.setLayerEnabled('moisture', moistureCheck.checked);
  planet.setLayerEnabled('temperature', temperatureCheck.checked);
  planet.setLayerEnabled('biome', biomeCheck.checked);
  planet.setLayerEnabled('vegetation', vegetationCheck.checked);
  planet.setLayerEnabled('cloudDensity', cloudDensityCheck.checked);
  planet.setLayerEnabled('cloudFlow', cloudFlowCheck.checked);
  planet.setLayerEnabled('rocky', rockyCheck.checked);
  planet.setDebugVisible(layerDebugCheck.checked);
  planet.setDebugLayer(layerSelect.value);
  planet.setDayNightCycleEnabled(dayNightCheck.checked);
  planet.setScale(parseFloat(scaleInput.value));
  const show = rulerCheck.checked;
  axes.visible = show;
  grid.visible = show;
}

function resetParams() {
  amp.value = 1;
  freq.value = 1.2;
  octaves.value = 5;
  warp.value = 0.2;
  cliffThreshold.value = 0.3;
  cliffBoost.value = 2;
  dayNightCheck.checked = true;
  scaleInput.value = 1;
  rulerCheck.checked = true;
  [baseNoiseCheck, tectonicsCheck, moistureCheck, temperatureCheck,
    biomeCheck, vegetationCheck, cloudDensityCheck, cloudFlowCheck,
    rockyCheck].forEach(el => { el.checked = true; });
  layerDebugCheck.checked = false;
  layerSelect.value = 'baseNoise';
  updateParams();
  triggerRebuild();
}

let rebuilding = false;
async function triggerRebuild() {
  if (rebuilding) return;
  rebuilding = true;
  updateParams();
  progressBar.style.width = '0%';
  statusDiv.textContent = 'Rebuild -> starting';

  await planet.rebuild(
    p => {
      progressBar.style.width = `${p * 100}%`;
    },

    ({ task, subtask, progress }) => {
      const pct = Math.round(progress * 100);
      statusDiv.textContent = `${task} -> ${subtask} (${pct}%)`;

    }
  );
  statusDiv.textContent = 'Idle';
  rebuilding = false;
}

rebuildBtn.addEventListener('click', triggerRebuild);
resetBtn.addEventListener('click', resetParams);
toggleBtn.addEventListener('click', () => {
  ui.classList.toggle('open');
});
[amp, freq, octaves, warp,
  cliffThreshold, cliffBoost,
  baseNoiseCheck, tectonicsCheck, moistureCheck, temperatureCheck,
  biomeCheck, vegetationCheck, cloudDensityCheck, cloudFlowCheck,
  rockyCheck, layerDebugCheck, layerSelect, dayNightCheck
].forEach(input => {
  input.addEventListener('input', triggerRebuild);
  if (input.type === 'checkbox') {
    input.addEventListener('change', triggerRebuild);
  }
  if (input.tagName === 'SELECT') {
    input.addEventListener('change', triggerRebuild);
  }
});

[scaleInput, rulerCheck].forEach(input => {
  input.addEventListener('input', updateParams);
  if (input.type === 'checkbox') {
    input.addEventListener('change', updateParams);
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
