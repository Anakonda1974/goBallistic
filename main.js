import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// Use a relative path so loading index.html directly works without a dev server
import PlanetManager from './src/PlanetManager.js';

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

// Use CPU-based height generation and build geometry on the main thread so
// noise edits immediately affect the mesh. Set the third argument to `true`
// to enable GPU compute shaders.
const planet = new PlanetManager(scene, 1, false, false, renderer);

const fbmAmpInputs = [
  document.getElementById('fbmAmp0'),
  document.getElementById('fbmAmp1'),
  document.getElementById('fbmAmp2'),
];
const fbmFreqInputs = [
  document.getElementById('fbmFreq0'),
  document.getElementById('fbmFreq1'),
  document.getElementById('fbmFreq2'),
];
const worleyAmpInputs = [
  document.getElementById('worleyAmp0'),
  document.getElementById('worleyAmp1'),
  document.getElementById('worleyAmp2'),
];
const worleyFreqInputs = [
  document.getElementById('worleyFreq0'),
  document.getElementById('worleyFreq1'),
  document.getElementById('worleyFreq2'),
];
const rebuildBtn = document.getElementById('rebuild');
const resetBtn = document.getElementById('reset');
const ui = document.getElementById('ui');
const toggleBtn = document.getElementById('toggle-ui');
const progressBar = document.getElementById('progress-bar');
const statusDiv = document.getElementById('status');

axes.visible = true;
grid.visible = true;

function buildOctaves(ampInputs, freqInputs) {
  const oct = [];
  for (let i = 0; i < ampInputs.length; i++) {
    oct.push({
      amp: parseFloat(ampInputs[i].value),
      freq: parseFloat(freqInputs[i].value),
    });
  }
  return oct;
}

function updateParams() {
  planet.setNoiseParams({
    fbmOctaves: buildOctaves(fbmAmpInputs, fbmFreqInputs),
    worleyOctaves: buildOctaves(worleyAmpInputs, worleyFreqInputs),
  });
}

function resetParams() {
  const fbmDefaults = [
    { amp: 1, freq: 1 },
    { amp: 0.5, freq: 2 },
    { amp: 0.25, freq: 4 },
  ];
  fbmDefaults.forEach((o, i) => {
    fbmAmpInputs[i].value = o.amp;
    fbmFreqInputs[i].value = o.freq;
  });
  const worleyDefaults = [
    { amp: 0, freq: 1 },
    { amp: 0, freq: 2 },
    { amp: 0, freq: 4 },
  ];
  worleyDefaults.forEach((o, i) => {
    worleyAmpInputs[i].value = o.amp;
    worleyFreqInputs[i].value = o.freq;
  });
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
[...fbmAmpInputs, ...fbmFreqInputs, ...worleyAmpInputs, ...worleyFreqInputs].forEach(
  input => {
    input.addEventListener('input', triggerRebuild);
  }
);

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
