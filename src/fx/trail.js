import * as THREE from 'three';
import { damp } from '../engine/util.js';

// TRAIL — the green "linha de passagem" (brandbook). One glossy ribbon per
// route, anchored to page elements: it slips behind cards, turns, runs along
// the margins and draws itself ahead of the reader as the page scrolls.
// Twist is faked in 2D (width follows |cos|, back face darker) and flows
// along the ribbon over time.

const VS = `
attribute vec2 aC; attribute vec2 aN; attribute float aS; attribute float aL;
uniform float uScroll, uTime, uW, uTw;
varying float vS; varying float vC; varying float vL;
void main(){
  float a = aL / uTw * 6.2831853 - uTime * 0.8;
  float c = cos(a);
  float w = uW * 0.5 * (0.16 + 0.84 * abs(c));
  vec2 p = aC + aN * (aS * w + sin(a) * uW * 0.14);
  p.y -= uScroll;
  vS = aS; vC = c; vL = aL;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
}`;
const FS = `
uniform vec3 uDeep, uMid, uHi; uniform float uHead, uAlpha;
varying float vS; varying float vC; varying float vL;
void main(){
  float vis = 1.0 - smoothstep(uHead - 160.0, uHead, vL);
  if (vis < 0.002) discard;
  float front = step(0.0, vC), lit = abs(vC);
  vec3 col = mix(uDeep, uMid, mix(0.42, 1.0, front) * (0.6 + 0.4 * lit));
  float across = vS * (front * 2.0 - 1.0);
  float spec = pow(max(0.0, 1.0 - abs(across - 0.3) * 2.4), 5.0) * lit;
  col += uHi * spec * (0.2 + 0.5 * front);
  col *= 0.84 + 0.16 * (1.0 - vS * vS);
  gl_FragColor = vec4(col, vis * uAlpha);
}`;

const V3 = (hex) => new THREE.Vector3(parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255);

// Catmull-Rom through the anchors, then resampled every `step` px of length
function sample(pts, step) {
  const dense = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < 40; k++) {
      const t = k / 40, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      dense.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  dense.push(pts[pts.length - 1]);
  const out = [dense[0]];
  let acc = 0;
  for (let i = 1; i < dense.length; i++) {
    const [ax, ay] = dense[i - 1], [bx, by] = dense[i];
    let seg = Math.hypot(bx - ax, by - ay), s0 = 0;
    while (acc + seg - s0 >= step) {
      const need = step - acc; s0 += need; acc = 0;
      const t = s0 / seg;
      out.push([ax + (bx - ax) * t, ay + (by - ay) * t]);
    }
    acc += seg - s0;
  }
  out.push(dense[dense.length - 1]);
  return out;
}

export function createTrail(scene, device, routes) {
  const small = () => window.innerWidth < 700;
  const runs = [];

  function makeRun(pts) {
    const P = sample(pts, 5), n = P.length;
    const aC = new Float32Array(n * 4), aN = new Float32Array(n * 4), aS = new Float32Array(n * 2), aL = new Float32Array(n * 2);
    const L = new Float32Array(n), ymax = new Float32Array(n);
    let len = 0, ym = -1e9, y0 = 1e9, y1 = -1e9;
    for (let i = 0; i < n; i++) {
      if (i) len += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
      const a = P[Math.max(0, i - 2)], b = P[Math.min(n - 1, i + 2)];
      let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      for (let s = 0; s < 2; s++) {
        const j = i * 2 + s;
        aC[j * 2] = P[i][0]; aC[j * 2 + 1] = P[i][1];
        aN[j * 2] = -ty; aN[j * 2 + 1] = tx;
        aS[j] = s ? 1 : -1; aL[j] = len;
      }
      L[i] = len; ym = Math.max(ym, P[i][1]); ymax[i] = ym;
      y0 = Math.min(y0, P[i][1]); y1 = Math.max(y1, P[i][1]);
    }
    const idx = [];
    for (let i = 0; i < n - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 2 * 3), 3));
    g.setAttribute('aC', new THREE.BufferAttribute(aC, 2)); g.setAttribute('aN', new THREE.BufferAttribute(aN, 2));
    g.setAttribute('aS', new THREE.BufferAttribute(aS, 1)); g.setAttribute('aL', new THREE.BufferAttribute(aL, 1));
    g.setIndex(idx);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uScroll: { value: 0 }, uTime: { value: 0 }, uW: { value: small() ? 12 : 20 }, uTw: { value: small() ? 520 : 800 }, uHead: { value: 0 }, uAlpha: { value: 0.55 },
        uDeep: { value: V3('#07501f') }, uMid: { value: V3('#00D84F') }, uHi: { value: V3('#eaffef') },
      },
      vertexShader: VS, fragmentShader: FS, transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(g, mat); mesh.frustumCulled = false; mesh.renderOrder = 2;
    scene.add(mesh);
    return { mesh, mat, L, ymax, n, y0, y1, head: 0 };
  }

  function rebuild() {
    runs.splice(0).forEach((r) => { scene.remove(r.mesh); r.mesh.geometry.dispose(); r.mat.dispose(); });
    const sy = window.scrollY;
    for (const route of routes) {
      const pts = [];
      for (const [sel, fx, fy, only] of route) {
        if ((only === 'm' && !small()) || (only === 'd' && small())) continue;
        const el = document.querySelector(sel);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        pts.push([r.left + r.width * fx, r.top + sy + r.height * fy]);
      }
      if (pts.length > 1) runs.push(makeRun(pts));
    }
  }

  return {
    rebuild,
    update(dt, t, scrollY, H) {
      const reach = scrollY + H * 0.82;
      for (const r of runs) {
        // head: the furthest point whose page-y the reader has reached
        let lo = 0, hi = r.n - 1, k = -1;
        while (lo <= hi) { const m = (lo + hi) >> 1; if (r.ymax[m] <= reach) { k = m; lo = m + 1; } else hi = m - 1; }
        const target = k < 0 ? 0 : r.L[k] + 160;
        r.head = damp(r.head, target, 4, dt);
        const on = r.head > 1 && r.y0 - scrollY < H + 80 && r.y1 - scrollY > -80;
        r.mesh.visible = on;
        if (!on) continue;
        const u = r.mat.uniforms;
        u.uScroll.value = scrollY; u.uTime.value = t; u.uHead.value = r.head;
      }
    },
  };
}
