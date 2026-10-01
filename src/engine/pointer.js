// Unified mouse + touch input. Energy rises with movement speed and decays,
// so the field reacts to intent (a gesture), not just to position.
// Touch also accumulates horizontal drag, which the camera turns into "looking".
export function createPointer() {
  const p = { x: -1e5, y: -1e5, active: false, energy: 0, type: 'mouse', touching: false, dragX: 0, dragY: 0, lastInput: 0, moved: 0 };
  const downHandlers = new Set();
  let lx = null, ly = null, lt = 0;

  function move(x, y, type) {
    const t = performance.now();
    if (lx !== null && p.active) {
      const dt = Math.max(8, t - lt);
      const d = Math.hypot(x - lx, y - ly);
      p.energy = Math.min(1, p.energy + (d / dt) * 0.08);
      p.moved += d;
      if (type === 'touch') { p.dragX += x - lx; p.dragY += y - ly; }
    }
    lx = x; ly = y; lt = t;
    p.x = x; p.y = y; p.active = true; p.type = type; p.lastInput = t;
  }

  const onPointerMove = (e) => { if (e.pointerType !== 'touch') move(e.clientX, e.clientY, e.pointerType); };
  const onPointerDown = (e) => {
    if (e.pointerType !== 'touch') move(e.clientX, e.clientY, e.pointerType);
    downHandlers.forEach((fn) => fn(e.clientX, e.clientY, e));
  };
  const onTouch = (e) => {
    const t = e.touches[0];
    if (!t) return;
    if (e.type === 'touchstart') { lx = null; p.touching = true; p.energy = Math.max(p.energy, 0.55); }
    move(t.clientX, t.clientY, 'touch');
  };
  const onTouchEnd = () => { p.active = false; p.touching = false; lx = null; };
  const onLeave = (e) => { if (!e.relatedTarget) { p.active = false; lx = null; } };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  window.addEventListener('touchstart', onTouch, { passive: true });
  window.addEventListener('touchmove', onTouch, { passive: true });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('touchcancel', onTouchEnd, { passive: true });
  document.addEventListener('mouseout', onLeave);

  p.onDown = (fn) => { downHandlers.add(fn); return () => downHandlers.delete(fn); };
  p.takeDrag = () => { const d = p.dragX; p.dragX = 0; p.dragY = 0; return d; };
  p.update = (dt) => { p.energy *= Math.exp(-dt * (p.active ? 1.6 : 4)); };
  p.destroy = () => {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('touchstart', onTouch);
    window.removeEventListener('touchmove', onTouch);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchEnd);
    document.removeEventListener('mouseout', onLeave);
    downHandlers.clear();
  };
  return p;
}
