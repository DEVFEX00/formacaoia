import * as THREE from 'three';

// Cursor dust (Lusion gesture): moving the pointer leaves soft particles that
// drift and fade. Colour follows the page tone (green + ink on light, green +
// cream on dark). Also used for bursts (impacts).
const VS = `attribute float aSize; attribute float aA; attribute vec3 aC; varying float vA; varying vec3 vC; uniform float uDpr;
void main(){ vA = aA; vC = aC; gl_PointSize = aSize * uDpr; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FS = `varying float vA; varying vec3 vC;
void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; if (d > 1.0) discard; float a = (1.0 - smoothstep(0.35, 1.0, d)) * vA; gl_FragColor = vec4(vC * a, a); }`;

export function createDust(overlay, count) {
  const P = new Float32Array(count * 3), V = new Float32Array(count * 2), life = new Float32Array(count), max = new Float32Array(count);
  const size = new Float32Array(count), A = new Float32Array(count), C = new Float32Array(count * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(P, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aA', new THREE.BufferAttribute(A, 1).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aC', new THREE.BufferAttribute(C, 3).setUsage(THREE.DynamicDrawUsage));
  const mat = new THREE.ShaderMaterial({ uniforms: { uDpr: { value: 1 } }, vertexShader: VS, fragmentShader: FS, transparent: true, depthTest: false, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false;
  overlay.add(pts);
  let head = 0, lx = null, ly = null;
  const GREEN = [0, 0.847, 0.31], INK = [0.08, 0.08, 0.08], CREAM = [0.93, 0.91, 0.87];

  function spawn(x, y, vx, vy, l, s, c) {
    const i = head; head = (head + 1) % count;
    P[i * 3] = x; P[i * 3 + 1] = y; V[i * 2] = vx; V[i * 2 + 1] = vy; life[i] = max[i] = l; size[i] = s;
    C[i * 3] = c[0]; C[i * 3 + 1] = c[1]; C[i * 3 + 2] = c[2];
  }
  return {
    setDpr(d) { mat.uniforms.uDpr.value = d; },
    burst(x, y, n = 40, speed = 260, dark = false) {
      for (let k = 0; k < n; k++) { const a = Math.random() * 6.283, v = speed * (0.3 + Math.random()); spawn(x, y, Math.cos(a) * v, Math.sin(a) * v, 0.8 + Math.random() * 0.8, 3 + Math.random() * 5, Math.random() < 0.7 ? GREEN : dark ? CREAM : INK); }
    },
    update(dt, pointer, dark, enabled) {
      if (enabled && pointer.active && pointer.type !== 'touch') {
        if (lx !== null) {
          const dx = pointer.x - lx, dy = pointer.y - ly, d = Math.hypot(dx, dy);
          const n = Math.min(6, Math.floor(d / 9));
          for (let k = 0; k < n; k++) {
            const t = k / Math.max(1, n);
            spawn(lx + dx * t + (Math.random() - 0.5) * 8, ly + dy * t + (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 40 + dx * 0.6, (Math.random() - 0.5) * 40 + dy * 0.6 - 10, 0.7 + Math.random() * 0.9, 2 + Math.random() * 4.5, Math.random() < 0.72 ? GREEN : dark ? CREAM : INK);
          }
        }
        lx = pointer.x; ly = pointer.y;
      } else { lx = ly = null; }
      if (enabled && pointer.type === 'touch' && pointer.touching && Math.random() < 0.6) spawn(pointer.x, pointer.y, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80, 0.7, 3 + Math.random() * 4, GREEN);
      for (let i = 0; i < count; i++) {
        if (life[i] <= 0) { A[i] = 0; continue; }
        life[i] -= dt;
        V[i * 2] *= 0.94; V[i * 2 + 1] = V[i * 2 + 1] * 0.94 - 4 * dt;
        P[i * 3] += V[i * 2] * dt; P[i * 3 + 1] += V[i * 2 + 1] * dt;
        const k = life[i] / max[i];
        A[i] = Math.min(1, k * 1.8) * 0.85;
      }
      geo.attributes.position.needsUpdate = geo.attributes.aA.needsUpdate = geo.attributes.aSize.needsUpdate = geo.attributes.aC.needsUpdate = true;
    },
  };
}
