import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';

// Simple GPU height generator using GPUComputationRenderer. This is a placeholder
// implementation that computes FBM noise on the GPU. The shader currently
// mirrors the CPU pipeline only partially.

const noiseShader = `
vec3 mod289(vec3 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0); 
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy; 
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857; 
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

float fbm(vec3 p){
  float v = 0.0;
  float a = 0.5;
  for(int i=0;i<5;i++){
    v += snoise(p) * a;
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}
`;

const computeFragment = `
#include <common>
uniform float uFrequency;
uniform float uAmplitude;
uniform float uSeed;
uniform int uFace;

${noiseShader}

vec3 cubeFaceVector(int face, float u, float v){
  if(face==0) return vec3(1.0, v, -u);
  if(face==1) return vec3(-1.0, v, u);
  if(face==2) return vec3(u, 1.0, -v);
  if(face==3) return vec3(u, -1.0, v);
  if(face==4) return vec3(u, v, 1.0);
  return vec3(-u, v, -1.0);
}

vec3 cubeToSphere(vec3 p){
  float x2 = p.x*p.x; float y2 = p.y*p.y; float z2 = p.z*p.z;
  return vec3(
    p.x*sqrt(1.0 - 0.5*(y2+z2) + (y2*z2)/3.0),
    p.y*sqrt(1.0 - 0.5*(z2+x2) + (z2*x2)/3.0),
    p.z*sqrt(1.0 - 0.5*(x2+y2) + (x2*y2)/3.0)
  );
}

void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  float u = uv.x*2.0 - 1.0;
  float v = uv.y*2.0 - 1.0;
  vec3 cube = cubeFaceVector(uFace, u, v);
  vec3 sphere = cubeToSphere(cube);
  float n = fbm(sphere * uFrequency + uSeed);
  gl_FragColor = vec4(n * uAmplitude, 0.0, 0.0, 1.0);
}
`;

export default class GPUHeightGenerator {
  constructor(renderer, size = 33) {
    this.renderer = renderer;
    this.size = size;
    this.gpu = new GPUComputationRenderer(size, size, renderer);
    const dt = this.gpu.createTexture();
    this.variable = this.gpu.addVariable('heightTex', computeFragment, dt);
    this.variable.material.uniforms.uFrequency = { value: 1.0 };
    this.variable.material.uniforms.uAmplitude = { value: 1.0 };
    this.variable.material.uniforms.uSeed = { value: 0.0 };
    this.variable.material.uniforms.uFace = { value: 0 };
    this.gpu.setVariableDependencies(this.variable, [this.variable]);
    const err = this.gpu.init();
    if (err) console.error(err);
  }

  generate(face, freq, amp, seed){
    this.variable.material.uniforms.uFace.value = face;
    this.variable.material.uniforms.uFrequency.value = freq;
    this.variable.material.uniforms.uAmplitude.value = amp;
    this.variable.material.uniforms.uSeed.value = seed;
    this.gpu.compute();
    const target = this.gpu.getCurrentRenderTarget(this.variable);
    const buffer = new Float32Array(this.size * this.size * 4);
    this.renderer.readRenderTargetPixels(target, 0,0,this.size,this.size, buffer);
    return buffer;
  }

  getHeight(x, y, z) {
    // Placeholder for parity with HeightmapStack API
    return 0;
  }
}
