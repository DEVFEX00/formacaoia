// Capability tiers for a real-time 3D experience. Mobile gets its own budget:
// fewer objects, no shadow maps, lower DPR — never a broken desktop.
function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    const ok = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

export function detectDevice() {
  const mq = (q) => !!(window.matchMedia && window.matchMedia(q).matches);
  const params = new URLSearchParams(location.search);
  const coarse = mq('(pointer: coarse)');
  const reduced = mq('(prefers-reduced-motion: reduce)') || params.has('reduced');
  const small = Math.min(window.innerWidth, window.innerHeight) < 700 || window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4;

  let tier = coarse || small ? 'mid' : 'high';
  if (cores <= 4 && mem <= 2) tier = 'low';
  if (params.get('tier')) tier = params.get('tier');

  return {
    tier, coarse, reduced, small,
    webgl: hasWebGL(),
    shadows: tier === 'high',
    dprCap: { high: 1.75, mid: 1.5, low: 1.1 }[tier],
    detail: { high: 1, mid: 0.55, low: 0.35 }[tier],       // instanced props (books, papers…)
    logoParticles: { high: 2600, mid: 1500, low: 900 }[tier],
    sparks: { high: 1400, mid: 700, low: 360 }[tier],
    water: { high: 180, mid: 90, low: 60 }[tier],           // sea mesh resolution
  };
}
