import * as THREE from 'three';

// RENDER-SCAN — the hero's exit. The dark page is a grid of pixels; a front
// expands from the logo and each cell "renders": a green square grows from
// its centre and settles into the cream of the next chapter. Ahead of the
// front, the grid's nodes light up like a scanner reading the page.

const VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FS = `
uniform vec2 uRes, uC; uniform float uP, uBase, uCell, uMax;
uniform vec3 uLight, uGreen;
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  vec2 px = vUv * uRes;
  vec2 id = floor(px / uCell);
  vec2 cc = (id + 0.5) * uCell;
  float t = length(cc - uC) / uMax * 0.8 + hash(id) * 0.2;   // when this cell renders
  float front = uP * 1.3 - 0.05;
  float k = clamp((front - t) / 0.12, 0.0, 1.0);
  vec2 q = abs(px - cc) / (uCell * 0.5);
  float fill = step(max(q.x, q.y), k * 1.06) * step(0.001, k);
  if (fill > 0.5) { gl_FragColor = vec4(mix(uGreen, uLight, smoothstep(0.45, 1.0, k)), 1.0); return; }
  float on = step(0.0005, uP) * step(uP, 0.999);
  float near = exp(-pow((t - front) / 0.06, 2.0)) * on;
  float pre = smoothstep(front + 0.07, front, t) * on;
  float r = length(px - cc) / uCell;
  float dotA = (1.0 - smoothstep(0.05, 0.11, r)) * (uBase + near * 0.95);
  float a = max(dotA, pre * 0.16);
  if (a < 0.003) discard;
  gl_FragColor = vec4(uGreen, a);
}`;

export function createScan(scene) {
  const u = {
    uRes: { value: new THREE.Vector2(1, 1) }, uC: { value: new THREE.Vector2() },
    uP: { value: 0 }, uBase: { value: 0 }, uCell: { value: 30 }, uMax: { value: 1 },
    // raw sRGB so the finished frame matches the page's cream exactly
    uLight: { value: new THREE.Vector3(238 / 255, 234 / 255, 226 / 255) },
    uGreen: { value: new THREE.Vector3(0, 216 / 255, 79 / 255) },
  };
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
    uniforms: u, vertexShader: VS, fragmentShader: FS, transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
  }));
  m.frustumCulled = false; m.visible = false;
  scene.add(m);
  return {
    get full() { return m.visible && u.uP.value >= 0.999; },
    set(prog, base, cx, cy, W, H) {
      m.visible = prog > 0.0005 || base > 0.0005;
      if (!m.visible) return;
      m.position.set(W / 2, H / 2, 0); m.scale.set(W, H, 1);
      u.uRes.value.set(W, H); u.uC.value.set(cx, cy);
      u.uP.value = prog; u.uBase.value = base;
      u.uCell.value = W < 700 ? 22 : 30;
      u.uMax.value = Math.max(Math.hypot(cx, cy), Math.hypot(W - cx, cy), Math.hypot(cx, H - cy), Math.hypot(W - cx, H - cy));
    },
  };
}
