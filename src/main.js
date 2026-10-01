import { detectDevice } from './engine/device.js';
import { createPointer } from './engine/pointer.js';
import { createBus } from './engine/bus.js';
import { clamp, damp } from './engine/util.js';
import { createStage } from './fx/stage.js';
import { createRibbons } from './fx/ribbons.js';
import { createDust } from './fx/dust.js';
import { createMatter } from './fx/matter.js';
import { createScan } from './fx/scan.js';
import { createTrail } from './fx/trail.js';
import { ROUTES } from './fx/routes.js';
import { createCards } from './ui/cards.js';
import { initSound, sound } from './ui/sound.js';
import { initReveals } from './ui/reveal.js';
import { fillContent } from './sections/content.js';
import { createHero } from './sections/hero.js';
import { createMuleta } from './sections/muleta.js';
import { createFexw } from './sections/fexw.js';
import { createReel } from './sections/reel.js';
import { createVoyage } from './sections/voyage.js';

// ——— Director: one canvas, one loop. Sections are either PINNED scenes
// (hero, muleta, fex, vsl, voyage — scroll-scrubbed) or FLOWING content
// (revealed as it enters, crossed by the page-anchored green line). Page
// tone follows the section in view; the hero hands over through its scan.

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo(0, 0);

const device = detectDevice();
const root = document.documentElement;
if (device.reduced) root.classList.add('reduced');
// PHONES: a straight, natural page. No pinned (sticky) scenes, no scroll-scrubbing:
// each scene fits one screen and plays on its own when it comes into view.
const MOBILE = device.coarse && Math.min(window.innerWidth, screen.width || 9999) < 900;
if (MOBILE) root.classList.add('m');
const TIMED = { tese: 6.5, fex: 6 };   // seconds each scene takes to play on phones
const pointer = createPointer();
const bus = createBus();

fillContent();
initReveals();
initSound();
// the diploma lands → thud + chime
document.querySelector('.certz__drop')?.addEventListener('revealed', () => setTimeout(() => sound.play('land'), 760));

const TONES = { dark: '#070707', cream: '#EEEAE2', white: '#F6F4EF', black: '#0b0b0a', sea: '#EEEAE2' };
const DARK = new Set(['dark', 'black']);
// screen-space ribbons only where a pinned scene wants one: [{a, y}] per band
const RIB = { tese: [{ a: 0.7, y: 0.72 }], vsl: [{ a: 0.6, y: -1.0 }, { a: 0.5, y: 1.05 }] };
const secs = [...document.querySelectorAll('.sec')].map((el, i) => ({ el, id: el.id || el.classList[1] || 'sec' + i, tone: el.dataset.tone, pinned: !!el.querySelector(':scope > .pin') }));
const canvas = document.querySelector('.fx');
let stage = null, ribbons = null, dust = null, matter = null, scan = null, trail = null;
try {
  stage = createStage(canvas, device);
  ribbons = createRibbons(stage.scene, device);
  dust = createDust(stage.overlay, device.tier === 'high' ? 700 : 380);
  matter = createMatter(stage.overlay, device.tier === 'high' ? 4000 : 1800);
  scan = createScan(stage.back);
  trail = createTrail(stage.back, device, ROUTES);
} catch { root.classList.add('no-webgl'); }
const nullMatter = { add() { return {}; }, get() {}, alpha: 0, home: {}, update() {}, pulse() {} };
const M = matter || nullMatter;
const D = dust || { burst() {}, update() {} };
const SC = scan || { set() {} };
const cards = createCards(device);
cards.scan();

const byId = (id) => secs.find((s) => s.id === id);
const ctl = {
  hero: createHero({ el: byId('hero').el, matter: M, pointer, device, dust: D, scan: SC, next: () => byId('tese').top, mobile: MOBILE }),
  tese: createMuleta({ el: byId('tese').el, dust: D }),
  fex: createFexw({ el: byId('fex').el }),
  vsl: createReel({ el: byId('vsl').el, bus, pointer, device, mobile: MOBILE }),
  ferramentas: createVoyage({ el: byId('ferramentas').el, mobile: MOBILE }),
};
const prepared = new Set();

pointer.onDown((x, y, e) => {
  if (e.target.closest && e.target.closest('a,button,summary,input,video,iframe')) return;
  if (ctl.hero.tap()) return;
  M.pulse(x, y); D.burst(x, y, 24, 220, DARK.has(root.dataset.tone));
});

// ——— sizing ———
let W = 1, H = 1;
function size() {
  W = window.innerWidth; H = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, device.dprCap);
  if (stage) { stage.resize(W, H, dpr); dust.setDpr(dpr); matter.setDpr(dpr); }
  // phones: the canvas must match the visible height exactly (Safari toolbars), or it stretches
  if (MOBILE) canvas.style.height = H + 'px';
  secs.forEach((s) => { const r = s.el.getBoundingClientRect(); s.top = r.top + window.scrollY; s.h = s.el.offsetHeight; });
}
size();

// ——— readiness ———
let ready = false;
const logo = document.querySelector('#hero .logo');
const imgOk = logo.complete && logo.naturalWidth ? Promise.resolve() : new Promise((r) => { logo.addEventListener('load', r, { once: true }); logo.addEventListener('error', r, { once: true }); });
const fonts = document.fonts ? Promise.all(['900 64px Montserrat', '800 40px Montserrat', '300 20px Montserrat', '600 12px Montserrat'].map((f) => document.fonts.load(f))) : Promise.resolve();
Promise.race([Promise.all([imgOk, fonts]), new Promise((r) => setTimeout(r, 3500))]).then(function boot() {
  if (window.innerWidth < 2 || logo.getBoundingClientRect().width < 2) { setTimeout(boot, 150); return; }
  size();
  trail?.rebuild();
  if (ctl.hero.prepare()) prepared.add('hero');
  ready = true;
  ctl.hero.setReady();
});

// ——— loop ———
const header = document.querySelector('.top'), bar = document.querySelector('.top__progress i');
let last = performance.now(), raf = 0, time = 0, sy = window.scrollY, vel = 0;
let ribTarget = [];
const hexRgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const bg = hexRgb(TONES.dark);

function step(rawDt) {
  const dt = Math.min(rawDt, 1 / 20);
  time += dt;
  pointer.update(dt);
  const y = window.scrollY;
  vel = damp(vel, (y - sy) / Math.max(dt, 1e-4), 8, dt); sy = y;

  // which section owns the centre of the screen → page tone + ribbons
  let cur = secs[0];
  for (const s of secs) { if (y + H * 0.5 >= s.top) cur = s; }
  // the hero turns the page cream itself (render-scan) before handing over
  const heroLight = cur.id === 'hero' && ctl.hero.light;
  const tone = heroLight ? 'cream' : cur.tone;
  if (root.dataset.tone !== tone) {
    root.dataset.tone = tone;
    root.dataset.light = DARK.has(tone) ? '0' : '1';
  }
  ribTarget = (RIB[cur.id] || []).map((r) => r || { a: 0 });
  // page colour follows the section, eased in the loop (in sync with scroll)
  const heroFull = cur.id === 'hero' && ctl.hero.full;
  const tc = hexRgb(TONES[cur.id === 'hero' && !heroFull ? 'dark' : tone]);
  for (let k = 0; k < 3; k++) bg[k] = heroFull ? tc[k] : damp(bg[k], tc[k], MOBILE ? 9 : 4.5, dt);
  document.body.style.backgroundColor = `rgb(${bg[0] | 0},${bg[1] | 0},${bg[2] | 0})`;

  // pinned scenes
  let matterWanted = 0;
  for (const s of secs) {
    const c = ctl[s.id];
    if (!c) continue;
    const near = y > s.top - H * 1.2 && y < s.top + s.h + H * 0.2;
    if (!near || !ready) { if (s.awake) { c.sleep?.(); s.awake = false; } if (s.id === 'hero') SC.set(0, 0, 0, 0, W, H); continue; }
    if (c.prepare && !prepared.has(s.id)) { if (c.prepare()) prepared.add(s.id); }
    const len = Math.max(1, s.h - H);
    let p = clamp((y - s.top) / len);
    if (MOBILE && TIMED[s.id]) {
      // phones: the scene plays by itself while it is (mostly) on screen
      const r = s.el.getBoundingClientRect();
      if (r.top < H * 0.4 && r.bottom > H * 0.6) s.tp = Math.min(1, (s.tp || 0) + dt / TIMED[s.id]);
      p = s.tp || 0;
    }
    const weight = clamp(1 - Math.abs((y + H / 2) - (s.top + s.h / 2)) / (s.h / 2 + H / 2)) ;
    c.update(dt, p, W, H, time, weight, vel);
    s.awake = true;
    if (s.id === 'hero') matterWanted = 1;
  }

  // while the VSL plays full screen, the canvas behind it rests (smoother video)
  const resting = ctl.vsl.watching;
  if (stage && !resting) {
    if (!matterWanted) M.alpha = 0;
    M.update(dt, time, pointer);
    trail.update(dt, time, y, H);
    D.update(dt, pointer, DARK.has(tone), !device.reduced);
    ribbons.update(dt, time, ribTarget, DARK.has(tone), stage.halfH, vel);
    stage.render();
  }
  if (!resting) cards.update(dt, H);

  // header
  const prog = clamp(y / Math.max(1, document.documentElement.scrollHeight - H));
  bar.style.transform = `scaleX(${prog.toFixed(4)})`;
  header.classList.toggle('is-scrolled', y > 40);
}

const tick = (now) => { raf = requestAnimationFrame(tick); step((now - last) / 1000); last = now; };
raf = requestAnimationFrame(tick);
document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); } });

let rt = 0;
window.addEventListener('resize', () => {
  clearTimeout(rt);
  // phones fire resize when the address bar slides: only a width change re-samples
  const w0 = W;
  rt = setTimeout(() => { size(); if (W !== w0 || !device.coarse) { prepared.clear(); trail?.rebuild(); } }, 180);
});
// content height can change after boot (fonts, images, accordions): keep the
// section offsets that drive the pinned scenes in sync
if ('ResizeObserver' in window) {
  let lastH = 0;
  new ResizeObserver(() => {
    const h = document.documentElement.scrollHeight;
    if (h === lastH) return;
    lastH = h;
    secs.forEach((s) => { const r = s.el.getBoundingClientRect(); s.top = r.top + window.scrollY; s.h = s.el.offsetHeight; });
    if (ready) trail?.rebuild();
  }).observe(document.querySelector('main'));
}

if (new URLSearchParams(location.search).has('debug')) {
  window.__fex = {
    device, secs, ctl, stage, trail,
    advance(sec, fps = 60) { for (let i = 0; i < sec * fps; i++) step(1 / fps); },
    go(id, p = 0, settle = 1) { const s = byId(id); window.scrollTo(0, s.top + p * Math.max(1, s.h - H)); this.advance(settle); },
  };
}
