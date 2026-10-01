export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const seg = (v, a, b) => clamp((v - a) / (b - a));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const easeInCubic = (t) => t * t * t;
export const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
export const fract = (x) => x - Math.floor(x);
export const hash = (n) => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453);
// A bump that rises at a, holds between b..c, and falls at d.
export const window4 = (v, a, b, c, d) => Math.min(seg(v, a, b), 1 - seg(v, c, d));

// Writes a style only when the value changed — avoids per-frame style thrash.
export function styler(el) {
  const cache = {};
  return (prop, val) => {
    if (cache[prop] === val) return;
    cache[prop] = val;
    if (prop.startsWith('--')) el.style.setProperty(prop, val);
    else el.style[prop] = val;
  };
}

// Memoised stylers keyed by element.
export function stylers() {
  const map = new Map();
  return (el) => {
    let s = map.get(el);
    if (!s) { s = styler(el); map.set(el, s); }
    return s;
  };
}

export function shuffleInPlace(arr, take = arr.length) {
  const n = arr.length;
  for (let i = 0; i < Math.min(take, n - 1); i++) {
    const j = i + Math.floor(Math.random() * (n - i));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

export const h = (tag, cls, html) => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (html != null) el.innerHTML = html;
  return el;
};
