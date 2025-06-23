import * as THREE from 'three';

const vertexShader = /* glsl */`
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  vNormal = normalize(normalMatrix * normal);
  vViewDir = normalize(cameraPosition - vWorldPosition);
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const fragmentShader = /* glsl */`
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vViewDir;

uniform samplerCube envMap;
uniform vec3 shallowColor;
uniform vec3 deepColor;
uniform vec3 sunDirection;
uniform vec3 sunColor;
uniform float fresnelBias;
uniform float fresnelPower;
uniform float depthFactor;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vViewDir);
  vec3 L = normalize(sunDirection);
  vec3 H = normalize(V + L);

  float fresnel = fresnelBias + (1.0 - fresnelBias) * pow(1.0 - dot(N, V), fresnelPower);

  vec3 reflected = reflect(-V, N);
  vec3 reflection = textureCube(envMap, reflected).rgb;

  vec3 refracted = refract(-V, N, 0.95);
  vec3 refraction = textureCube(envMap, refracted).rgb;

  float depth = clamp(dot(N, vec3(0.0, 1.0, 0.0)), 0.0, 1.0);
  vec3 waterColor = mix(deepColor, shallowColor, pow(depth, depthFactor));

  float diffuse = max(dot(N, L), 0.0);
  float specular = pow(max(dot(N, H), 0.0), 64.0);

  vec3 lighting = waterColor * (0.5 + 0.5 * diffuse) + sunColor * specular;

  vec3 finalColor = mix(refraction, reflection, fresnel);
  finalColor = mix(finalColor, lighting, 0.6);

  gl_FragColor = vec4(finalColor, 0.9);
}
`;

export default function createWaterMaterial({
  envMap = null,
  shallowColor = new THREE.Color(0x4470e0),
  deepColor = new THREE.Color(0x17203a),
  sunDirection = new THREE.Vector3(1, 1, 1).normalize(),
  sunColor = new THREE.Color(0xffffff),
  fresnelBias = 0.1,
  fresnelPower = 5.0,
  depthFactor = 1.5,
} = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      envMap: { value: envMap },
      shallowColor: { value: shallowColor },
      deepColor: { value: deepColor },
      sunDirection: { value: sunDirection },
      sunColor: { value: sunColor },
      fresnelBias: { value: fresnelBias },
      fresnelPower: { value: fresnelPower },
      depthFactor: { value: depthFactor },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
  });
}
