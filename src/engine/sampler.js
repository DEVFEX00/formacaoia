import { shuffleInPlace } from './util.js';

// Turns real DOM (the official logo image, live text) and procedural drawings
// into particle targets. Sampling the rendered element — instead of hand-made
// shapes — keeps particles pixel-aligned with the DOM they crossfade into.

function scratch(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return [c, c.getContext('2d', { willReadFrequently: true })];
}

function collect(ctx, w, h, step, classify, into, extra) {
  const data = ctx.getImageData(0, 0, w, h).data;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const k = (y * w + x) * 4;
      if (data[k + 3] < 120) continue;
      into.push({ x: x + (Math.random() - 0.5) * step * 0.6, y: y + (Math.random() - 0.5) * step * 0.6, g: classify(data[k], data[k + 1], data[k + 2]), ...extra });
    }
  }
  return into;
}

function take(pts, max) {
  shuffleInPlace(pts, max);
  return pts.length > max ? pts.slice(0, max) : pts;
}

// Points in the image's local px space.
export function sampleImage(img, width, height, max) {
  const w = Math.round(width), h = Math.round(height);
  if (w < 2 || h < 2) return [];
  const [, ctx] = scratch(w, h);
  ctx.drawImage(img, 0, 0, w, h);
  const step = w > 500 ? 2 : 1;
  // The green stroke of the FEX "E" keeps its colour as particles.
  return take(collect(ctx, w, h, step, (r, g) => (g > r + 60 ? 1 : 0), []), max);
}

// Procedural shapes: draw(ctx) into a w×h canvas (white = matter, green = accent).
export function sampleDraw(w, h, draw, max, step = 2) {
  const [, ctx] = scratch(w, h);
  draw(ctx, w, h);
  return take(collect(ctx, Math.ceil(w), Math.ceil(h), step, (r, g) => (g > r + 60 ? 1 : 0), []), max);
}

// Wraps words of an element's text into span.w (keeps .accent wrappers).
export function splitWords(el) {
  if (el.dataset.split) return;
  el.dataset.split = '1';
  const walk = (node, accent) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) {
        const parts = child.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        for (const part of parts) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); continue; }
          const s = document.createElement('span');
          s.className = accent ? 'w accent' : 'w';
          s.textContent = part;
          frag.appendChild(s);
        }
        child.replaceWith(frag);
      } else if (child.nodeType === 1 && !child.classList.contains('w')) {
        walk(child, accent || child.classList.contains('accent'));
      }
    }
  };
  walk(el, false);
}

// Re-draws each `.w` span at its exact laid-out position; every point carries
// its word order `o` (0..1) so scenes can build a sentence word by word.
// Coordinates are relative to `origin` (viewport px) — pass the stage rect.
export function sampleWords(container, max, originX, originY) {
  const words = [...container.querySelectorAll('.w')];
  const all = [];
  const n = words.length;
  words.forEach((span, wi) => {
    const r = span.getBoundingClientRect();
    if (r.width < 1) return;
    const cs = getComputedStyle(span);
    const pad = Math.ceil(parseFloat(cs.fontSize) * 0.35);
    const w = Math.ceil(r.width + pad * 2), h = Math.ceil(r.height + pad * 2);
    const [, ctx] = scratch(w, h);
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = cs.letterSpacing;
    const text = cs.textTransform === 'uppercase' ? span.textContent.toUpperCase() : span.textContent;
    const m = ctx.measureText(text);
    const asc = m.fontBoundingBoxAscent ?? m.actualBoundingBoxAscent;
    const desc = m.fontBoundingBoxDescent ?? m.actualBoundingBoxDescent;
    ctx.translate(pad, pad + r.height / 2 + (asc - desc) / 2);
    ctx.scale(m.width ? r.width / m.width : 1, 1);
    ctx.fillStyle = span.classList.contains('accent') ? '#00ff00' : '#ff0000';
    ctx.fillText(text, 0, 0);
    const size = parseFloat(cs.fontSize);
    const step = size > 70 ? 3 : size > 26 ? 2 : 1;
    const o = n > 1 ? wi / (n - 1) : 0;
    const pts = collect(ctx, w, h, step, (rr, g) => (g > rr ? 1 : 0), [], { o });
    const jit = 0.7 / Math.max(n, 2); // fragments of a word arrive slightly apart
    for (const p of pts) { p.x += r.left - pad - originX; p.y += r.top - pad - originY; p.o = Math.min(1, Math.max(0, o + (Math.random() - 0.5) * jit)); }
    all.push(...pts);
  });
  // keep every word represented proportionally
  return take(all, max);
}
