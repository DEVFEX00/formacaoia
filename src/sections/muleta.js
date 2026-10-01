import { clamp, seg, lerp, easeInOutCubic, easeInCubic, easeOutCubic, stylers } from '../engine/util.js';
import { buildMuleta, PIVOT } from '../illus/muleta.js';
import { splitWords } from '../ui/reveal.js';
import { thesis } from '../content.js';

const S = stylers();
const TIP = 1160;

// 02 — A MULETA: the scene explains the idea before the words do.
// The old desk → a giant crutch swings in → objects are knocked away one by
// one as the tip actually reaches them → only then: the sentence.
export function createMuleta({ el, dust }) {
  const m = buildMuleta(el.querySelector('.muleta__scene'));
  const cap = el.querySelector('.muleta__cap');
  const big = el.querySelector('.muleta__big');
  const turn = el.querySelector('.muleta__turn');
  big.innerHTML = `${thesis.big[0]} <span class="hl hl--solid">${thesis.big[1]}</span> ${thesis.big[2]}`;
  splitWords(big);
  const words = [...big.querySelectorAll('.word__in')];
  turn.querySelector('strong').textContent = thesis.turn;
  turn.querySelector('span').textContent = ' ' + thesis.turn2;
  const hl = big.querySelector('.hl');

  const angAt = (p) => {
    let a = lerp(-78, -40, easeOutCubic(seg(p, 0.08, 0.24)));
    a = lerp(a, -50, easeInOutCubic(seg(p, 0.24, 0.3)));
    a = lerp(a, 34, easeInCubic(seg(p, 0.3, 0.4)));
    return lerp(a, 72, easeOutCubic(seg(p, 0.4, 0.54)));
  };
  const tipX = (deg) => PIVOT.x - TIP * Math.sin((deg * Math.PI) / 180);
  const hitAt = (x) => { for (let p = 0.3; p < 0.56; p += 0.002) if (tipX(angAt(p)) <= x + 40) return p; return 0.5; };
  m.objs.forEach((o) => { o.hit = hitAt(o.x); o.dir = o.i % 2 ? 1 : -1; });
  const st = { impacted: false };

  function update(dt, p, W, H, t) {
    S(cap)('opacity', (seg(p, 0, 0.03) * (1 - seg(p, 0.16, 0.22))).toFixed(3));
    // the clock keeps ticking; the arm keeps typing (old routine)
    m.clockM.setAttribute('transform', `rotate(${(t * 36) % 360} 300 250)`);
    m.clockH.setAttribute('transform', `rotate(${(t * 3) % 360} 300 250)`);
    m.arm.setAttribute('transform', `translate(0 ${(Math.sin(t * 14) * 3 * (1 - seg(p, 0.36, 0.4))).toFixed(2)})`);

    const ang = angAt(p);
    m.crutch.setAttribute('transform', `translate(${PIVOT.x} ${PIVOT.y}) rotate(${ang.toFixed(2)})`);
    S(m.crutch)('opacity', (1 - seg(p, 0.56, 0.64)).toFixed(3));

    // impact
    const impactP = 0.365;
    if (p >= impactP && !st.impacted) {
      st.impacted = true;
      const r = m.svg.getBoundingClientRect(), k = r.width / 1600;
      dust.burst(r.left + 760 * k, r.top + (560 / 900) * r.height, 70, 420, false);
    } else if (p < impactP - 0.02) st.impacted = false;
    const ring = seg(p, impactP, impactP + 0.07);
    m.ring.setAttribute('r', (10 + ring * 520).toFixed(1));
    m.ring.setAttribute('opacity', (ring > 0 && ring < 1 ? 1 - ring : 0).toFixed(3));
    const shake = Math.max(0, 1 - Math.abs(p - impactP) / 0.02);
    S(m.svg)('transform', shake > 0 ? `translate(${((Math.random() - 0.5) * 16 * shake).toFixed(1)}px,${((Math.random() - 0.5) * 12 * shake).toFixed(1)}px)` : 'none');

    // the old world is knocked away (reversible)
    for (const o of m.objs) {
      const k = seg(p, o.hit, o.hit + (o.kind === 'person' ? 0.3 : 0.2));
      const w = o.kind === 'heavy' ? 0.7 : o.kind === 'person' ? 0.45 : 1.15;
      const dx = -(420 + o.i * 36) * w * k;
      const dy = -Math.sin(Math.PI * Math.min(1, k * 1.2)) * 220 * w + 1300 * k * k;
      const rot = o.dir * (o.kind === 'person' ? 28 : 150) * w * k;
      o.g.setAttribute('transform', k > 0 ? `translate(${dx.toFixed(1)} ${dy.toFixed(1)}) rotate(${rot.toFixed(1)} ${o.x} 560)` : '');
    }
    // paper sheets burst out of the stacks
    const burst = seg(p, impactP, 0.62);
    m.flyers.forEach((f, i) => {
      if (burst <= 0 || burst >= 1) { f.setAttribute('opacity', '0'); return; }
      const a = -2.6 + (i / m.flyers.length) * 2.2;
      const r = 120 + burst * (500 + (i % 4) * 90);
      const x = 880 + Math.cos(a) * r, y = 560 + Math.sin(a) * r * 0.6 + burst * burst * 500;
      f.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(burst * (200 + i * 40)).toFixed(1)})`);
      f.setAttribute('opacity', (1 - seg(burst, 0.7, 1)).toFixed(3));
    });

    // only now, the sentence
    const wIn = seg(p, 0.5, 0.68);
    words.forEach((w, i) => { const k = easeOutCubic(clamp(wIn * (1 + words.length * 0.18) - i * 0.18)); S(w)('transform', `translate3d(0,${((1 - k) * 115).toFixed(1)}%,0)`); });
    hl.classList.toggle('in', wIn > 0.8);
    S(big)('opacity', (1 - seg(p, 0.93, 1) * 0.0).toFixed(3));
    const tv = seg(p, 0.74, 0.84);
    S(turn)('opacity', tv.toFixed(3));
    S(turn)('transform', `translate3d(0,${((1 - tv) * 20).toFixed(1)}px,0)`);
    S(el.querySelector('.muleta__scene'))('opacity', (1 - seg(p, 0.6, 0.72) * 0.85).toFixed(3));
  }
  return { update };
}
