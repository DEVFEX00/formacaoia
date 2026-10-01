import { clamp, seg, damp, stylers } from '../engine/util.js';
import { buildVoyage } from '../illus/voyage.js';
import { toolGroups } from '../content.js';

const S = stylers();

// 06 — A JORNADA: pinned; the scroll rows the boat. Three depths move at
// their own speed — far islands on the horizon, the tool islands, and buoys,
// rocks and reeds that pass in front of the boat — and each island turns as
// it goes by, as if seen from the side of the boat.
export function createVoyage({ el }) {
  const world = el.querySelector('.voyage__world');
  const v = buildVoyage(world, toolGroups);
  const head = el.querySelector('.voyage__head');
  const st = { x: 0, tilt: 0 };

  function update(dt, p, W, H, t, weight, vel) {
    // travel until the closing line sits in the middle-right of the screen
    const end = v.stops[v.stops.length - 1];
    const travel = Math.max(0, end.offsetLeft + end.offsetWidth / 2 - W * (W < 700 ? 0.5 : 0.6));
    const target = -seg(p, 0.09, 0.96) * travel;
    st.x = damp(st.x, target, 9, dt);
    S(v.track)('transform', `translate3d(${st.x.toFixed(1)}px,0,0)`);
    S(v.far)('transform', `translate3d(${(st.x * 0.22).toFixed(1)}px,0,0)`);
    S(v.near)('transform', `translate3d(${(st.x * 1.7).toFixed(1)}px,0,0)`);
    S(head)('opacity', (1 - seg(p, 0.02, 0.09)).toFixed(3));
    S(head)('transform', `translate3d(0,${(-seg(p, 0, 0.09) * 40).toFixed(1)}px,0)`);
    // boat leans into the motion
    st.tilt = damp(st.tilt, clamp(-vel * 0.004, -6, 6), 4, dt);
    S(v.boat)('--tilt', `${st.tilt.toFixed(2)}deg`);
    S(v.boat)('--row', Math.abs(vel) > 30 ? '1' : '0.35');
    // islands turn as they pass; cards read as they reach the boat
    v.stops.forEach((s) => {
      const r = s.getBoundingClientRect();
      if (r.right < -200 || r.left > W + 200) return;
      const c = (r.left + r.width / 2) / W;
      const k = clamp(1 - (Math.abs(c - 0.52) - 0.16) / 0.3);
      s.style.setProperty('--k', k.toFixed(3));
      s.style.setProperty('--turn', ((0.5 - c) * 46).toFixed(2) + 'deg');
    });
  }
  return { update };
}
