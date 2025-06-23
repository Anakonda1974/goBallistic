import * as THREE from 'three';

const vertexShader = /* glsl */`
uniform float uAmplitude;
uniform float uFrequency;
uniform float uSeed;
uniform float uRadius;
varying float vHeight;

float random(vec3 p) {
  return fract(sin(dot(p + uSeed, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = random(i + vec3(0.0, 0.0, 0.0));
  float n100 = random(i + vec3(1.0, 0.0, 0.0));
  float n010 = random(i + vec3(0.0, 1.0, 0.0));
  float n110 = random(i + vec3(1.0, 1.0, 0.0));
  float n001 = random(i + vec3(0.0, 0.0, 1.0));
  float n101 = random(i + vec3(1.0, 0.0, 1.0));
  float n011 = random(i + vec3(0.0, 1.0, 1.0));
  float n111 = random(i + vec3(1.0, 1.0, 1.0));
  float n00 = mix(n000, n100, f.x);
  float n10 = mix(n010, n110, f.x);
  float n01 = mix(n001, n101, f.x);
  float n11 = mix(n011, n111, f.x);
  float n0 = mix(n00, n10, f.y);
  float n1 = mix(n01, n11, f.y);
  return mix(n0, n1, f.z) * 2.0 - 1.0;
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += noise(p) * a;
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 pos = position;
  float h = fbm(normalize(pos) * uFrequency);
  vHeight = h;
  pos = normalize(pos) * (uRadius + h * uAmplitude);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = /* glsl */`
varying float vHeight;

void main() {
  vec3 low = vec3(0.2, 0.6, 0.3);
  vec3 high = vec3(1.0, 1.0, 1.0);
  vec3 color = mix(low, high, vHeight * 0.5 + 0.5);
  gl_FragColor = vec4(color, 1.0);
}
`;

export default function createTerrainMaterial({
  amplitude = 0.3,
  frequency = 1.0,
  seed = 0.0,
  radius = 1.0,
} = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uAmplitude: { value: amplitude },
      uFrequency: { value: frequency },
      uSeed: { value: seed },
      uRadius: { value: radius },
    },
    vertexShader,
    fragmentShader,
    flatShading: true,
  });
}
