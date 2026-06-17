import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

const canvas = document.querySelector('#game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x071521);
scene.fog = new THREE.Fog(0x071521, 30, 95);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(18, 21, 22);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.46;
controls.minDistance = 10;
controls.maxDistance = 55;
controls.enablePan = true;
controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,
  MIDDLE: THREE.MOUSE.DOLLY,
  RIGHT: THREE.MOUSE.PAN
};
controls.update();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const clock = new THREE.Clock();

const TILE = 1;
const START_W = 16;
const START_H = 12;
const SAVE_KEY = 'leisure-club-tycoon-save-v1';

const ui = {
  cash: document.querySelector('#cash'),
  members: document.querySelector('#members'),
  rating: document.querySelector('#rating'),
  rep: document.querySelector('#rep'),
  day: document.querySelector('#day'),
  clock: document.querySelector('#clock'),
  buildMenu: document.querySelector('#buildMenu'),
  selectedHint: document.querySelector('#selectedHint'),
  inspectTitle: document.querySelector('#inspectTitle'),
  inspectBody: document.querySelector('#inspectBody'),
  cleanText: document.querySelector('#cleanText'),
  cleanBar: document.querySelector('#cleanBar'),
  luxuryText: document.querySelector('#luxuryText'),
  luxuryBar: document.querySelector('#luxuryBar'),
  objectives: document.querySelector('#objectives'),
  toast: document.querySelector('#toast'),
  rotateBtn: document.querySelector('#rotateBtn'),
  deleteBtn: document.querySelector('#deleteBtn'),
  expandBtn: document.querySelector('#expandBtn'),
  saveBtn: document.querySelector('#saveBtn'),
  loadBtn: document.querySelector('#loadBtn'),
  resetBtn: document.querySelector('#resetBtn'),
  mobileRotate: document.querySelector('#mobileRotate'),
  mobileCancel: document.querySelector('#mobileCancel')
};

const palette = {
  floor: 0x163242,
  floor2: 0x1d4052,
  grid: 0x4c7a8d,
  valid: 0x83f5d9,
  invalid: 0xff6780,
  wall: 0xdce9ee,
  dark: 0x0e1c27,
  teal: 0x69dbc9,
  blue: 0x65a9ff,
  gold: 0xf9d36c,
  green: 0x91f09d,
  pink: 0xff8ed3,
  purple: 0xb99cff,
  wood: 0xc98f5b,
  water: 0x45c9f5,
  glass: 0xa3f0ff,
  mat: 0x6f78ff
};

const materials = {
  floor: new THREE.MeshStandardMaterial({ color: palette.floor, roughness: 0.82, metalness: 0.03 }),
  floorAlt: new THREE.MeshStandardMaterial({ color: palette.floor2, roughness: 0.82, metalness: 0.02 }),
  grid: new THREE.LineBasicMaterial({ color: palette.grid, transparent: true, opacity: 0.18 }),
  wall: new THREE.MeshStandardMaterial({ color: palette.wall, roughness: 0.55, metalness: 0.04 }),
  dark: new THREE.MeshStandardMaterial({ color: palette.dark, roughness: 0.55 }),
  teal: new THREE.MeshStandardMaterial({ color: palette.teal, roughness: 0.35, metalness: 0.08 }),
  blue: new THREE.MeshStandardMaterial({ color: palette.blue, roughness: 0.4, metalness: 0.05 }),
  gold: new THREE.MeshStandardMaterial({ color: palette.gold, roughness: 0.48, metalness: 0.12 }),
  green: new THREE.MeshStandardMaterial({ color: palette.green, roughness: 0.54 }),
  pink: new THREE.MeshStandardMaterial({ color: palette.pink, roughness: 0.52 }),
  purple: new THREE.MeshStandardMaterial({ color: palette.purple, roughness: 0.4, metalness: 0.08 }),
  wood: new THREE.MeshStandardMaterial({ color: palette.wood, roughness: 0.76 }),
  water: new THREE.MeshPhysicalMaterial({ color: palette.water, roughness: 0.08, metalness: 0.02, transmission: 0.15, transparent: true, opacity: 0.78 }),
  glass: new THREE.MeshPhysicalMaterial({ color: palette.glass, roughness: 0.02, metalness: 0.0, transmission: 0.35, transparent: true, opacity: 0.38 }),
  ghostValid: new THREE.MeshStandardMaterial({ color: palette.valid, transparent: true, opacity: 0.42, roughness: 0.25 }),
  ghostInvalid: new THREE.MeshStandardMaterial({ color: palette.invalid, transparent: true, opacity: 0.42, roughness: 0.25 }),
  shadow: new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 })
};

const facilityDefs = {
  reception: {
    name: 'Reception', emoji: '🛎️', cost: 850, size: [3, 2], income: 12, capacity: 4, appeal: 6, upkeep: 2,
    desc: 'Check-in point. Members need this before the club feels real.', unlock: () => true, build: buildReception
  },
  cardio: {
    name: 'Cardio Suite', emoji: '🏃', cost: 1450, size: [4, 3], income: 28, capacity: 9, appeal: 8, upkeep: 7,
    desc: 'Treadmills, bikes and a premium mirrored cardio floor.', unlock: () => true, build: buildCardio
  },
  weights: {
    name: 'Free Weights', emoji: '🏋️', cost: 1750, size: [4, 3], income: 32, capacity: 8, appeal: 7, upkeep: 8,
    desc: 'Benches, racks and strength-kit for serious members.', unlock: () => true, build: buildWeights
  },
  studio: {
    name: 'Wellness Studio', emoji: '🧘', cost: 1250, size: [4, 3], income: 25, capacity: 10, appeal: 9, upkeep: 5,
    desc: 'Yoga, pilates and classes. Great for rating variety.', unlock: (s) => s.reputation >= 3 || countFacilities('reception') > 0, build: buildStudio
  },
  pool: {
    name: 'Pool Lane', emoji: '🏊', cost: 3200, size: [6, 3], income: 55, capacity: 12, appeal: 16, upkeep: 18,
    desc: 'A premium leisure-club anchor. Expensive but powerful.', unlock: (s) => s.reputation >= 8 || s.cash >= 5200, build: buildPool
  },
  sauna: {
    name: 'Sauna & Steam', emoji: '♨️', cost: 2150, size: [3, 3], income: 42, capacity: 6, appeal: 13, upkeep: 11,
    desc: 'Spa heat rooms. Members pay more and rate the club higher.', unlock: (s) => s.reputation >= 6 || countFacilities('pool') > 0, build: buildSauna
  },
  juice: {
    name: 'Juice Bar', emoji: '🥤', cost: 1350, size: [3, 2], income: 38, capacity: 6, appeal: 10, upkeep: 6,
    desc: 'Extra spend per visit. Adds a warmer social-club vibe.', unlock: (s) => s.reputation >= 4 || countFacilities('cardio') + countFacilities('weights') >= 2, build: buildJuice
  },
  spa: {
    name: 'Spa Room', emoji: '💆', cost: 2550, size: [3, 3], income: 52, capacity: 4, appeal: 15, upkeep: 10,
    desc: 'Massage tables, treatment lighting and luxury rating boost.', unlock: (s) => s.reputation >= 10 || countFacilities('sauna') > 0, build: buildSpa
  },
  locker: {
    name: 'Changing Room', emoji: '🚿', cost: 1200, size: [3, 3], income: 8, capacity: 12, appeal: 11, upkeep: 5,
    desc: 'Supports bigger membership and keeps complaints down.', unlock: () => true, build: buildLocker
  },
  plant: {
    name: 'Plant Decor', emoji: '🌿', cost: 180, size: [1, 1], income: 0, capacity: 0, appeal: 3, upkeep: 0,
    desc: 'Cheap luxury/decor boost. Fills dead space nicely.', unlock: () => true, build: buildPlant
  }
};

const objectives = [
  { text: 'Place a reception desk', done: () => countFacilities('reception') >= 1 },
  { text: 'Reach 25 members', done: () => state.members >= 25 },
  { text: 'Build a pool or sauna', done: () => countFacilities('pool') + countFacilities('sauna') >= 1 },
  { text: 'Reach 80% club rating', done: () => state.rating >= 80 },
  { text: 'Expand the plot once', done: () => state.expansions >= 1 }
];

const state = {
  cash: 8000,
  members: 0,
  rating: 58,
  reputation: 0,
  day: 1,
  minute: 6 * 60,
  cleanliness: 100,
  width: START_W,
  height: START_H,
  expansions: 0,
  selectedType: 'reception',
  rotation: 0,
  deleteMode: false,
  facilities: [],
  visitors: [],
  lastIncome: 0,
  paused: false
};

const groups = {
  floor: new THREE.Group(),
  grid: new THREE.Group(),
  facilities: new THREE.Group(),
  visitors: new THREE.Group(),
  effects: new THREE.Group(),
  world: new THREE.Group()
};
scene.add(groups.world, groups.floor, groups.grid, groups.facilities, groups.visitors, groups.effects);

const placementPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshBasicMaterial({ visible: false })
);
placementPlane.rotation.x = -Math.PI / 2;
scene.add(placementPlane);

let ghost = null;
let hoveredTile = null;
let hoveredFacility = null;
let selectedFacilityId = null;
let nextFacilityId = 1;
let nextVisitorId = 1;
let toastTimer = null;

initLighting();
initWorldDetails();
buildFloor();
buildGrid();
createBuildMenu();
createGhost();
wireEvents();
updateUi(true);
showToast('Welcome to your new leisure club. Place reception first.');

animate();

function initLighting() {
  const hemi = new THREE.HemisphereLight(0x9fdfff, 0x102331, 1.4);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffffff, 2.25);
  sun.position.set(15, 26, 11);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 70;
  sun.shadow.camera.left = -35;
  sun.shadow.camera.right = 35;
  sun.shadow.camera.top = 35;
  sun.shadow.camera.bottom = -35;
  scene.add(sun);

  const tealLamp = new THREE.PointLight(0x62f2d7, 8, 28, 2.1);
  tealLamp.position.set(-8, 8, 6);
  scene.add(tealLamp);

  const warmLamp = new THREE.PointLight(0xffd486, 5, 22, 2.1);
  warmLamp.position.set(8, 5, -8);
  scene.add(warmLamp);
}

function initWorldDetails() {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(18, 21, 0.85, 64), new THREE.MeshStandardMaterial({ color: 0x07101a, roughness: 0.95 }));
  base.position.y = -0.55;
  base.receiveShadow = true;
  scene.add(base);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(18.2, 0.055, 8, 96), materials.teal);
  ring.position.y = 0.025;
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  for (let i = 0; i < 42; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 20 + Math.random() * 18;
    const h = 0.4 + Math.random() * 2.2;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.2 + Math.random() * 1.5, h, 0.2 + Math.random() * 1.5), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.55, 0.3, 0.08 + Math.random() * 0.08), roughness: 0.9 }));
    mesh.position.set(Math.cos(angle) * radius, h / 2 - 0.25, Math.sin(angle) * radius);
    mesh.rotation.y = Math.random() * Math.PI;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add(mesh);
  }
}

function buildFloor() {
  clearGroup(groups.floor);
  const offset = getOffset();
  for (let x = 0; x < state.width; x++) {
    for (let z = 0; z < state.height; z++) {
      const tile = new THREE.Mesh(new THREE.BoxGeometry(TILE, 0.12, TILE), (x + z) % 2 === 0 ? materials.floor : materials.floorAlt);
      tile.position.set(offset.x + x + 0.5, -0.06, offset.z + z + 0.5);
      tile.receiveShadow = true;
      tile.userData.tile = { x, z };
      groups.floor.add(tile);
    }
  }

  addPerimeterWalls();
  placementPlane.position.set(0, 0.03, 0);
}

function addPerimeterWalls() {
  const offset = getOffset();
  const wallMat = materials.glass;
  const postMat = materials.wall;
  const wallHeight = 1.15;
  const y = wallHeight / 2;
  const front = new THREE.Mesh(new THREE.BoxGeometry(state.width, wallHeight, 0.08), wallMat);
  front.position.set(0, y, offset.z - 0.05);
  const back = front.clone();
  back.position.z = offset.z + state.height + 0.05;
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.08, wallHeight, state.height), wallMat);
  left.position.set(offset.x - 0.05, y, 0);
  const right = left.clone();
  right.position.x = offset.x + state.width + 0.05;
  [front, back, left, right].forEach(w => { w.castShadow = true; w.receiveShadow = true; groups.floor.add(w); });

  for (let x = 0; x <= state.width; x += 4) {
    addPost(offset.x + x, offset.z, postMat);
    addPost(offset.x + x, offset.z + state.height, postMat);
  }
  for (let z = 0; z <= state.height; z += 4) {
    addPost(offset.x, offset.z + z, postMat);
    addPost(offset.x + state.width, offset.z + z, postMat);
  }
}

function addPost(x, z, mat) {
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.38, 0.12), mat);
  post.position.set(x, 0.69, z);
  post.castShadow = true;
  groups.floor.add(post);
}

function buildGrid() {
  clearGroup(groups.grid);
  const offset = getOffset();
  const points = [];
  for (let x = 0; x <= state.width; x++) {
    points.push(new THREE.Vector3(offset.x + x, 0.006, offset.z), new THREE.Vector3(offset.x + x, 0.006, offset.z + state.height));
  }
  for (let z = 0; z <= state.height; z++) {
    points.push(new THREE.Vector3(offset.x, 0.006, offset.z + z), new THREE.Vector3(offset.x + state.width, 0.006, offset.z + z));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const lines = new THREE.LineSegments(geo, materials.grid);
  groups.grid.add(lines);
}

function createBuildMenu() {
  ui.buildMenu.innerHTML = '';
  Object.entries(facilityDefs).forEach(([type, def]) => {
    const btn = document.createElement('button');
    btn.className = 'facility-btn';
    btn.dataset.type = type;
    btn.innerHTML = `
      <span class="emoji">${def.emoji}</span>
      <strong>${def.name}</strong>
      <small><span class="cost">£${def.cost.toLocaleString()}</span> · ${def.size[0]}x${def.size[1]}</small>
    `;
    btn.addEventListener('click', () => {
      if (!def.unlock(state)) {
        showToast('Locked. Improve reputation or build supporting facilities first.');
        return;
      }
      state.deleteMode = false;
      state.selectedType = type;
      selectedFacilityId = null;
      createGhost();
      updateUi();
      inspectType(type);
    });
    ui.buildMenu.appendChild(btn);
  });
}

function createGhost() {
  if (ghost) scene.remove(ghost);
  const def = facilityDefs[state.selectedType];
  ghost = new THREE.Group();
  const footprint = getRotatedSize(def.size, state.rotation);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(footprint[0], 0.16, footprint[1]), materials.ghostValid);
  mesh.position.y = 0.08;
  ghost.add(mesh);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 }));
  edge.position.y = 0.08;
  ghost.add(edge);
  ghost.visible = false;
  scene.add(ghost);
}

function wireEvents() {
  window.addEventListener('resize', onResize);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('keydown', onKeyDown);
  ui.rotateBtn.addEventListener('click', rotateBlueprint);
  ui.mobileRotate.addEventListener('click', rotateBlueprint);
  ui.mobileCancel.addEventListener('click', () => { state.selectedType = null; state.deleteMode = false; createGhost(); updateUi(); });
  ui.deleteBtn.addEventListener('click', () => {
    state.deleteMode = !state.deleteMode;
    state.selectedType = state.deleteMode ? null : 'reception';
    createGhost();
    updateUi();
    showToast(state.deleteMode ? 'Bulldoze mode: click a facility to sell it.' : 'Bulldoze mode off.');
  });
  ui.expandBtn.addEventListener('click', expandPlot);
  ui.saveBtn.addEventListener('click', saveGame);
  ui.loadBtn.addEventListener('click', loadGame);
  ui.resetBtn.addEventListener('click', () => {
    if (confirm('Reset this club and start again?')) resetGame();
  });
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
}

function onKeyDown(e) {
  if (e.key.toLowerCase() === 'r') rotateBlueprint();
  if (e.key === 'Escape') {
    state.deleteMode = false;
    state.selectedType = null;
    selectedFacilityId = null;
    createGhost();
    updateUi();
  }
  if (e.key.toLowerCase() === 'b') {
    state.deleteMode = !state.deleteMode;
    createGhost();
    updateUi();
  }
}

function onPointerMove(e) {
  const hit = getPointerHit(e);
  hoveredTile = hit.tile;
  hoveredFacility = hit.facility;
  updateGhost();
}

function onPointerDown(e) {
  if (e.button === 2) return;
  const hit = getPointerHit(e);
  hoveredTile = hit.tile;
  hoveredFacility = hit.facility;

  if (state.deleteMode && hoveredFacility) {
    sellFacility(hoveredFacility.userData.facilityId);
    return;
  }

  if (state.selectedType && hoveredTile) {
    placeFacilityAt(hoveredTile.x, hoveredTile.z);
    return;
  }

  if (hoveredFacility) {
    selectedFacilityId = hoveredFacility.userData.facilityId;
    inspectFacility(selectedFacilityId);
    updateUi();
  }
}

function getPointerHit(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const facilityHits = raycaster.intersectObjects(groups.facilities.children, true);
  const facilityHit = facilityHits.find(h => h.object.userData.facilityId || h.object.parent?.userData?.facilityId);
  let facility = null;
  if (facilityHit) facility = climbToFacilityRoot(facilityHit.object);

  const planeHits = raycaster.intersectObject(placementPlane, false);
  let tile = null;
  if (planeHits.length) {
    const p = planeHits[0].point;
    const offset = getOffset();
    const x = Math.floor(p.x - offset.x);
    const z = Math.floor(p.z - offset.z);
    if (x >= 0 && x < state.width && z >= 0 && z < state.height) tile = { x, z };
  }
  return { tile, facility };
}

function climbToFacilityRoot(object) {
  let node = object;
  while (node && node.parent && !node.userData.facilityId) node = node.parent;
  return node?.userData?.facilityId ? node : null;
}

function updateGhost() {
  if (!ghost || !state.selectedType || !hoveredTile) {
    if (ghost) ghost.visible = false;
    return;
  }
  const def = facilityDefs[state.selectedType];
  const footprint = getRotatedSize(def.size, state.rotation);
  const valid = canPlace(hoveredTile.x, hoveredTile.z, footprint[0], footprint[1]);
  const offset = getOffset();
  ghost.position.set(offset.x + hoveredTile.x + footprint[0] / 2, 0.04, offset.z + hoveredTile.z + footprint[1] / 2);
  ghost.children[0].material = valid ? materials.ghostValid : materials.ghostInvalid;
  ghost.visible = true;
}

function rotateBlueprint() {
  state.rotation = (state.rotation + 1) % 4;
  createGhost();
  updateGhost();
}

function placeFacilityAt(x, z) {
  const type = state.selectedType;
  const def = facilityDefs[type];
  const footprint = getRotatedSize(def.size, state.rotation);
  if (!def.unlock(state)) {
    showToast('That facility is locked for now.');
    return;
  }
  if (state.cash < def.cost) {
    showToast(`Need £${(def.cost - state.cash).toLocaleString()} more for ${def.name}.`);
    return;
  }
  if (!canPlace(x, z, footprint[0], footprint[1])) {
    showToast('Cannot place there. Check overlap or plot boundary.');
    return;
  }
  const facility = {
    id: nextFacilityId++, type, x, z, w: footprint[0], h: footprint[1], rotation: state.rotation,
    condition: 100,
    users: 0,
    earned: 0
  };
  state.cash -= def.cost;
  state.facilities.push(facility);
  addFacilityMesh(facility);
  selectedFacilityId = facility.id;
  inspectFacility(facility.id);
  pulseAtFacility(facility, palette.valid);
  updateUi();
  showToast(`${def.name} built.`);
}

function addFacilityMesh(facility) {
  const def = facilityDefs[facility.type];
  const group = new THREE.Group();
  group.userData.facilityId = facility.id;
  group.userData.facilityType = facility.type;
  const offset = getOffset();
  group.position.set(offset.x + facility.x + facility.w / 2, 0.02, offset.z + facility.z + facility.h / 2);
  group.rotation.y = facility.rotation * Math.PI / 2;

  const base = new THREE.Mesh(new THREE.BoxGeometry(facility.w - 0.08, 0.12, facility.h - 0.08), new THREE.MeshStandardMaterial({ color: colorForType(facility.type, 0.8), roughness: 0.58, metalness: 0.04 }));
  base.position.y = 0.04;
  base.receiveShadow = true;
  group.add(base);

  const label = makeFloatingLabel(`${def.emoji} ${def.name}`, facility.w);
  label.position.set(0, 1.55, -facility.h * 0.33);
  group.add(label);

  def.build(group, facility);
  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.userData.facilityId = facility.id;
    }
  });
  groups.facilities.add(group);
}

function rebuildFacilities() {
  clearGroup(groups.facilities);
  state.facilities.forEach(addFacilityMesh);
}

function canPlace(x, z, w, h) {
  if (x < 0 || z < 0 || x + w > state.width || z + h > state.height) return false;
  return !state.facilities.some(f => rectsOverlap(x, z, w, h, f.x, f.z, f.w, f.h));
}

function rectsOverlap(ax, az, aw, ah, bx, bz, bw, bh) {
  return ax < bx + bw && ax + aw > bx && az < bz + bh && az + ah > bz;
}

function sellFacility(id) {
  const index = state.facilities.findIndex(f => f.id === id);
  if (index < 0) return;
  const f = state.facilities[index];
  const refund = Math.floor(facilityDefs[f.type].cost * 0.55 * (f.condition / 100));
  state.cash += refund;
  state.facilities.splice(index, 1);
  const mesh = groups.facilities.children.find(g => g.userData.facilityId === id);
  if (mesh) groups.facilities.remove(mesh);
  selectedFacilityId = null;
  state.visitors = state.visitors.filter(v => v.targetFacilityId !== id);
  rebuildVisitors();
  updateUi();
  showToast(`${facilityDefs[f.type].name} sold for £${refund.toLocaleString()}.`);
}

function expandPlot() {
  const cost = 4200 + state.expansions * 3500;
  if (state.cash < cost) {
    showToast(`Plot expansion costs £${cost.toLocaleString()}.`);
    return;
  }
  state.cash -= cost;
  state.expansions += 1;
  state.width += 4;
  state.height += 3;
  buildFloor();
  buildGrid();
  rebuildFacilities();
  rebuildVisitors();
  updateUi();
  showToast('Plot expanded. Time to add bigger leisure facilities.');
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  updateSimulation(dt);
  updateVisitors(dt);
  animateFacilityDetails(dt);
  controls.update();
  renderer.render(scene, camera);
}

function updateSimulation(dt) {
  const minutesPerSecond = 2.5;
  state.minute += dt * minutesPerSecond;
  if (state.minute >= 24 * 60) {
    state.minute -= 24 * 60;
    state.day += 1;
    dailyReview();
  }

  const open = isClubOpen();
  if (open) {
    maybeSpawnVisitor(dt);
    const upkeep = getTotalUpkeep();
    state.cash -= upkeep * dt / 30;
    state.cleanliness = clamp(state.cleanliness - (state.visitors.length * 0.006 + state.facilities.length * 0.003) * dt, 20, 100);
    state.facilities.forEach(f => f.condition = clamp(f.condition - (0.002 + facilityDefs[f.type].upkeep * 0.0005) * dt, 35, 100));
  } else {
    state.cleanliness = clamp(state.cleanliness + 2.2 * dt, 20, 100);
  }

  const metrics = calculateMetrics();
  state.rating = lerp(state.rating, metrics.rating, 0.02);
  state.members = Math.max(0, Math.round(lerp(state.members, metrics.targetMembers, 0.018)));
  state.reputation = Math.max(0, Math.floor((state.rating - 45) / 6 + state.day * 0.08 + getLuxuryScore() / 16));

  if (Math.random() < dt * 0.6) updateUi();
}

function isClubOpen() {
  const hour = state.minute / 60;
  return hour >= 6 && hour <= 22.5;
}

function maybeSpawnVisitor(dt) {
  const hasReception = countFacilities('reception') > 0;
  if (!hasReception) return;
  const demand = Math.min(2.3, 0.18 + state.members / 95 + state.rating / 180);
  if (state.visitors.length > Math.max(6, getCapacity() * 0.95)) return;
  if (Math.random() < dt * demand) spawnVisitor();
}

function spawnVisitor() {
  const choices = state.facilities.filter(f => facilityDefs[f.type].capacity > 0 && f.users < facilityDefs[f.type].capacity);
  if (!choices.length) return;
  const weighted = choices.flatMap(f => Array(Math.max(1, Math.round(facilityDefs[f.type].appeal / 2))).fill(f));
  const target = weighted[Math.floor(Math.random() * weighted.length)];
  target.users += 1;

  const offset = getOffset();
  const entrance = new THREE.Vector3(offset.x + state.width * 0.5, 0.05, offset.z - 0.8);
  const targetPos = new THREE.Vector3(offset.x + target.x + target.w / 2 + (Math.random() - 0.5) * Math.max(0.4, target.w - 1), 0.05, offset.z + target.z + target.h / 2 + (Math.random() - 0.5) * Math.max(0.4, target.h - 1));
  const visitor = {
    id: nextVisitorId++, targetFacilityId: target.id, phase: 'walkIn', progress: 0,
    pos: entrance.clone(), from: entrance, to: targetPos,
    useTime: 4 + Math.random() * 9,
    spend: facilityDefs[target.type].income * (0.65 + Math.random() * 0.75),
    mood: clamp(state.rating + (Math.random() - 0.5) * 30, 5, 100)
  };
  state.visitors.push(visitor);
  groups.visitors.add(makeVisitorMesh(visitor));
}

function updateVisitors(dt) {
  for (let i = state.visitors.length - 1; i >= 0; i--) {
    const v = state.visitors[i];
    const mesh = groups.visitors.getObjectByName(`visitor-${v.id}`);
    if (!mesh) continue;
    if (v.phase === 'walkIn') {
      v.progress += dt * 0.42;
      v.pos.lerpVectors(v.from, v.to, easeInOut(v.progress));
      if (v.progress >= 1) {
        v.phase = 'use';
        v.progress = 0;
      }
    } else if (v.phase === 'use') {
      v.progress += dt / v.useTime;
      mesh.rotation.y += dt * 1.7;
      if (v.progress >= 1) {
        const facility = state.facilities.find(f => f.id === v.targetFacilityId);
        if (facility) {
          facility.users = Math.max(0, facility.users - 1);
          facility.earned += v.spend;
        }
        const cleanMultiplier = clamp(state.cleanliness / 100, 0.35, 1.05);
        const serviceBonus = 0.65 + cleanMultiplier * 0.35;
        const earned = Math.round(v.spend * serviceBonus);
        state.cash += earned;
        state.lastIncome += earned;
        floatingCash(v.to, earned);
        v.phase = 'walkOut';
        v.progress = 0;
        v.from = v.pos.clone();
        const offset = getOffset();
        v.to = new THREE.Vector3(offset.x + state.width * 0.5, 0.05, offset.z - 0.8);
      }
    } else {
      v.progress += dt * 0.52;
      v.pos.lerpVectors(v.from, v.to, easeInOut(v.progress));
      if (v.progress >= 1) {
        groups.visitors.remove(mesh);
        state.visitors.splice(i, 1);
        continue;
      }
    }

    mesh.position.copy(v.pos);
    mesh.position.y = 0.08 + Math.sin(performance.now() * 0.006 + v.id) * 0.025;
  }
}

function rebuildVisitors() {
  clearGroup(groups.visitors);
  state.visitors.forEach(v => groups.visitors.add(makeVisitorMesh(v)));
}

function dailyReview() {
  const metrics = calculateMetrics();
  const bonus = Math.max(0, Math.round((state.rating - 65) * 18 + state.members * 2.5));
  if (bonus > 0) {
    state.cash += bonus;
    showToast(`Day ${state.day}: membership renewals brought in £${bonus.toLocaleString()}.`);
  }
  state.lastIncome = 0;
  state.cleanliness = Math.min(100, state.cleanliness + 18);
  state.facilities.forEach(f => f.condition = Math.min(100, f.condition + 8));
  if (metrics.rating < 45) showToast('Members are unhappy. Add variety, decor, changing rooms or reduce crowding.');
}

function calculateMetrics() {
  const capacity = getCapacity();
  const variety = new Set(state.facilities.map(f => f.type)).size;
  const luxury = getLuxuryScore();
  const corePenalty = countFacilities('reception') ? 0 : 35;
  const crowding = capacity ? clamp(state.members / capacity, 0, 1.8) : 1.8;
  const crowdPenalty = Math.max(0, (crowding - 0.78) * 34);
  const conditionAvg = state.facilities.length ? avg(state.facilities.map(f => f.condition)) : 100;
  const conditionPenalty = Math.max(0, 100 - conditionAvg) * 0.24;
  const cleanPenalty = Math.max(0, 100 - state.cleanliness) * 0.32;
  const rating = clamp(32 + variety * 5 + luxury * 0.9 + capacity * 0.5 - crowdPenalty - corePenalty - conditionPenalty - cleanPenalty, 5, 100);
  const targetMembers = Math.max(0, Math.round(capacity * clamp(0.35 + rating / 105 + state.reputation / 90, 0, 1.25)));
  return { rating, targetMembers };
}

function getCapacity() {
  return state.facilities.reduce((sum, f) => sum + facilityDefs[f.type].capacity, 0);
}

function getTotalUpkeep() {
  return state.facilities.reduce((sum, f) => sum + facilityDefs[f.type].upkeep, 0);
}

function getLuxuryScore() {
  return state.facilities.reduce((sum, f) => sum + facilityDefs[f.type].appeal + (f.type === 'plant' ? 1 : 0), 0);
}

function countFacilities(type) {
  return state.facilities.filter(f => f.type === type).length;
}

function getOffset() {
  return { x: -state.width / 2, z: -state.height / 2 };
}

function getRotatedSize(size, rotation) {
  return rotation % 2 === 0 ? [...size] : [size[1], size[0]];
}

function updateUi(force = false) {
  ui.cash.textContent = money(state.cash);
  ui.members.textContent = state.members.toLocaleString();
  ui.rating.textContent = `${Math.round(state.rating)}%`;
  ui.rep.textContent = state.reputation.toLocaleString();
  ui.day.textContent = state.day.toLocaleString();
  ui.clock.textContent = formatClock(state.minute);
  ui.cleanText.textContent = `${Math.round(state.cleanliness)}%`;
  ui.cleanBar.style.width = `${Math.round(state.cleanliness)}%`;
  const luxuryPct = clamp(getLuxuryScore(), 0, 100);
  ui.luxuryText.textContent = `${Math.round(luxuryPct)}%`;
  ui.luxuryBar.style.width = `${luxuryPct}%`;

  document.querySelectorAll('.facility-btn').forEach(btn => {
    const type = btn.dataset.type;
    const def = facilityDefs[type];
    btn.classList.toggle('active', state.selectedType === type && !state.deleteMode);
    btn.classList.toggle('locked', !def.unlock(state));
  });
  ui.selectedHint.textContent = state.deleteMode ? 'Bulldoze mode' : state.selectedType ? facilityDefs[state.selectedType].name : 'Inspect mode';

  const expandCost = 4200 + state.expansions * 3500;
  ui.expandBtn.textContent = `Expand £${shortNumber(expandCost)}`;

  ui.objectives.innerHTML = '';
  objectives.forEach(o => {
    const li = document.createElement('li');
    li.textContent = o.text;
    li.className = o.done() ? 'done' : '';
    ui.objectives.appendChild(li);
  });

  if (force && state.selectedType) inspectType(state.selectedType);
}

function inspectType(type) {
  const def = facilityDefs[type];
  ui.inspectTitle.textContent = `${def.emoji} ${def.name}`;
  ui.inspectBody.textContent = `${def.desc} Cost: £${def.cost.toLocaleString()}. Capacity: ${def.capacity}. Appeal: ${def.appeal}. Upkeep: £${def.upkeep}/tick.`;
}

function inspectFacility(id) {
  const f = state.facilities.find(item => item.id === id);
  if (!f) return;
  const def = facilityDefs[f.type];
  ui.inspectTitle.textContent = `${def.emoji} ${def.name}`;
  ui.inspectBody.textContent = `Condition ${Math.round(f.condition)}%. Currently serving ${f.users}/${def.capacity}. Lifetime earned £${Math.round(f.earned).toLocaleString()}. Sell value about £${Math.round(def.cost * 0.55 * f.condition / 100).toLocaleString()}.`;
}

function showToast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.add('hidden'), 2600);
}

function saveGame() {
  const save = {
    cash: state.cash,
    members: state.members,
    rating: state.rating,
    reputation: state.reputation,
    day: state.day,
    minute: state.minute,
    cleanliness: state.cleanliness,
    width: state.width,
    height: state.height,
    expansions: state.expansions,
    facilities: state.facilities,
    nextFacilityId
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  showToast('Game saved locally in this browser.');
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    showToast('No save found yet.');
    return;
  }
  try {
    const save = JSON.parse(raw);
    Object.assign(state, {
      cash: save.cash ?? 8000,
      members: save.members ?? 0,
      rating: save.rating ?? 58,
      reputation: save.reputation ?? 0,
      day: save.day ?? 1,
      minute: save.minute ?? 6 * 60,
      cleanliness: save.cleanliness ?? 100,
      width: save.width ?? START_W,
      height: save.height ?? START_H,
      expansions: save.expansions ?? 0,
      facilities: save.facilities ?? [],
      visitors: []
    });
    nextFacilityId = save.nextFacilityId ?? (1 + Math.max(0, ...state.facilities.map(f => f.id)));
    buildFloor();
    buildGrid();
    rebuildFacilities();
    rebuildVisitors();
    updateUi(true);
    showToast('Save loaded.');
  } catch (err) {
    console.error(err);
    showToast('Save could not be loaded.');
  }
}

function resetGame() {
  localStorage.removeItem(SAVE_KEY);
  Object.assign(state, {
    cash: 8000,
    members: 0,
    rating: 58,
    reputation: 0,
    day: 1,
    minute: 6 * 60,
    cleanliness: 100,
    width: START_W,
    height: START_H,
    expansions: 0,
    selectedType: 'reception',
    rotation: 0,
    deleteMode: false,
    facilities: [],
    visitors: [],
    lastIncome: 0
  });
  nextFacilityId = 1;
  nextVisitorId = 1;
  buildFloor();
  buildGrid();
  clearGroup(groups.facilities);
  clearGroup(groups.visitors);
  createGhost();
  updateUi(true);
  showToast('Fresh club started.');
}

function buildReception(group, f) {
  addBox(group, 0, 0.34, 0, f.w - 0.5, 0.42, 0.55, materials.wood);
  addBox(group, -f.w * 0.27, 0.72, 0, 0.38, 0.32, 0.2, materials.dark);
  addBox(group, f.w * 0.22, 0.72, 0, 0.48, 0.32, 0.2, materials.gold);
  addBox(group, 0, 1.05, -f.h * 0.36, f.w - 0.55, 0.12, 0.12, materials.teal);
  for (let i = 0; i < 3; i++) addPlant(group, -f.w * 0.32 + i * 0.45, 0, f.h * 0.28, 0.32);
}

function buildCardio(group, f) {
  for (let i = 0; i < 4; i++) {
    const x = -f.w * 0.35 + i * 0.72;
    addTreadmill(group, x, -0.45);
  }
  for (let i = 0; i < 3; i++) addBike(group, -f.w * 0.28 + i * 0.8, 0.62);
  addBox(group, 0, 1.1, -f.h * 0.44, f.w - 0.4, 0.8, 0.04, materials.glass);
}

function buildWeights(group, f) {
  for (let i = 0; i < 3; i++) addBench(group, -f.w * 0.28 + i * 0.9, -0.42);
  addRack(group, -f.w * 0.35, 0.55);
  addRack(group, f.w * 0.35, 0.55);
  for (let i = 0; i < 4; i++) addDumbbell(group, -0.75 + i * 0.5, 0.3);
}

function buildStudio(group, f) {
  for (let x = 0; x < 3; x++) {
    for (let z = 0; z < 2; z++) {
      addBox(group, -0.95 + x * 0.95, 0.08, -0.36 + z * 0.75, 0.66, 0.05, 0.42, materials.purple);
    }
  }
  addBox(group, 0, 0.45, -f.h * 0.43, f.w - 0.4, 0.55, 0.05, materials.glass);
  addBox(group, 0, 0.85, f.h * 0.37, 0.9, 0.1, 0.12, materials.gold);
}

function buildPool(group, f) {
  const water = new THREE.Mesh(new THREE.BoxGeometry(f.w - 0.55, 0.08, f.h - 0.7), materials.water);
  water.position.y = 0.13;
  water.userData.animate = 'water';
  group.add(water);
  addBox(group, 0, 0.16, -f.h * 0.5 + 0.18, f.w - 0.2, 0.16, 0.18, materials.wall);
  addBox(group, 0, 0.16, f.h * 0.5 - 0.18, f.w - 0.2, 0.16, 0.18, materials.wall);
  for (let i = -2; i <= 2; i++) addBox(group, i * ((f.w - 1) / 4), 0.2, 0, 0.035, 0.045, f.h - 0.8, materials.wall);
  addBox(group, -f.w * 0.42, 0.3, f.h * 0.32, 0.25, 0.5, 0.45, materials.gold);
}

function buildSauna(group, f) {
  addBox(group, 0, 0.45, 0, f.w - 0.35, 0.6, f.h - 0.35, materials.wood);
  addBox(group, 0, 0.78, -f.h * 0.4, f.w - 0.45, 0.5, 0.05, materials.glass);
  for (let i = 0; i < 3; i++) {
    const steam = new THREE.Mesh(new THREE.TorusGeometry(0.18 + i * 0.04, 0.012, 8, 24), materials.glass);
    steam.position.set(-0.35 + i * 0.34, 1.1 + i * 0.1, 0.15);
    steam.rotation.x = Math.PI / 2;
    steam.userData.animate = 'steam';
    group.add(steam);
  }
}

function buildJuice(group, f) {
  addBox(group, 0, 0.34, 0, f.w - 0.45, 0.42, 0.5, materials.gold);
  addBox(group, -0.45, 0.72, -0.05, 0.22, 0.45, 0.22, materials.green);
  addBox(group, 0, 0.76, -0.05, 0.22, 0.52, 0.22, materials.pink);
  addBox(group, 0.45, 0.72, -0.05, 0.22, 0.45, 0.22, materials.teal);
  addBox(group, 0, 1.02, f.h * 0.32, f.w - 0.65, 0.12, 0.12, materials.wood);
}

function buildSpa(group, f) {
  addSpaBed(group, -0.45, -0.35);
  addSpaBed(group, 0.55, 0.25);
  addBox(group, -f.w * 0.38, 0.65, f.h * 0.34, 0.16, 1.1, 0.16, materials.gold);
  const lamp = new THREE.PointLight(0xffb6d8, 1.8, 4, 2);
  lamp.position.set(-0.4, 1.4, 0.1);
  group.add(lamp);
}

function buildLocker(group, f) {
  for (let i = 0; i < 5; i++) addBox(group, -f.w * 0.38 + i * 0.36, 0.55, -f.h * 0.32, 0.28, 0.9, 0.22, materials.blue);
  for (let i = 0; i < 3; i++) addBox(group, -0.5 + i * 0.5, 0.25, 0.35, 0.36, 0.32, 0.9, materials.wood);
  addBox(group, f.w * 0.38, 0.58, 0.15, 0.12, 1.0, 0.9, materials.glass);
}

function buildPlant(group, f) {
  addPlant(group, 0, 0, 0, 0.75);
}

function addBox(group, x, y, z, w, h, d, mat) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}

function addCylinder(group, x, y, z, r, h, mat, radial = 24) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, radial), mat);
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}

function addTreadmill(group, x, z) {
  addBox(group, x, 0.18, z, 0.55, 0.12, 0.86, materials.dark);
  addBox(group, x, 0.32, z + 0.32, 0.42, 0.1, 0.12, materials.teal);
  addBox(group, x - 0.22, 0.54, z + 0.45, 0.06, 0.48, 0.06, materials.wall);
  addBox(group, x + 0.22, 0.54, z + 0.45, 0.06, 0.48, 0.06, materials.wall);
  addBox(group, x, 0.78, z + 0.45, 0.46, 0.08, 0.08, materials.wall);
}

function addBike(group, x, z) {
  addCylinder(group, x - 0.2, 0.2, z, 0.16, 0.06, materials.dark, 18).rotation.z = Math.PI / 2;
  addCylinder(group, x + 0.2, 0.2, z, 0.16, 0.06, materials.dark, 18).rotation.z = Math.PI / 2;
  addBox(group, x, 0.32, z, 0.42, 0.08, 0.08, materials.wall);
  addBox(group, x, 0.55, z - 0.05, 0.22, 0.08, 0.22, materials.teal);
  addBox(group, x + 0.18, 0.72, z + 0.08, 0.26, 0.06, 0.06, materials.wall);
}

function addBench(group, x, z) {
  addBox(group, x, 0.28, z, 0.78, 0.14, 0.25, materials.dark);
  addBox(group, x - 0.28, 0.14, z, 0.08, 0.26, 0.08, materials.wall);
  addBox(group, x + 0.28, 0.14, z, 0.08, 0.26, 0.08, materials.wall);
  addDumbbell(group, x, z + 0.28);
}

function addRack(group, x, z) {
  addBox(group, x, 0.58, z, 0.08, 0.98, 0.08, materials.wall);
  addBox(group, x + 0.44, 0.58, z, 0.08, 0.98, 0.08, materials.wall);
  addBox(group, x + 0.22, 0.9, z, 0.58, 0.08, 0.08, materials.wall);
  for (let i = 0; i < 3; i++) addCylinder(group, x + 0.22, 0.35 + i * 0.18, z + 0.1, 0.09, 0.08, materials.dark, 16).rotation.x = Math.PI / 2;
}

function addDumbbell(group, x, z) {
  const bar = addBox(group, x, 0.22, z, 0.34, 0.045, 0.045, materials.wall);
  addCylinder(group, x - 0.2, 0.22, z, 0.07, 0.06, materials.dark, 12).rotation.z = Math.PI / 2;
  addCylinder(group, x + 0.2, 0.22, z, 0.07, 0.06, materials.dark, 12).rotation.z = Math.PI / 2;
  return bar;
}

function addSpaBed(group, x, z) {
  addBox(group, x, 0.32, z, 0.82, 0.18, 1.05, materials.wall);
  addBox(group, x, 0.46, z - 0.28, 0.62, 0.12, 0.34, materials.pink);
  addBox(group, x, 0.21, z - 0.35, 0.08, 0.24, 0.08, materials.wood);
  addBox(group, x - 0.32, 0.21, z + 0.35, 0.08, 0.24, 0.08, materials.wood);
  addBox(group, x + 0.32, 0.21, z + 0.35, 0.08, 0.24, 0.08, materials.wood);
}

function addPlant(group, x, y, z, scale = 1) {
  addCylinder(group, x, y + 0.18 * scale, z, 0.13 * scale, 0.35 * scale, materials.wood, 16);
  const leaves = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.18 * scale, 12, 8), materials.green);
    leaf.position.set(Math.cos(i * 1.26) * 0.16 * scale, y + 0.5 * scale + Math.random() * 0.05, z + Math.sin(i * 1.26) * 0.16 * scale);
    leaf.scale.set(0.7, 1.35, 0.55);
    leaf.rotation.y = i * 1.26;
    leaves.add(leaf);
  }
  leaves.position.x = x;
  group.add(leaves);
}

function makeVisitorMesh(v) {
  const g = new THREE.Group();
  g.name = `visitor-${v.id}`;
  const color = new THREE.Color().setHSL(0.48 + Math.random() * 0.32, 0.55, 0.58);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.38, 6, 12), new THREE.MeshStandardMaterial({ color, roughness: 0.45 }));
  body.position.y = 0.42;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), new THREE.MeshStandardMaterial({ color: 0xf2c49c, roughness: 0.55 }));
  head.position.y = 0.78;
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.22, 16), materials.shadow);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  g.add(shadow, body, head);
  g.position.copy(v.pos);
  return g;
}

function makeFloatingLabel(text, width = 2) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 128;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(5, 12, 20, 0.68)';
  roundRect(ctx, 18, 22, 476, 70, 28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(117, 229, 210, 0.55)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.font = '700 36px Inter, Arial, sans-serif';
  ctx.fillStyle = '#f8fbff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 57, 440);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.scale.set(Math.max(2.1, width * 0.7), 0.72, 1);
  return sprite;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function floatingCash(pos, amount) {
  const label = makeFloatingLabel(`+£${amount}`, 1.6);
  label.position.copy(pos);
  label.position.y = 1.5;
  label.userData.floatLife = 1.6;
  groups.effects.add(label);
}

function pulseAtFacility(facility, color) {
  const offset = getOffset();
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, Math.max(facility.w, facility.h) * 0.72, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, side: THREE.DoubleSide }));
  ring.position.set(offset.x + facility.x + facility.w / 2, 0.035, offset.z + facility.z + facility.h / 2);
  ring.rotation.x = -Math.PI / 2;
  ring.userData.pulseLife = 1.2;
  groups.effects.add(ring);
}

function animateFacilityDetails(dt) {
  groups.facilities.traverse(obj => {
    if (obj.userData.animate === 'water') {
      obj.position.y = 0.13 + Math.sin(performance.now() * 0.003) * 0.015;
    }
    if (obj.userData.animate === 'steam') {
      obj.position.y += dt * 0.12;
      obj.material.opacity = 0.25 + Math.sin(performance.now() * 0.004 + obj.position.x) * 0.12;
      if (obj.position.y > 1.55) obj.position.y = 1.05;
    }
  });

  for (let i = groups.effects.children.length - 1; i >= 0; i--) {
    const obj = groups.effects.children[i];
    if (obj.userData.floatLife != null) {
      obj.userData.floatLife -= dt;
      obj.position.y += dt * 0.65;
      obj.material.opacity = clamp(obj.userData.floatLife / 1.2, 0, 1);
      if (obj.userData.floatLife <= 0) groups.effects.remove(obj);
    }
    if (obj.userData.pulseLife != null) {
      obj.userData.pulseLife -= dt;
      obj.scale.multiplyScalar(1 + dt * 0.8);
      obj.material.opacity = clamp(obj.userData.pulseLife / 1.2 * 0.45, 0, 0.45);
      if (obj.userData.pulseLife <= 0) groups.effects.remove(obj);
    }
  }
}

function colorForType(type, light = 0.55) {
  const map = {
    reception: 0x3d6f7d,
    cardio: 0x285e70,
    weights: 0x39465b,
    studio: 0x5a4e83,
    pool: 0x1d7192,
    sauna: 0x7d5532,
    juice: 0x537f49,
    spa: 0x7e5576,
    locker: 0x3d5c86,
    plant: 0x31593c
  };
  return map[type] ?? 0xffffff;
}

function clearGroup(group) {
  while (group.children.length) {
    const obj = group.children.pop();
    obj.traverse?.((child) => {
      if (child.geometry) child.geometry.dispose?.();
      if (child.material && !Object.values(materials).includes(child.material)) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose?.());
        else child.material.dispose?.();
      }
    });
  }
}

function formatClock(minute) {
  const total = Math.floor(minute) % (24 * 60);
  const h = Math.floor(total / 60).toString().padStart(2, '0');
  const m = Math.floor(total % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function money(v) {
  const rounded = Math.round(v);
  const sign = rounded < 0 ? '-' : '';
  return `${sign}£${Math.abs(rounded).toLocaleString()}`;
}

function shortNumber(v) {
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
  return `${v}`;
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function avg(values) { return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0; }
function easeInOut(t) { return t >= 1 ? 1 : t < 0 ? 0 : t * t * (3 - 2 * t); }
