import { seg, easeOutCubic, stylers } from '../engine/util.js';
import { splitWords } from '../ui/reveal.js';
import { photos, institution, fexFlow } from '../content.js';
import { sound } from '../ui/sound.js';

const S = stylers();
const pad = (n) => String(n).padStart(2, '0');

// node centres (fractions of the screen) — zig-zag on desktop, 2×2 on phones
const POS_D = [[0.17, 0.44], [0.39, 0.61], [0.61, 0.42], [0.83, 0.59]];
const POS_M = [[0.27, 0.33], [0.73, 0.43], [0.27, 0.66], [0.73, 0.76]];

// 04 — FEX. A current of green energy runs across the black page and powers
// four real FEX moments one after another — CONHECIMENTO → EDUCAÇÃO →
// APLICAÇÃO → TECNOLOGIA. Each photo lights up in full colour as the current
// reaches it; then the current converges into INTELIGÊNCIA ARTIFICIAL and
// the institution says why it is here.
export function createFexw({ el }) {
  const pin = el.querySelector('.pin');
  const kick = el.querySelector('.fexw__kick'), svg = el.querySelector('.fexw__flow');
  const base = svg.querySelector('.flow-base'), lit = svg.querySelector('.flow-lit'), comet = svg.querySelector('.flow-comet'), head = svg.querySelector('.flow-head');
  const ia = el.querySelector('.fexw__ia'), about = el.querySelector('.fexw__about'), burst = el.querySelector('.fexw__burst');
  splitWords(ia);
  el.querySelector('.fexw__line1').innerHTML = fexFlow.line1;
  el.querySelector('.fexw__line2').textContent = fexFlow.line2;
  el.querySelector('.fexw__facts').innerHTML = institution.lines.map((l) => `<li>${l}</li>`).join('');
  const nodes = fexFlow.nodes.map((n, i) => {
    const f = document.createElement('figure');
    f.className = 'node';
    const ph = photos[n.photo];
    f.innerHTML = `<div class="node__img"><img src="${ph.src}" alt="${ph.alt}" decoding="async"></div><figcaption><span class="node__n">${pad(i + 1)}</span>${n.word}</figcaption>`;
    el.querySelector('.fexw__nodes').appendChild(f);
    return { f, img: f.querySelector('.node__img'), at: 0 };
  });
  let L = 1, W0 = 0, H0 = 0;

  function layout(W, H) {
    W0 = W; H0 = H;
    const P = W < 700 ? POS_M : POS_D;
    nodes.forEach((n, i) => { n.f.style.setProperty('--x', P[i][0]); n.f.style.setProperty('--y', P[i][1]); });
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    // path through the photo centres, ending where the final title appears
    const pinR = pin.getBoundingClientRect();
    const pts = nodes.map((n) => { const r = n.img.getBoundingClientRect(); return [r.left + r.width / 2 - pinR.left, r.top + r.height / 2 - pinR.top]; });
    pts.unshift([-0.06 * W, pts[0][1]]);
    pts.push([W / 2, H * (W < 700 ? 0.4 : 0.42)]);
    const segs = [];
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i], dx = (bx - ax) * 0.5;
      segs.push(`C${(ax + dx).toFixed(1)},${ay.toFixed(1)} ${(bx - dx).toFixed(1)},${by.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)}`);
    }
    const start = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    // length at which the current reaches each photo
    nodes.forEach((n, i) => { base.setAttribute('d', start + segs.slice(0, i + 1).join(' ')); n.at = base.getTotalLength(); });
    const d = start + segs.join(' ');
    [base, lit, comet].forEach((p) => p.setAttribute('d', d));
    L = base.getTotalLength();
    lit.style.strokeDasharray = `${L} ${L}`;
  }

  function prepare() { return true; }

  function update(dt, p, W, H) {
    if (W !== W0 || H !== H0) layout(W, H);
    const e = seg(p, 0.03, 0.6), eL = e * L;
    lit.style.strokeDashoffset = (L - eL).toFixed(1);
    const cl = Math.min(160, eL);
    comet.style.strokeDasharray = `${cl.toFixed(1)} ${L + 400}`;
    comet.style.strokeDashoffset = (-(eL - cl)).toFixed(1);
    const on = e > 0 && e < 1;
    if (on) { const pt = lit.getPointAtLength(eL); head.setAttribute('cx', pt.x.toFixed(1)); head.setAttribute('cy', pt.y.toFixed(1)); }
    S(head)('opacity', on ? '1' : '0');
    S(comet)('opacity', on ? '1' : '0');

    const fin = seg(p, 0.6, 0.7);
    nodes.forEach((n, i) => {
      const a = seg(eL, n.at - 70, n.at + 30);
      if (a > 0.5 && !n.pinged) { n.pinged = true; sound.play('ping', i); } else if (a < 0.1) n.pinged = false;
      const flash = a * (1 - seg(eL, n.at + 30, n.at + 520));
      S(n.f)('--a', a.toFixed(3));
      S(n.f)('--f', flash.toFixed(3));
      S(n.f)('opacity', (1 - fin * 0.84).toFixed(3));
      S(n.f)('filter', fin > 0.001 ? `blur(${(fin * 3).toFixed(2)}px)` : 'none');
    });
    S(svg)('opacity', (1 - seg(p, 0.66, 0.76) * 0.7).toFixed(3));
    S(kick)('opacity', (1 - fin).toFixed(3));
    ia.classList.toggle('in', p > 0.6);
    burst.classList.toggle('go', p > 0.6);
    const av = easeOutCubic(seg(p, 0.7, 0.8));
    S(about)('opacity', av.toFixed(3));
    S(about)('transform', `translate3d(0,${((1 - av) * 26).toFixed(1)}px,0)`);
  }
  return { prepare, update };
}
