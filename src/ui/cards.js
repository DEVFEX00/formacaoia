import { clamp, damp } from '../engine/util.js';

// CARDS — the cards live a little: they arrive tilted back and settle as
// they reach the reader, drift at different speeds (data-float), and on
// desktop lean toward the cursor with a soft glare. Transform-only; the
// reveal fade uses the separate `translate` property so they compose.
export function createCards(device) {
  const live = new Set();
  const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? live.add(e.target) : live.delete(e.target))), { rootMargin: '15% 0px' });

  function track(el) {
    if (el._card) return;
    el._card = { rx: 0, ry: 0, ty: 0, hx: 0, hy: 0, glare: 0 };
    io.observe(el);
    if (device.coarse || device.reduced) return;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect(), mx = (e.clientX - r.left) / r.width, my = (e.clientY - r.top) / r.height;
      el._card.hx = (mx - 0.5) * 2; el._card.hy = (my - 0.5) * 2; el._card.glare = 1;
      el.style.setProperty('--gx', `${(mx * 100).toFixed(1)}%`); el.style.setProperty('--gy', `${(my * 100).toFixed(1)}%`);
    });
    el.addEventListener('pointerleave', () => { el._card.hx = 0; el._card.hy = 0; el._card.glare = 0; });
  }

  // magnetic CTA: the button leans toward a nearby cursor
  if (!device.coarse && !device.reduced) {
    window.addEventListener('pointermove', (e) => {
      document.querySelectorAll('[data-magnet]').forEach((m) => {
        const r = m.parentElement.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const near = Math.max(0, 1 - Math.hypot(dx / (r.width * 0.9), dy / (r.height * 2.2)));
        m.style.transform = near ? `translate3d(${(dx * 0.22 * near).toFixed(1)}px,${(dy * 0.35 * near).toFixed(1)}px,0)` : '';
      });
    }, { passive: true });
  }

  return {
    scan() { document.querySelectorAll('[data-tilt]').forEach(track); },
    update(dt, H) {
      if (device.reduced) return;
      for (const el of live) {
        const c = el._card, r = el.getBoundingClientRect();
        const mid = (r.top + r.height / 2 - H / 2) / H;              // -0.5 … 0.5 across the screen
        const enter = clamp((r.top - H * 0.45) / (H * 0.5));          // 1 while still low on screen
        const sp = +(el.dataset.float || 0);
        c.ty = damp(c.ty, -mid * sp * H, 8, dt);
        c.rx = damp(c.rx, enter * 14 - c.hy * 6, 7, dt);
        c.ry = damp(c.ry, c.hx * 8, 7, dt);
        el.style.transform = `perspective(1100px) translate3d(0,${c.ty.toFixed(1)}px,0) rotateX(${c.rx.toFixed(2)}deg) rotateY(${c.ry.toFixed(2)}deg)`;
        el.style.setProperty('--glare', c.glare);
      }
    },
  };
}
