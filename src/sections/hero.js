import { clamp, seg, damp, lerp, easeInOutCubic, stylers } from '../engine/util.js';
import { sampleImage } from '../engine/sampler.js';
import { splitWords, scramble } from '../ui/reveal.js';
import { hero as copy } from '../content.js';
import { sound } from '../ui/sound.js';

const S = stylers();
const INTRO_END = 3.7;

// 01 — HERO. Black, centred, fast. A seed of light bursts into particles
// that assemble the FEX mark in the middle of the screen; a green sweep and
// a shockwave reveal it; then the mark rises and opens — a green line
// unfolds from it and the offer decodes underneath, letter by letter. The cursor (or finger) tears through the mark.
// One scroll gesture (not a long scroll): the copy lifts, the mark explodes
// into a pixel grid and the page "renders" — a green front turns every cell
// cream (see fx/scan.js) — then the page lands on the next chapter.
export function createHero({ el, matter, pointer, device, dust, scan, next, mobile }) {
  const logoImg = el.querySelector('.logo'), sweepEl = el.querySelector('.logo-sweep'), logoWrap = el.querySelector('.hero__logo');
  const ring = el.querySelector('.hero__ring'), glow = el.querySelector('.hero__glow'), open = el.querySelector('.hero__open');
  const title = el.querySelector('.hero__title'), sub = el.querySelector('.hero__sub'), lede = el.querySelector('.hero__lede');
  const actions = el.querySelector('.hero__actions'), cue = el.querySelector('.hero__cue'), copyEl = el.querySelector('.hero__copy');
  title.innerHTML = `${copy.title[0]}<br class="br-d"> <span class="hl hl--glow">${copy.title[1]}</span>`;
  splitWords(title);
  sub.innerHTML = copy.sub;
  splitWords(sub);
  lede.innerHTML = copy.lede;

  const st = { ready: false, clock: 0, readyAt: 0, ignite: null, ts: 1, logoT: null, rang: false, blown: false, light: false, full: false, decoded: false };
  if (device.reduced) st.ignite = -100;

  function prepare() {
    const r = logoImg.getBoundingClientRect();
    if (r.width < 2) return false;
    st.logoT = matter.add('logo', logoImg, sampleImage(logoImg, r.width, r.height, 2400));
    return true;
  }

  // ——— desktop: the hand-over is automatic — one scroll gesture plays the
  // whole transition and lands on the next chapter; scrolling up from there
  // plays it backwards. Touch screens never fight the finger: there the
  // transition simply follows a short, native scroll (inertia included). ———
  const AUTO = 1.7;
  const AUTO_MODE = !device.coarse && !mobile;
  if (!AUTO_MODE && !mobile) el.style.setProperty('--len', '1.8');   // large touch screens: short native scroll
  const auto = { ap: 0, dir: 0, lockUntil: 0, touchY: null };
  const busy = () => auto.dir !== 0 || performance.now() < auto.lockUntil;
  const nearTop = () => window.scrollY < 40;
  const nearNext = () => Math.abs(window.scrollY - next()) < 40;
  function go(dir) {
    if (auto.dir) return;
    if (dir > 0 && auto.ap < 1) auto.dir = 1;
    else if (dir < 0 && auto.ap > 0) auto.dir = -1;
    else return;
    window.scrollTo(0, 0);
  }
  function intent(dy, e) {
    if (document.documentElement.classList.contains('lead-open')) return;   // the form pop-up owns the scroll
    const stop = () => { if (e.cancelable) e.preventDefault(); };
    if (busy()) { if (window.scrollY < next() + 40) stop(); return; }
    if (dy > 0 && nearTop() && auto.ap < 1) { stop(); go(1); }
    else if (dy < 0 && nearNext() && auto.ap > 0) { stop(); go(-1); }
  }
  if (AUTO_MODE) {
  window.addEventListener('wheel', (e) => { if (Math.abs(e.deltaY) > 1) intent(e.deltaY, e); }, { passive: false });
  window.addEventListener('touchstart', (e) => { auto.touchY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (auto.touchY == null) return;
    const dy = auto.touchY - e.touches[0].clientY;
    if (busy() || Math.abs(dy) > 8) intent(dy || 1, e);
  }, { passive: false });
  window.addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    const d = ['ArrowDown', 'PageDown', ' ', 'End'].includes(e.key) ? 1 : ['ArrowUp', 'PageUp', 'Home'].includes(e.key) ? -1 : 0;
    if (d) intent(d, e);
  });
  }

  function update(dt, _p, W, H) {
    // advance the hand-over; arrivals by link or scrollbar settle to match
    if (mobile) {
      // phones: one screen; the first swipe plays the hand-over on its own (no lock),
      // returning to the very top plays it back
      const target = window.scrollY > 24 ? 1 : 0;
      auto.ap = clamp(auto.ap + Math.sign(target - auto.ap) * (dt / 1.3));
    } else if (!AUTO_MODE) { /* large touch screens: progress comes straight from the scroll */ }
    else if (auto.dir) {
      auto.ap = clamp(auto.ap + (auto.dir * dt) / AUTO);
      if (auto.dir > 0 && auto.ap >= 1) { auto.dir = 0; window.scrollTo(0, next()); auto.lockUntil = performance.now() + 550; }
      else if (auto.dir < 0 && auto.ap <= 0) { auto.dir = 0; auto.lockUntil = performance.now() + 400; }
    } else if (performance.now() >= auto.lockUntil) {
      const y = window.scrollY;
      if (y >= next() - 4) auto.ap = 1;
      else if (y >= 4 || auto.ap >= 1) go(auto.ap >= 1 ? -1 : 1);
    }
    const p = AUTO_MODE || mobile ? auto.ap : _p;
    st.clock += dt * st.ts;
    const scrolled = auto.dir > 0 || window.scrollY > 4;
    if (st.ready && st.ignite === null && (st.clock > st.readyAt + 0.25 || scrolled)) st.ignite = st.clock;
    const tI = st.ignite === null ? -1 : st.clock - st.ignite;
    st.ts = tI >= 0 && tI < INTRO_END && scrolled ? 4 : 1;
    // the mark is born centred and a little larger, then rises into place
    const rise = device.reduced ? 1 : easeInOutCubic(seg(tI, 1.95, 2.65));
    const center = logoWrap.parentElement, lw = logoImg.offsetWidth, lh = logoImg.offsetHeight;
    const homeY = center.offsetTop + logoWrap.offsetTop + logoWrap.offsetHeight / 2;
    const sc = 1 + 0.28 * (1 - rise);
    S(logoWrap)('transform', `translate3d(0,${((H / 2 - homeY) * (1 - rise)).toFixed(1)}px,0) scale(${sc.toFixed(4)})`);
    S(open)('transform', `translateX(-50%) scaleX(${seg(tI, 1.95, 2.5).toFixed(3)})`);
    S(open)('opacity', (seg(tI, 1.95, 2.1) * (1 - seg(tI, 2.7, 3.4))).toFixed(3));
    const lr = logoImg.getBoundingClientRect();
    const cx = lr.left + lr.width / 2, cy = lr.top + lr.height / 2;

    // ——— intro: seed → burst → mark → sweep + shockwave ———
    if (tI < 0) {
      matter.seedX = cx; matter.seedY = cy;
      matter.seedGlow = seg(st.clock, 0.1, 0.6) * 0.9;
    } else matter.seedGlow = device.reduced ? 0 : tI < 0.15 ? 1 + (tI / 0.15) : 2 * (1 - seg(tI, 0.15, 0.9));
    matter.birth = device.reduced ? 1 : seg(tI, 0.02, 0.9);
    const reveal = device.reduced ? 1 : easeInOutCubic(seg(tI, 1.4, 1.95));
    if (tI > 1.4 && !st.rang) { st.rang = true; ring.classList.add('go'); dust.burst(cx, cy, 70, 520, true); sound.play('reveal'); }

    // ——— scroll: copy lifts → mark bright → explosion → render-scan ———
    const exitCopy = easeInOutCubic(seg(p, 0.02, 0.18));
    const blow = seg(p, 0.24, 0.42);
    if (p > 0.24 && !st.blown) { st.blown = true; matter.pulse(cx, cy, Math.max(W, H) * 0.35, 1600); dust.burst(cx, cy, 90, 900, true); }
    if (p < 0.2) st.blown = false;
    const wide = seg(p, 0.2, 0.4);
    matter.home.x = W / 2; matter.home.y = lerp(H * 0.42, H / 2, wide);
    matter.home.rx = lerp(W * 0.46, W * 0.62, wide); matter.home.ry = lerp(H * 0.4, H * 0.62, wide);
    if (st.logoT) {
      st.logoT.mix = device.reduced ? 1 : seg(tI, 0.45, 1.5);
      st.logoT.out = blow;
      st.logoT.k = sc; st.logoT.dx = -(lw / 2) * (1 - sc); st.logoT.dy = -(lh / 2) * (1 - sc);   // follow the scaled mark
      st.logoT.sweep = reveal > 0 ? lr.left - 30 + reveal * (lw + 60) : NaN;
      st.logoT.sweepLive = reveal > 0 && reveal < 1;
      st.logoT.dimTo = lerp(0.22, 1, seg(p, 0.12, 0.22));      // the DOM mark hands over to the particles
    }
    matter.alpha = 1 - seg(p, 0.5, 0.82);
    const scanP = seg(p, 0.34, 0.93);
    if (p > 0.34 && !st.whooshed) { st.whooshed = true; sound.play('whoosh'); }
    if (p < 0.3) st.whooshed = false;
    const scanE = easeInOutCubic(scanP);
    scan.set(scanE, seg(p, 0.24, 0.34) * 0.07 * (1 - scanP), cx, cy, W, H);
    st.light = scanE > 0.62;   // header/text tone flips once most of the screen is cream
    st.full = scanP >= 1;      // the page colour flips only when the frame is fully covered

    // the DOM mark: sweep reveal, cursor/finger hole, hand-over on scroll
    S(logoImg)('clipPath', reveal >= 1 ? 'none' : `inset(-10% ${((1 - reveal) * 100).toFixed(2)}% -10% 0)`);
    S(sweepEl)('left', `${(reveal * 100).toFixed(2)}%`);
    S(sweepEl)('opacity', reveal > 0 && reveal < 1 ? '1' : '0');
    if (reveal >= 1 && pointer.active) {
      const mx = pointer.x - lr.left, my = pointer.y - lr.top;
      const near = clamp(1 - Math.hypot(Math.max(0, Math.abs(mx - lr.width / 2) - lr.width / 2), Math.max(0, Math.abs(my - lr.height / 2) - lr.height / 2)) / 90);
      S(logoImg)('--mx', `${mx.toFixed(1)}px`); S(logoImg)('--my', `${my.toFixed(1)}px`); S(logoImg)('--hole', `${(near * (50 + pointer.energy * 90)).toFixed(1)}px`);
    } else S(logoImg)('--hole', '0px');
    S(logoWrap)('opacity', (1 - seg(p, 0.12, 0.22)).toFixed(3));

    // copy
    title.classList.toggle('in', tI > 2.3);
    if (tI > 2.3 && !st.decoded) { st.decoded = true; scramble(title, 1000); }
    sub.classList.toggle('in', tI > 2.7);
    lede.classList.toggle('in', tI > 3.0);
    actions.classList.toggle('in', tI > 3.2);
    cue.classList.toggle('in', tI > 3.5 && p < 0.03);
    S(copyEl)('opacity', (1 - exitCopy).toFixed(3));
    S(copyEl)('transform', `translate3d(0,${(-exitCopy * 70).toFixed(1)}px,0)`);
    S(glow)('opacity', ((device.reduced ? 1 : seg(tI, 0.3, 1.6)) * (1 - seg(p, 0.1, 0.3))).toFixed(3));
  }

  return {
    prepare, update,
    get light() { return st.light; },
    get full() { return st.full; },
    setReady() { st.ready = true; st.readyAt = st.clock; },
    tap() { if (st.ready && st.ignite === null) { st.ignite = st.clock; return true; } return false; },
  };
}
