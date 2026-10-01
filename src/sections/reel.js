import { seg, damp, easeInOutCubic, stylers } from '../engine/util.js';
import { createVslPlayer } from '../ui/vsl-player.js';
import { splitWords } from '../ui/reveal.js';
import { vsl } from '../content.js';

const S = stylers();

// 05 — VSL as a "play reel": a small film card in the page grows with the
// scroll until it fills the screen; a "Play" label follows the cursor over it.
// Pressing play opens it fully at once (and scrolls to that point), so the
// video is never watched through the small window.
export function createReel({ el, bus, pointer, device }) {
  const head = el.querySelector('.reel__head'), frame = el.querySelector('.reel__frame'), vslEl = el.querySelector('.vsl'), label = el.querySelector('.reel__cursor');
  el.querySelector('.reel__head .kicker').textContent = vsl.kicker;
  const title = el.querySelector('.reel__title'); title.textContent = vsl.title; splitWords(title);
  const player = createVslPlayer(vslEl, vsl.media, bus);
  const st = { lx: 0, ly: 0, force: false, og: 0, guard: 0 };
  const video = vslEl.querySelector('video');
  if (video) {
    video.addEventListener('play', () => {
      st.force = true; st.guard = performance.now() + 1600;
      const top = el.getBoundingClientRect().top + window.scrollY, open = top + 0.64 * (el.offsetHeight - window.innerHeight);
      if (window.scrollY < open - 4) window.scrollTo({ top: open, behavior: 'smooth' });
    });
  }
  const edge = document.createElement('i');
  edge.className = 'reel__edge'; edge.setAttribute('aria-hidden', 'true');
  frame.after(edge);

  function update(dt, p, W, H) {
    player.warm?.();   // the section is near: start buffering now, not on click
    title.classList.toggle('in', p > 0.001 || el.getBoundingClientRect().top < H * 0.6);
    st.og = damp(st.og, st.force ? 1 : 0, 5, dt);
    const g = Math.max(easeInOutCubic(seg(p, 0.08, 0.6)), easeInOutCubic(st.og));
    // the small card starts just under the headline and never runs off-screen
    const below = head.offsetTop + head.offsetHeight + 28;
    const w0 = Math.min(W * (W < 700 ? 0.86 : 0.5), 820, (H - below - 28) * 16 / 9), h0 = w0 * 9 / 16;
    const w = w0 + (W - w0) * g, h = h0 + (H - h0) * g;
    const top = below * (1 - g), left = (W - w) / 2;
    const r = 26 * (1 - g);
    S(frame)('clipPath', `inset(${top.toFixed(1)}px ${(W - left - w).toFixed(1)}px ${(H - top - h).toFixed(1)}px ${left.toFixed(1)}px round ${r.toFixed(1)}px)`);
    S(edge)('transform', `translate3d(${left.toFixed(1)}px,${top.toFixed(1)}px,0)`);
    S(edge)('width', `${w.toFixed(1)}px`); S(edge)('height', `${h.toFixed(1)}px`);
    S(edge)('borderRadius', `${r.toFixed(1)}px`); S(edge)('opacity', (1 - g).toFixed(3));
    S(head)('opacity', (1 - seg(p, 0.2, 0.42)).toFixed(3));
    S(head)('transform', `translate3d(0,${(-seg(p, 0, 0.42) * 60).toFixed(1)}px,0)`);
    // Lusion-style cursor label over the film
    const inside = pointer.active && !device.coarse && pointer.x > left && pointer.x < left + w && pointer.y > top && pointer.y < top + h;
    st.lx = damp(st.lx, pointer.x, 10, dt); st.ly = damp(st.ly, pointer.y, 10, dt);
    S(label)('transform', `translate3d(${st.lx.toFixed(1)}px,${st.ly.toFixed(1)}px,0) translate(-50%,-50%) scale(${inside ? 1 : 0.4})`);
    S(label)('opacity', inside ? '1' : '0');
    if ((p > 0.97 || p < 0.02) && performance.now() > st.guard) { player.pause(); st.force = false; }
  }
  return {
    update,
    sleep: () => { player.pause(); st.force = false; },
    // video open and playing: the page animations can rest (smoother playback)
    get watching() { return !!player.playing && st.og > 0.98; },
  };
}
