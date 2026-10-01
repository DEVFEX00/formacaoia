import * as THREE from 'three';
import { clamp, easeInOutCubic } from '../engine/util.js';

// MATTER — screen-space green/cream particles that assemble into shapes
// anchored to DOM elements (the FEX logo in the hero, the keywords in the
// FEX section) and follow them as the page scrolls. Consecutive targets
// share particle indices, so one word morphs into the next. Preserved
// behaviours: seed of light, green reveal sweep, cursor breaks the ghost.

const VS = `attribute float aSize; attribute float aA; attribute float aG; varying float vA; varying float vG; uniform float uDpr;
void main(){ vA = aA; vG = aG; gl_PointSize = aSize * uDpr; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FS = `varying float vA; varying float vG;
void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; if (d > 1.0) discard;
  float a = (1.0 - smoothstep(0.0, 0.55, d) * 0.8 - d * 0.2) * vA;
  vec3 c = mix(vec3(0.93, 0.91, 0.87), vec3(0.0, 0.85, 0.31), vG); gl_FragColor = vec4(c * a, a); }`;

export function createMatter(overlay, N) {
  const P = new Float32Array(N * 3), size = new Float32Array(N), A = new Float32Array(N), G = new Float32Array(N);
  const ox = new Float32Array(N), oy = new Float32Array(N), vx = new Float32Array(N), vy = new Float32Array(N), heat = new Float32Array(N);
  const hx = new Float32Array(N), hy = new Float32Array(N), delay = new Float32Array(N), bright = new Float32Array(N), ph = new Float32Array(N), bd = new Float32Array(N);
  for (let i = 0; i < N; i++) { delay[i] = Math.random(); bd[i] = Math.random(); bright[i] = 0.25 + Math.random() * 0.6; ph[i] = Math.random() * 6.283; size[i] = base0(i); hx[i] = Math.random() * 2 - 1; hy[i] = Math.random() * 2 - 1; }
  function base0() { return 1.6 + Math.random() * 2.2; }
  const base = Float32Array.from(size);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(P, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aA', new THREE.BufferAttribute(A, 1).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aG', new THREE.BufferAttribute(G, 1).setUsage(THREE.DynamicDrawUsage));
  const mat = new THREE.ShaderMaterial({ uniforms: { uDpr: { value: 1 } }, vertexShader: VS, fragmentShader: FS, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false;
  overlay.add(pts);

  const seedMat = new THREE.ShaderMaterial({
    uniforms: { uA: { value: 0 } }, transparent: true, side: THREE.DoubleSide, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform float uA; varying vec2 vUv; void main(){ float d = length(vUv-0.5)*2.0; float a = (exp(-d*d*9.0)*0.5 + exp(-d*d*260.0)) * uA; gl_FragColor = vec4(vec3(0.0,0.85,0.31)*a + vec3(0.95)*exp(-d*d*900.0)*uA, a); }',
  });
  const seed = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), seedMat);
  overlay.add(seed);

  const targets = new Map();
  const M = {
    alpha: 0, birth: 1, seedX: 0, seedY: 0, seedGlow: 0,
    home: { x: 0, y: 0, rx: 300, ry: 200 },
    // target: points local to `el` rect; mix/out/k/ty/sweep are animated by sections
    add(id, el, points) {
      const n = Math.min(points.length, N);
      const tx = new Float32Array(n), ty = new Float32Array(n), tg = new Uint8Array(n);
      points.slice(0, n).forEach((p, k) => { tx[k] = p.x; ty[k] = p.y; tg[k] = p.g ? 1 : 0; });
      const T = { id, el, n, tx, ty, tg, mix: 0, out: 0, k: 1, dx: 0, dy: 0, sweep: NaN, sweepLive: false, dimTo: 0.22, cx: 0, cy: 0, cxLocal: el.offsetWidth / 2, cyLocal: el.offsetHeight / 2 };
      targets.set(id, T);
      return T;
    },
    get: (id) => targets.get(id),
    setDpr(d) { mat.uniforms.uDpr.value = d; },
    pulse(x, y, R = 240, F = 900) { for (let i = 0; i < N; i++) { const dx = P[i * 3] - x, dy = P[i * 3 + 1] - y, d = Math.hypot(dx, dy); if (d < R && d > 1) { const f = (1 - d / R) * F; vx[i] += (dx / d) * f; vy[i] += (dy / d) * f; heat[i] = 1; } } },
  };

  M.update = (dt, t, pointer) => {
    pts.visible = M.alpha > 0.002;
    seed.visible = M.seedGlow > 0.002;
    const S = 230 * (1 + Math.sin(t * 2.6) * 0.1) * (0.55 + 0.45 * Math.min(1.6, M.seedGlow));
    seed.position.set(M.seedX, M.seedY, 0); seed.scale.set(S, S, 1);
    seedMat.uniforms.uA.value = Math.min(1.4, M.seedGlow);
    if (!pts.visible) return;
    const active = [];
    targets.forEach((T) => {
      if (T.mix <= 0.0001) return;
      const r = T.el.getBoundingClientRect();
      T.ax = r.left; T.ay = r.top; T.cx = r.left + T.cxLocal; T.cy = r.top + T.cyLocal;
      active.push(T);
    });
    const pr = 130, force = 500 + 1500 * pointer.energy, decay = Math.exp(-dt * 2.4);
    const H = M.home;
    for (let i = 0; i < N; i++) {
      let b = clamp(M.birth * 1.5 - bd[i] * 0.5); b = 1 - Math.pow(1 - b, 3);
      let x = H.x + hx[i] * H.rx + Math.sin(t * 0.3 + ph[i]) * 10, y = H.y + hy[i] * H.ry + Math.cos(t * 0.25 + ph[i]) * 10;
      x = M.seedX + (x - M.seedX) * b; y = M.seedY + (y - M.seedY) * b;
      let a = bright[i] * Math.min(1, b * 2.5) * 0.5, g = 0, h = heat[i] * decay, grow = 0;
      for (const T of active) {
        if (i >= T.n) continue;
        const wIn = easeInOutCubic(clamp(T.mix * 1.6 - delay[i] * 0.6));
        const wOut = easeInOutCubic(clamp(T.out * 1.5 - (1 - delay[i]) * 0.5));
        const w = wIn * (1 - wOut);
        if (w <= 0) continue;
        const X = T.cx + (T.ax + T.tx[i] - T.cx) * T.k + T.dx, Y = T.cy + (T.ay + T.ty[i] - T.cy) * T.k + T.dy;
        const arc = w * (1 - w) * 4 * 140;
        x += (X - x) * w + Math.sin(ph[i]) * arc; y += (Y - y) * w + Math.cos(ph[i] * 1.7) * arc;
        let dv = 1;
        if (T.sweep === T.sweep) { const rel = T.sweep - (T.ax + T.tx[i]); dv = 1 - (1 - T.dimTo) * clamp(rel / 40 + 0.5); if (T.sweepLive && Math.abs(rel) < 22) h = 1; }
        a += (0.95 * dv - a) * w; g = Math.max(g, (T.green || T.tg[i]) * w); grow = Math.max(grow, (T.grow || 0) * w);
      }
      const px = x + ox[i], py = y + oy[i];
      let ax = -26 * ox[i] - 7.5 * vx[i], ay = -26 * oy[i] - 7.5 * vy[i];
      if (pointer.active) {
        const dx = px - pointer.x, dy = py - pointer.y, d2 = dx * dx + dy * dy;
        if (d2 < pr * pr && d2 > 1) { const d = Math.sqrt(d2), f = 1 - d / pr; ax += (dx / d) * f * f * force; ay += (dy / d) * f * f * force; h = Math.max(h, f * pointer.energy * 1.6); }
      }
      vx[i] += ax * dt; vy[i] += ay * dt; ox[i] += vx[i] * dt; oy[i] += vy[i] * dt; heat[i] = h;
      P[i * 3] = px; P[i * 3 + 1] = py;
      A[i] = Math.min(1, (a + h * 0.3) * M.alpha);
      G[i] = Math.min(1, g + h);
      size[i] = base[i] * (1 + grow);
    }
    geo.attributes.position.needsUpdate = geo.attributes.aA.needsUpdate = geo.attributes.aG.needsUpdate = geo.attributes.aSize.needsUpdate = true;
  };
  return M;
}
