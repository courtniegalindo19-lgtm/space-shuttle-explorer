import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const hotspotData = [
  {
    key: 'cockpit',
    pos: [0, 3.3, 15.6],
    tag: 'Crew Compartment',
    title: 'Flight Deck & Cockpit',
    body: "At the front of the orbiter sits a two-level crew cabin. The upper flight deck originally had over 2,200 controls and displays — about three times as many as an Apollo command module — with separate controls for flying in the atmosphere versus maneuvering in orbit.",
    fact: "The forward flight deck looks and feels much like a jet airliner cockpit, since the shuttle glided in for an unpowered landing just like a plane."
  },
  {
    key: 'payload',
    pos: [0, 5.6, 1],
    tag: 'Cargo Hold',
    title: 'Payload Bay',
    body: "Running down the middle of the orbiter is a 60-foot cargo bay with clamshell doors. It carried satellites, space station modules, and the Spacelab laboratory into orbit — and back down again if needed.",
    fact: "The inner surface of the payload bay doors held radiators that dumped the shuttle's excess heat into space — they had to open shortly after reaching orbit or the crew compartment would overheat."
  },
  {
    key: 'wing',
    pos: [9.6, -2.4, -5],
    tag: 'Aerodynamic Surface',
    title: 'Delta Wings',
    body: "The shuttle's distinctive double-delta wing shape let it survive the extreme heat of hypersonic reentry, then glide — with no engines running — down to a runway landing like a very heavy airplane.",
    fact: "Because it had no engines for landing, astronauts described the orbiter as flying like 'a brick with wings.' It only got one shot at the runway."
  },
  {
    key: 'tail',
    pos: [0, 7.0, -11.5],
    tag: 'Stabilizer',
    title: 'Vertical Stabilizer',
    body: "The tail fin keeps the orbiter stable in flight and splits open into two halves that act as an air brake, helping slow the shuttle during its final descent and landing rollout.",
    fact: "On Challenger and Columbia, the very tip of the fin was covered in black thermal tile, since it ran hotter than on the other orbiters."
  },
  {
    key: 'oms',
    pos: [3.4, 3.1, -13.2],
    tag: 'Orbital Maneuvering',
    title: 'OMS Pods',
    body: "The two bulging pods flanking the tail house the Orbital Maneuvering System engines, burning hypergolic fuel that ignites on contact rather than needing a spark. These engines pushed the shuttle into its final orbit and slowed it down for the deorbit burn to come home.",
    fact: "Each OMS engine produced about 6,000 pounds of thrust — modest compared to the main engines, but precise enough for fine orbital adjustments."
  },
  {
    key: 'engines',
    pos: [0, -1.2, -18.4],
    tag: 'Propulsion',
    title: 'Main Engines (SSMEs)',
    body: "Three Space Shuttle Main Engines clustered at the tail burned liquid hydrogen and liquid oxygen fed from the external tank, producing the bulk of the thrust needed to reach orbit during launch.",
    fact: "Each main engine could throttle between 65% and 109% power and produced up to 470,000 pounds of thrust in the vacuum of space — and, remarkably, all three engines were reused across multiple flights."
  },
  {
    key: 'tiles',
    pos: [0, -6.9, 5],
    tag: 'Heat Shield',
    title: 'Thermal Protection Tiles',
    body: "Roughly 24,000 individual silica tiles covered the shuttle's surface, each hand-fitted to the curve of the hull. Black tiles on the belly and leading edges handled reentry temperatures up to 2,300°F, while white tiles on cooler upper surfaces handled up to 1,200°F.",
    fact: "The tiles were such good insulators that a crew member could hold one edge with bare hands seconds after it was pulled glowing-hot from an oven — the heat barely conducted through the material."
  }
];

const visited = new Set();
const total = hotspotData.length;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070f);

// simple starfield
{
  const starGeo = new THREE.BufferGeometry();
  const starCount = 2000;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    positions[i*3] = (Math.random()-0.5) * 400;
    positions[i*3+1] = (Math.random()-0.5) * 400;
    positions[i*3+2] = (Math.random()-0.5) * 400;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xaaccff, size: 0.5, sizeAttenuation: true });
  scene.add(new THREE.Points(starGeo, starMat));
}

// Earth, sitting far below/behind the shuttle so it reads as the planet's
// limb curving away in orbit. Placed well outside the camera's orbit
// distance (see controls.maxDistance below) so it never gets in the way
// of examining the shuttle itself.
if (typeof window.EARTH_JPG_BASE64 === 'string') {
  const earthTexture = new THREE.TextureLoader().load('data:image/jpeg;base64,' + window.EARTH_JPG_BASE64);
  earthTexture.colorSpace = THREE.SRGBColorSpace;
  const earthGeo = new THREE.SphereGeometry(220, 64, 64);
  const earthMat = new THREE.MeshBasicMaterial({ map: earthTexture });
  const earth = new THREE.Mesh(earthGeo, earthMat);
  earth.position.set(0, -300, -260);
  scene.add(earth);
}

const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 2000);
camera.position.set(28, 14, 34);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('canvasWrap').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 8;
controls.maxDistance = 120;
controls.target.set(0, 0, 0);

scene.add(new THREE.AmbientLight(0x6a7a99, 1.1));
const sun = new THREE.DirectionalLight(0xffffff, 2.4);
sun.position.set(40, 60, 20);
scene.add(sun);
const fill = new THREE.DirectionalLight(0x88aaff, 0.6);
fill.position.set(-40, -20, -40);
scene.add(fill);

const markerGroup = new THREE.Group();
scene.add(markerGroup);
const markerMeshes = [];

function makeMarker(h) {
  const geo = new THREE.SphereGeometry(0.35, 16, 16);
  const mat = new THREE.MeshBasicMaterial({ color: 0xff7043 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(h.pos[0], h.pos[1], h.pos[2]);
  mesh.userData.key = h.key;

  const glowGeo = new THREE.SphereGeometry(0.62, 16, 16);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xff7043, transparent: true, opacity: 0.35 });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  mesh.add(glow);
  mesh.userData.glow = glow;

  markerGroup.add(mesh);
  markerMeshes.push(mesh);

  const label = document.createElement('div');
  label.className = 'marker-label';
  label.textContent = h.title;
  document.body.appendChild(label);
  mesh.userData.label = label;
  return mesh;
}
hotspotData.forEach(makeMarker);

// raycasting
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered = null;

function setPointer(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

renderer.domElement.addEventListener('pointermove', (e) => {
  setPointer(e);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(markerMeshes, false);
  if (hits.length) {
    renderer.domElement.style.cursor = 'pointer';
    hovered = hits[0].object;
  } else {
    renderer.domElement.style.cursor = 'grab';
    hovered = null;
  }
});

renderer.domElement.addEventListener('click', (e) => {
  setPointer(e);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(markerMeshes, false);
  if (hits.length) {
    openModal(hits[0].object.userData.key);
  }
});

// modal logic
const dataByKey = {};
hotspotData.forEach(h => dataByKey[h.key] = h);

const overlay = document.getElementById('overlay');
const modalTag = document.getElementById('modalTag');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalFact = document.getElementById('modalFact');
const progressFill = document.getElementById('progressFill');
const progressCount = document.getElementById('progressCount');
const finale = document.getElementById('finale');

function openModal(key) {
  const d = dataByKey[key];
  if (!d) return;
  modalTag.textContent = d.tag;
  modalTitle.textContent = d.title;
  modalBody.textContent = d.body;
  modalFact.textContent = d.fact;
  overlay.classList.add('active');

  if (!visited.has(key)) {
    visited.add(key);
    updateProgress();
    const mesh = markerMeshes.find(m => m.userData.key === key);
    if (mesh) {
      mesh.material.color.set(0x3fae5c);
      mesh.userData.glow.material.color.set(0x3fae5c);
      mesh.userData.label.classList.add('visited');
    }
  }
}
function closeModal() { overlay.classList.remove('active'); }
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalDone').addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// Report progress (and which specific parts have been found) to a parent
// page, e.g. a game-style HUD wrapper embedding this file in an iframe.
function reportProgress() {
  try {
    window.parent.postMessage({
      type: 'shuttle-interactive-progress',
      visited: visited.size,
      total: total,
      keys: Array.from(visited)
    }, '*');
  } catch (e) { /* no parent frame, ignore */ }
}

function updateProgress() {
  const count = visited.size;
  progressFill.style.width = (count/total*100) + '%';
  progressCount.textContent = count + ' / ' + total;
  reportProgress();
  if (count === total) {
    finale.classList.add('show');
    try {
      window.parent.postMessage({ type: 'shuttle-interactive-complete', total: total }, '*');
    } catch (e) { /* no parent frame, ignore */ }
  }
}

// load model from embedded base64 (window.SHUTTLE_GLB_BASE64, set by model-data.js)
const loadingEl = document.getElementById('loading');
const loadingText = document.getElementById('loadingText');

function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes.buffer;
}

loadingText.textContent = 'Decoding model data...';
setTimeout(() => {
  let buffer;
  try {
    buffer = base64ToArrayBuffer(window.SHUTTLE_GLB_BASE64);
  } catch (err) {
    loadingText.textContent = 'Failed to decode model data: ' + (err && err.message ? err.message : err);
    console.error(err);
    return;
  }

  const loader = new GLTFLoader();
  loadingText.textContent = 'Parsing 3D model...';

  loader.parse(buffer, '', (gltf) => {
    const model = gltf.scene;
    scene.add(model);
    loadingEl.style.display = 'none';
    animate();
  }, (err) => {
    const msg = (err && (err.message || err.toString())) || 'unknown error';
    loadingText.textContent = 'Could not load the 3D model: ' + msg;
    loadingText.style.padding = '0 20px';
    loadingText.style.textAlign = 'center';
    console.error('GLTF parse error:', err);
  });
}, 30);

function updateLabels() {
  markerMeshes.forEach(mesh => {
    const label = mesh.userData.label;
    const worldPos = new THREE.Vector3();
    mesh.getWorldPosition(worldPos);
    const projected = worldPos.clone().project(camera);
    const behindCamera = projected.z > 1;
    const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
    label.style.left = x + 'px';
    label.style.top = y + 'px';
    const dist = camera.position.distanceTo(worldPos);
    const show = !behindCamera && dist < 90 && (hovered === mesh || dist < 45);
    label.classList.toggle('show', show || hovered === mesh);
  });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  const t = performance.now() * 0.002;
  markerMeshes.forEach(m => {
    const s = 1 + Math.sin(t + m.position.x) * 0.15;
    m.userData.glow.scale.setScalar(s);
  });
  updateLabels();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
