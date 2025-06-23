import * as THREE from 'three';

const vertexShader = /* glsl */`
uniform float uAmplitude;
uniform float uFrequency;
uniform float uSeed;
uniform float uRadius;
varying float vHeight;
varying vec3 vPos;

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
  vec3 pos = normalize(position);
  float h = fbm(pos * uFrequency);
  vHeight = h;
  vPos = pos * (uRadius + h * uAmplitude);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(vPos, 1.0);
}
`;

const fragmentShader = /* glsl */`
varying float vHeight;
varying vec3 vPos;

uniform vec3 lowColor;
uniform vec3 midColor;
uniform vec3 highColor;

float getSlope() {
  vec3 dx = dFdx(vPos);
  vec3 dy = dFdy(vPos);
  vec3 normal = normalize(cross(dx, dy));
  return 1.0 - dot(normal, normalize(vPos));
}

void main() {
  float heightT = clamp(vHeight * 0.5 + 0.5, 0.0, 1.0);
  float slope = clamp(getSlope() * 3.0, 0.0, 1.0);
  vec3 base = mix(lowColor, highColor, heightT);
  vec3 color = mix(base, midColor, slope);
  gl_FragColor = vec4(color, 1.0);
}
`;

export default function createTerrainMaterial({
  amplitude = 0.3,
  frequency = 1.0,
  seed = 0.0,
  radius = 1.0,
  lowColor = new THREE.Color(0x355e3b),
  midColor = new THREE.Color(0x8a7e66),
  highColor = new THREE.Color(0xffffff),
} = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uAmplitude: { value: amplitude },
      uFrequency: { value: frequency },
      uSeed: { value: seed },
      uRadius: { value: radius },
      lowColor: { value: lowColor },
      midColor: { value: midColor },
      highColor: { value: highColor },
    },
    vertexShader,
    fragmentShader,
    flatShading: true,
  });
}
