// SOUND — everything is synthesised with Web Audio (no files, no licences).
// Ambient: a slow, soft pad (four maj9/min9 chords, low-passed, in a long
// reverb) with sparse high "sparkles". Effects: a quiet tick on hover, a tap
// on click, and moments of the story (logo reveal, page render, energy
// reaching a photo, the diploma landing). Off by default — browsers only
// allow sound after a click — and remembered for the next visit.

const CHORDS = [
  [130.81, 196.0, 246.94, 293.66, 329.63], // Cmaj9
  [110.0, 164.81, 196.0, 246.94, 261.63],  // Am9
  [87.31, 130.81, 164.81, 220.0, 261.63],  // Fmaj9
  [98.0, 146.83, 196.0, 220.0, 293.66],    // G6/9
];
const SPARK = [523.25, 587.33, 659.25, 783.99, 880.0, 987.77];
const KEY = 'fex-sound';

let ctx = null, master = null, music = null, fx = null, verb = null, on = false, timer = 0, chordIx = 0, lastTick = 0;
const listeners = new Set();

function impulse(seconds = 3.2) {
  const len = ctx.sampleRate * seconds, buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  return buf;
}

function init() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  verb = ctx.createConvolver(); verb.buffer = impulse();
  const wet = ctx.createGain(); wet.gain.value = 0.55; verb.connect(wet).connect(master);
  music = ctx.createGain(); music.gain.value = 0.55;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; lp.Q.value = 0.4;
  music.connect(lp); lp.connect(master); lp.connect(verb);
  fx = ctx.createGain(); fx.gain.value = 0.7; fx.connect(master); fx.connect(verb);
}

function note(freq, t, dur, { type = 'sine', gain = 0.05, attack = 2.2, out = music, detune = 0 } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = freq; o.detune.value = detune;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  g.gain.setTargetAtTime(0, t + dur, dur * 0.25);
  o.connect(g).connect(out);
  o.start(t); o.stop(t + dur * 2.2 + 0.1);
}

function playChord() {
  if (!on) return;
  const t = ctx.currentTime + 0.05, ch = CHORDS[chordIx++ % CHORDS.length];
  ch.forEach((f, i) => {
    note(f, t + i * 0.18, 7.5, { type: 'triangle', gain: 0.032, detune: -4 });
    note(f * 1.002, t + i * 0.18, 7.5, { gain: 0.028, detune: 5 });
  });
  note(ch[0] / 2, t, 8, { gain: 0.05, attack: 3 });   // soft bass
  // one or two sparkles in the bar
  for (let k = 0; k < 1 + (Math.random() < 0.5); k++) {
    note(SPARK[(Math.random() * SPARK.length) | 0], t + 1.5 + Math.random() * 5, 0.9, { gain: 0.018, attack: 0.02 });
  }
  timer = setTimeout(playChord, 8000);
}

const SFX = {
  tick: () => note(2100, ctx.currentTime, 0.03, { gain: 0.012, attack: 0.002, out: fx }),
  tap: () => { const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(720, t); o.frequency.exponentialRampToValueAtTime(320, t + 0.09); g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14); o.connect(g).connect(fx); o.start(t); o.stop(t + 0.16); },
  reveal: () => [659.25, 783.99, 987.77, 1318.5].forEach((f, i) => note(f, ctx.currentTime + i * 0.07, 0.8, { gain: 0.03, attack: 0.01, out: fx })),
  ping: (i = 0) => note([783.99, 880, 987.77, 1174.66][i % 4], ctx.currentTime, 0.7, { gain: 0.03, attack: 0.008, out: fx }),
  whoosh: () => {
    const t = ctx.currentTime, len = ctx.sampleRate * 1.6, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = b; f.type = 'bandpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(2600, t + 1.3);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.06, t + 0.5); g.gain.linearRampToValueAtTime(0, t + 1.5);
    s.connect(f).connect(g).connect(fx); s.start(t); s.stop(t + 1.6);
  },
  land: () => { note(110, ctx.currentTime, 0.18, { gain: 0.09, attack: 0.005, out: fx }); setTimeout(() => SFX.reveal(), 480); },
};

export const sound = {
  get on() { return on; },
  play(name, arg) { if (on && ctx && SFX[name]) SFX[name](arg); },
  async set(v) {
    on = v;
    try { localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* storage blocked */ }
    if (v) {
      init();
      await ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.8);
      clearTimeout(timer); playChord();
    } else if (ctx) {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
      clearTimeout(timer);
    }
    listeners.forEach((f) => f(on));
  },
  onChange(f) { listeners.add(f); },
};

// Sound is ON by default (unless the visitor turned it off before). Browsers
// only let audio start after a first tap/click/key, so the button shows "on"
// from the start and the music begins at that first interaction; clicking
// the button turns it off.
export function initSound() {
  const btn = document.querySelector('.top__sound');
  if (!btn || !(window.AudioContext || window.webkitAudioContext)) { btn?.remove(); return; }
  let wanted = true;
  try { wanted = localStorage.getItem(KEY) !== '0'; } catch { /* storage blocked */ }
  const render = (v) => { btn.classList.toggle('is-on', v); btn.setAttribute('aria-pressed', String(v)); btn.setAttribute('aria-label', v ? 'Desligar som' : 'Ligar som'); };
  sound.onChange(render); render(wanted);
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!on && wanted) { wanted = false; sound.set(false); return; }   // shown on, not started yet → the click means "off"
    wanted = !on; sound.set(!on);
  });
  const start = (e) => {
    if (btn.contains(e.target)) return;
    if (wanted && !on) sound.set(true);
    ['pointerdown', 'keydown', 'touchend'].forEach((t) => window.removeEventListener(t, start, true));
  };
  ['pointerdown', 'keydown', 'touchend'].forEach((t) => window.addEventListener(t, start, true));
  document.addEventListener('pointerover', (e) => {
    if (!on || !e.target.closest('a, button, summary')) return;
    const now = performance.now(); if (now - lastTick < 70) return; lastTick = now;
    sound.play('tick');
  });
  document.addEventListener('click', (e) => { if (on && e.target.closest('a, button, summary') && !btn.contains(e.target)) sound.play('tap'); });
  document.addEventListener('visibilitychange', () => { if (!ctx || !on) return; document.hidden ? ctx.suspend() : ctx.resume(); });
}
