// Representação 3D do cilindro a partir das medidas sugeridas. Gira sozinha, a menos que o sistema peça menos movimento.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

function mount(el) {
  if (el.dataset.mounted) return;
  el.dataset.mounted = "1";
  let spec;
  try { spec = JSON.parse(el.dataset.spec); } catch { return; }
  const w = el.clientWidth || 320, h = el.clientHeight || 220;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch {
    el.insertAdjacentHTML("beforeend", '<p class="fallback">Este navegador não mostra 3D. O desenho ao lado tem as mesmas medidas.</p>');
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(w, h);
  el.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const total = spec.L + 2 * spec.shaftL;
  const k = 2.6 / total;
  const R = (spec.D / 2) * k, r = (spec.shaftD / 2) * k, L = spec.L * k, sl = spec.shaftL * k;
  const ch = Math.min(R * 0.12, 0.05);

  const rubber = new THREE.MeshStandardMaterial({ color: spec.color || 0x4b514d, roughness: 0.8, metalness: 0.05 });
  const steel = new THREE.MeshStandardMaterial({ color: 0xb9bec2, roughness: 0.32, metalness: 0.85 });
  const pts = [new THREE.Vector2(0, -L / 2), new THREE.Vector2(R - ch, -L / 2), new THREE.Vector2(R, -L / 2 + ch), new THREE.Vector2(R, L / 2 - ch), new THREE.Vector2(R - ch, L / 2), new THREE.Vector2(0, L / 2)];
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), rubber);
  const shaftGeo = new THREE.CylinderGeometry(r, r, sl, 48);
  const s1 = new THREE.Mesh(shaftGeo, steel); s1.position.y = -(L / 2 + sl / 2);
  const s2 = new THREE.Mesh(shaftGeo, steel); s2.position.y = L / 2 + sl / 2;
  const group = new THREE.Group(); group.add(body, s1, s2);
  if (spec.crack) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(R * 1.001, 0.006, 6, 40, 1.1), new THREE.MeshBasicMaterial({ color: 0xc8c2b4 }));
    m.rotation.x = Math.PI / 2; m.position.y = L / 2 - 0.12; group.add(m);
  }
  group.rotation.z = Math.PI / 2;
  scene.add(group);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x6a6a6a, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(2, 3, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.6); rim.position.set(-3, -1, -2); scene.add(rim);

  const camera = new THREE.PerspectiveCamera(32, w / h, 0.05, 50);
  camera.position.set(1.7, 0.9, 2.3);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.enablePan = false; controls.minDistance = 1.6; controls.maxDistance = 7;
  controls.autoRotate = !reduced; controls.autoRotateSpeed = 1.6;
  renderer.domElement.setAttribute("aria-label", el.dataset.label || "Modelo 3D do cilindro; arraste para girar");
  renderer.domElement.setAttribute("role", "img");

  const ro = new ResizeObserver(() => { const W = el.clientWidth, H = el.clientHeight; if (!W || !H) return; renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix(); });
  ro.observe(el);
  (function loop() {
    if (!el.isConnected) { ro.disconnect(); controls.dispose(); renderer.dispose(); return; }
    controls.update(); renderer.render(scene, camera); requestAnimationFrame(loop);
  })();
}

const scan = () => document.querySelectorAll(".v3d[data-spec]").forEach(mount);
addEventListener("journey:render", () => requestAnimationFrame(scan));
new MutationObserver(() => scan()).observe(document.body, { childList: true, subtree: true });
scan();
