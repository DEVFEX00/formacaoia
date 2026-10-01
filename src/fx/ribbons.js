import * as THREE from 'three';

// RIBBONS — glossy 3D bands that flow across the page (the Lusion gesture,
// in FEX green). Each band is a strip bent along an animated path and
// twisted around it; shading is done in the shader (diffuse + sheen + rim),
// so it reads as a physical object on both cream and black backgrounds.

const VS = `
uniform float uTime, uAmp, uTwist, uWidth, uLen, uY, uPhase, uSpeed, uZ, uTilt, uX;
varying vec3 vN; varying vec3 vV; varying float vU; varying float vV2;
vec3 path(float u){
  float x = (u - 0.5) * uLen + uX;
  float y = uY + sin(u * 3.2 + uTime * uSpeed + uPhase) * uAmp + sin(u * 7.1 + uTime * uSpeed * 0.6 + uPhase * 1.7) * uAmp * 0.28 + (u - 0.5) * uTilt;
  float z = uZ + cos(u * 2.6 + uTime * uSpeed * 0.8 + uPhase) * 1.4;
  return vec3(x, y, z);
}
void main(){
  float u = uv.x, v = uv.y - 0.5;
  vec3 p = path(u), p2 = path(u + 0.003);
  vec3 T = normalize(p2 - p);
  vec3 B = normalize(cross(T, vec3(0.0, 0.0, 1.0)));
  vec3 Nn = normalize(cross(B, T));
  float a = u * uTwist + uTime * 0.35 + uPhase;
  vec3 side = B * cos(a) + Nn * sin(a);
  vec3 nrm = -B * sin(a) + Nn * cos(a);
  float taper = smoothstep(0.0, 0.12, u) * smoothstep(1.0, 0.88, u);
  vec3 pos = p + side * v * uWidth * (0.35 + 0.65 * taper);
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vN = normalize(normalMatrix * nrm);
  vV = normalize(-mv.xyz);
  vU = u; vV2 = v;
  gl_Position = projectionMatrix * mv;
}`;
const FS = `
uniform vec3 uDeep, uMid, uHi; uniform float uAlpha, uDark;
varying vec3 vN; varying vec3 vV; varying float vU; varying float vV2;
void main(){
  vec3 n = normalize(vN) * (gl_FrontFacing ? 1.0 : -1.0);
  vec3 L = normalize(vec3(-0.35, 0.8, 0.55));
  float diff = max(dot(n, L), 0.0);
  float spec = pow(max(dot(reflect(-L, n), vV), 0.0), 28.0);
  float rim = pow(1.0 - abs(dot(n, vV)), 2.2);
  float lit = 0.35 + 0.65 * diff + 0.35 * abs(n.z);
  vec3 col = mix(mix(uDeep, uMid, 0.55), uMid, clamp(lit, 0.0, 1.0)) + uHi * spec * 0.8 + uHi * rim * 0.25 * (1.0 - uDark) + uMid * rim * uDark * 0.6;
  col += vec3(0.0, 0.08, 0.02) * sin(vU * 40.0) * 0.0;
  float ends = smoothstep(0.0, 0.08, vU) * smoothstep(1.0, 0.92, vU);
  float edge = 1.0 - smoothstep(0.42, 0.5, abs(vV2));
  gl_FragColor = vec4(col, uAlpha * ends * (0.75 + 0.25 * edge));
}`;

// base personalities of the three bands
const BASE = [
  { len: 26, width: 0.3, amp: 1.1, twist: 5.5, speed: 0.22, phase: 0.0, z: -1.5, y: 0.6, tilt: -1.2 },
  { len: 28, width: 0.2, amp: 1.5, twist: 7.5, speed: 0.18, phase: 2.1, z: -2.5, y: -0.4, tilt: 1.6 },
  { len: 24, width: 0.12, amp: 0.9, twist: 9.0, speed: 0.26, phase: 4.2, z: -0.8, y: 1.4, tilt: -0.6 },
];

export function createRibbons(scene, device) {
  const seg = device.tier === 'low' ? 180 : 360;
  const geo = new THREE.PlaneGeometry(1, 1, seg, 1);
  const bands = BASE.map((b) => {
    const u = {
      uTime: { value: 0 }, uAmp: { value: b.amp }, uTwist: { value: b.twist }, uWidth: { value: b.width }, uLen: { value: b.len },
      uY: { value: b.y }, uPhase: { value: b.phase }, uSpeed: { value: b.speed }, uZ: { value: b.z }, uTilt: { value: b.tilt }, uX: { value: 0 },
      uDeep: { value: new THREE.Color('#06401c') }, uMid: { value: new THREE.Color('#00D84F') }, uHi: { value: new THREE.Color('#eaffef') },
      uAlpha: { value: 0 }, uDark: { value: 0 },
    };
    const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: u, vertexShader: VS, fragmentShader: FS, side: THREE.DoubleSide, transparent: true, depthWrite: false }));
    m.frustumCulled = false;
    scene.add(m);
    return { m, u, b, a: 0, y: b.y, x: 0 };
  });

  // state: per band target alpha, vertical offset (in screen halves), horizontal offset
  return {
    update(dt, t, target, dark, halfH, scrollVel) {
      bands.forEach((bd, i) => {
        const tg = target[i] || { a: 0, y: bd.b.y, x: 0 };
        const k = 1 - Math.exp(-dt * 2.2);
        bd.a += (tg.a - bd.a) * k;
        bd.y += ((tg.y ?? bd.b.y) - bd.y) * k;
        bd.x += ((tg.x ?? 0) - bd.x) * k;
        bd.u.uAlpha.value = bd.a;
        bd.u.uY.value = bd.y * halfH;
        bd.u.uX.value = bd.x * halfH;
        bd.u.uTime.value = t + Math.min(3, Math.abs(scrollVel) * 0.0006) * 0;
        bd.u.uDark.value += ((dark ? 1 : 0) - bd.u.uDark.value) * k;
        bd.m.visible = bd.a > 0.004;
      });
    },
    // scroll adds a little extra flow
    nudge(v) { bands.forEach((bd) => { bd.u.uPhase.value += v; }); },
  };
}
