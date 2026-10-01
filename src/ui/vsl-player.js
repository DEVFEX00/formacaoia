// VSL player. States: placeholder (no video yet) · ready · playing · paused · ended.
// Drop the final video in content.js (`vsl`) — the room, transitions and
// controls stay the same. Supports a video file (custom controls) or an embed.
const fmt = (s) => { s = Math.max(0, Math.floor(s || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

export function createVslPlayer(root, config, bus) {
  const screen = root.querySelector('.vsl__screen');
  const state = { status: 'placeholder', video: null };
  const set = (s) => { state.status = s; root.dataset.state = s; bus.emit('vsl:' + s); };

  if (config.type === 'embed' && config.src) {
    const f = document.createElement('iframe');
    f.src = config.src;
    f.title = 'Apresentação da capacitação';
    f.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    f.allowFullscreen = true;
    f.loading = 'lazy';
    screen.replaceChildren(f);
    set('ready');
    return { state, pause() {} };
  }

  if (config.type === 'file' && config.src) {
    const v = document.createElement('video');
    // phones / slow or data-saving connections get the light 720p file
    const net = navigator.connection || {};
    const light = config.srcLight && (window.innerWidth < 900 || net.saveData || /(^|-)2g|3g/.test(net.effectiveType || ''));
    v.src = light ? config.srcLight : config.src;
    if (config.poster) v.poster = config.poster;
    v.preload = 'metadata';
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    screen.replaceChildren(v);
    state.video = v;
    // buffering indicator instead of a silent freeze
    v.addEventListener('waiting', () => root.classList.add('is-buffering'));
    ['playing', 'canplay', 'pause', 'ended'].forEach((ev) => v.addEventListener(ev, () => root.classList.remove('is-buffering')));

    const ui = root.querySelector('.vsl__controls');
    ui.hidden = false;
    const btn = ui.querySelector('.vsl__play');
    const bar = ui.querySelector('.vsl__bar');
    const fill = ui.querySelector('.vsl__fill');
    const time = ui.querySelector('.vsl__time');
    const mute = ui.querySelector('.vsl__mute');
    const full = ui.querySelector('.vsl__full');
    const big = root.querySelector('.vsl__big');

    const toggle = () => (v.paused ? v.play() : v.pause());
    btn.addEventListener('click', toggle);
    big.addEventListener('click', toggle);
    v.addEventListener('click', toggle);
    v.addEventListener('play', () => { set('playing'); btn.setAttribute('aria-label', 'Pausar'); });
    v.addEventListener('pause', () => { if (!v.ended) set('paused'); btn.setAttribute('aria-label', 'Reproduzir'); });
    v.addEventListener('ended', () => set('ended'));
    const tick = () => {
      const k = v.duration ? v.currentTime / v.duration : 0;
      fill.style.transform = `scaleX(${k})`;
      time.textContent = `${fmt(v.currentTime)} / ${fmt(v.duration)}`;
    };
    v.addEventListener('timeupdate', tick);
    v.addEventListener('loadedmetadata', tick);   // show the length before play
    if (v.readyState >= 1) tick();
    const seek = (e) => {
      const r = bar.getBoundingClientRect();
      if (v.duration) v.currentTime = ((e.clientX - r.left) / r.width) * v.duration;
    };
    bar.addEventListener('pointerdown', (e) => { seek(e); bar.setPointerCapture(e.pointerId); });
    bar.addEventListener('pointermove', (e) => { if (bar.hasPointerCapture(e.pointerId)) seek(e); });
    mute.addEventListener('click', () => { v.muted = !v.muted; mute.classList.toggle('is-muted', v.muted); });
    full.addEventListener('click', () => (root.requestFullscreen ? root.requestFullscreen() : v.webkitEnterFullscreen?.()));
    set('ready');
    return {
      state,
      pause: () => { if (!v.paused) v.pause(); },
      warm: () => { if (v.preload !== 'auto') { v.preload = 'auto'; v.load(); } },   // start buffering before the click
      get playing() { return !v.paused && !v.ended; },
    };
  }

  set('placeholder');
  return { state, pause() {} };
}
