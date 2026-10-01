import * as THREE from 'three';

// One transparent WebGL canvas over the page background, under the content.
// Pass 0: backdrop in CSS px (hero render-scan, the page-anchored ribbon).
// Pass 1: perspective scene (screen ribbons). Pass 2: overlay in CSS px
// (cursor dust, particle matter for the logo).
export function createStage(canvas, device) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: device.tier !== 'low', alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  const back = new THREE.Scene();
  const overlay = new THREE.Scene();
  const ortho = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);
  const st = { renderer, scene, camera, back, overlay, ortho, W: 1, H: 1, halfH: 1, halfW: 1 };

  st.resize = (W, H, dpr) => {
    st.W = W; st.H = H;
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    st.halfH = Math.tan((camera.fov * Math.PI) / 360) * 10;
    st.halfW = st.halfH * camera.aspect;
    ortho.right = W; ortho.bottom = H; ortho.updateProjectionMatrix();
  };
  st.render = () => {
    renderer.clear();
    renderer.render(back, ortho);
    renderer.render(scene, camera);
    renderer.clearDepth();
    renderer.render(overlay, ortho);
  };
  return st;
}
