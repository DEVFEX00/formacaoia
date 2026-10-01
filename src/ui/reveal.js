// Typography motion: word-by-word masked reveals, Lusion-style letter roll
// on hover, number counters, and the brand's green highlighter stroke.

// on narrow screens a multi-word highlight can't stay on one line: give each
// word its own marker so the phrase may wrap
export function splitHl(root) {
  if (window.innerWidth >= 700) return;
  root.querySelectorAll('.hl').forEach((hl) => {
    const t = hl.textContent.trim();
    if (!/\s/.test(t) || hl.children.length) return;
    const cls = hl.className;
    hl.outerHTML = t.split(/\s+/).map((w) => `<span class="${cls}">${w}</span>`).join(' ');
  });
}

export function splitWords(el) {
  if (el.dataset.splitDone || !el.textContent.trim()) return; // empty: filled (and split) later
  el.dataset.splitDone = '1';
  splitHl(el);
  let i = 0;
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const part of child.textContent.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); continue; }
          const w = document.createElement('span'); w.className = 'word';
          const inner = document.createElement('span'); inner.className = 'word__in'; inner.style.setProperty('--i', i++);
          inner.textContent = part; w.appendChild(inner); frag.appendChild(w);
        }
        child.replaceWith(frag);
      } else if (child.nodeType === 1 && child.tagName !== 'BR') walk(child);
    }
  };
  walk(el);
}

// AI "decode": each letter cycles through random glyphs and locks into place,
// left to right, as the word rises (run once; reduced motion skips it)
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@*+=';
export function scramble(root, dur = 900) {
  if (document.documentElement.classList.contains('reduced')) return;
  const items = [...root.querySelectorAll('.word__in')].map((el) => ({ el, txt: el.textContent }));
  const total = items.reduce((s, it) => s + it.txt.length, 0) || 1;
  let k = 0;
  items.forEach((it) => { it.at = [...it.txt].map(() => ((k++ / total) * 0.6 + Math.random() * 0.3) * dur); });
  const t0 = performance.now();
  let last = 0;
  const tick = (now) => {
    const t = now - t0;
    if (t - last < 45 && t < dur) { requestAnimationFrame(tick); return; }
    last = t;
    let done = true;
    for (const it of items) {
      let s = '';
      [...it.txt].forEach((ch, i) => {
        if (t >= it.at[i] || ch === ' ') s += ch;
        else { done = false; const g = GLYPHS[(Math.random() * GLYPHS.length) | 0]; s += ch === ch.toLowerCase() ? g.toLowerCase() : g; }
      });
      it.el.textContent = s;
    }
    if (!done) requestAnimationFrame(tick);
    else items.forEach((it) => { it.el.textContent = it.txt; });
  };
  requestAnimationFrame(tick);
}

export function roll(el) {
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  el.innerHTML = [...text].map((ch, i) => {
    const c = ch === ' ' ? '&nbsp;' : ch;
    return `<span class="r" style="--i:${i}" aria-hidden="true"><span>${c}</span><span>${c}</span></span>`;
  }).join('');
}

function count(el) {
  const to = parseFloat(el.dataset.count), dur = 1400, t0 = performance.now();
  const fmt = (v) => (Number.isInteger(to) ? Math.round(v) : v.toFixed(1)).toString();
  const tick = (now) => {
    const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    el.textContent = fmt(to * e);
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function initReveals(root = document) {
  splitHl(root);
  root.querySelectorAll('[data-split]').forEach(splitWords);
  root.querySelectorAll('[data-roll]').forEach(roll);
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('in');
      if (e.target.hasAttribute('data-decode')) scramble(e.target, 1100);
      e.target.dispatchEvent(new CustomEvent('revealed'));
      e.target.querySelectorAll('[data-count]').forEach(count);
      if (e.target.dataset.count) count(e.target);
      io.unobserve(e.target);
    }
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  root.querySelectorAll('[data-split], .reveal, .hl, .stat, .module, .track, .why__item, .upd-item, [data-count], [data-io]').forEach((el) => {
    if (!el.closest('.pin')) io.observe(el);
  });
  return io;
}
