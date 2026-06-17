import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

const canvas = document.querySelector('#game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x071521);
scene.fog = new THREE.Fog(0x071521, 34, 105);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 220);
camera.position.set(19, 22, 25);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.46;
controls.minDistance = 10;
controls.maxDistance = 62;
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
const START_W = 18;
const START_H = 13;
const SAVE_KEY = 'leisure-club-tycoon-save-v3';

const ui = {
  cash: $('#cash'),
  members: $('#members'),
  rating: $('#rating'),
  rep: $('#rep'),
  day: $('#day'),
  clock: $('#clock'),
  buildMenu: $('#buildMenu'),
  selectedHint: $('#selectedHint'),
  inspectTitle: $('#inspectTitle'),
  inspectBody: $('#inspectBody'),
  cleanText: $('#cleanText'),
  cleanBar: $('#cleanBar'),
  luxuryText: $('#luxuryText'),
  luxuryBar: $('#luxuryBar'),
  objectives: $('#objectives'),
  toast: $('#toast'),
  rotateBtn: $('#rotateBtn'),
  deleteBtn: $('#deleteBtn'),
  cancelBtn: $('#cancelBtn'),
  expandBtn: $('#expandBtn'),
  saveBtn: $('#saveBtn'),
  loadBtn: $('#loadBtn'),
  resetBtn: $('#resetBtn'),
  mobileRotate: $('#mobileRotate'),
  mobileCancel: $('#mobileCancel')
};

const palette = {
  floor: 0x162f40,
  floor2: 0x1d4053,
  grid: 0x6fb7c7,
  valid: 0x83f5d9,
  invalid: 0xff6780,
  wall: 0xdce9ee,
  stone: 0xb9c3c7,
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
  orange: 0xffb45c,
  red: 0xff7286
};

const materials = {
  floor: new THREE.MeshStandardMaterial({ color: palette.floor, roughness: 0.83, metalness: 0.02 }),
  floorAlt: new THREE.MeshStandardMaterial({ color: palette.floor2, roughness: 0.82, metalness: 0.02 }),
  grid: new THREE.LineBasicMaterial({ color: palette.grid, transparent: true, opacity: 0.18 }),
  wall: new THREE.MeshStandardMaterial({ color: palette.wall, roughness: 0.55, metalness: 0.04 }),
  stone: new THREE.MeshStandardMaterial({ color: palette.stone, roughness: 0.72, metalness: 0.05 }),
  dark: new THREE.MeshStandardMaterial({ color: palette.dark, roughness: 0.55 }),
  teal: new THREE.MeshStandardMaterial({ color: palette.teal, roughness: 0.35, metalness: 0.08 }),
  blue: new THREE.MeshStandardMaterial({ color: palette.blue, roughness: 0.4, metalness: 0.05 }),
  gold: new THREE.MeshStandardMaterial({ color: palette.gold, roughness: 0.48, metalness: 0.12 }),
  green: new THREE.MeshStandardMaterial({ color: palette.green, roughness: 0.54 }),
  pink: new THREE.MeshStandardMaterial({ color: palette.pink, roughness: 0.52 }),
  purple: new THREE.MeshStandardMaterial({ color: palette.purple, roughness: 0.4, metalness: 0.08 }),
  wood: new THREE.MeshStandardMaterial({ color: palette.wood, roughness: 0.76 }),
  orange: new THREE.MeshStandardMaterial({ color: palette.orange, roughness: 0.52, metalness: 0.04 }),
  red: new THREE.MeshStandardMaterial({ color: palette.red, roughness: 0.5 }),
  water: new THREE.MeshPhysicalMaterial({ color: palette.water, roughness: 0.05, metalness: 0.02, transmission: 0.17, transparent: true, opacity: 0.78 }),
  glass: new THREE.MeshPhysicalMaterial({ color: palette.glass, roughness: 0.02, metalness: 0.0, transmission: 0.35, transparent: true, opacity: 0.38 }),
  ghostValid: new THREE.MeshStandardMaterial({ color: palette.valid, transparent: true, opacity: 0.42, roughness: 0.25 }),
  ghostInvalid: new THREE.MeshStandardMaterial({ color: palette.invalid, transparent: true, opacity: 0.42, roughness: 0.25 }),
  shadow: new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 })
};

const facilityDefs = {
  reception: {
    name: 'Reception', emoji: '🛎️', cost: 850, size: [3, 2], income: 12, capacity: 4, appeal: 6, upkeep: 2,
    desc: 'Check-in point. Staffed reception improves first impressions and member flow.', unlock: () => true, build: buildReception
  },
  cardio: {
    name: 'Cardio Suite', emoji: '🏃', cost: 1450, size: [4, 3], income: 28, capacity: 9, appeal: 8, upkeep: 7,
    desc: 'Treadmills, bikes and a premium mirrored cardio floor.', unlock: () => countFacilities('reception') > 0, build: buildCardio
  },
  weights: {
    name: 'Free Weights', emoji: '🏋️', cost: 1750, size: [4, 3], income: 32, capacity: 8, appeal: 7, upkeep: 8,
    desc: 'Benches, racks and strength kit for serious members.', unlock: () => countFacilities('reception') > 0, build: buildWeights
  },
  studio: {
    name: 'Wellness Studio', emoji: '🧘', cost: 1250, size: [4, 3], income: 25, capacity: 10, appeal: 9, upkeep: 5,
    desc: 'Yoga, pilates and classes. Instructors make this more profitable.', unlock: () => state.reputation >= 3 || countFacilities('cardio') > 0, build: buildStudio
  },
  locker: {
    name: 'Changing Room', emoji: '🚿', cost: 1200, size: [3, 3], income: 8, capacity: 12, appeal: 11, upkeep: 5,
    desc: 'Supports bigger membership and keeps leisure/pool complaints down.', unlock: () => countFacilities('reception') > 0, build: buildLocker
  },
  pool: {
    name: 'Pool Lane', emoji: '🏊', cost: 3200, size: [6, 3], income: 55, capacity: 12, appeal: 16, upkeep: 18,
    desc: 'A premium leisure-club anchor. Lifeguards increase pool rating and safety.', unlock: () => state.reputation >= 7 || state.cash >= 5200, build: buildPool
  },
  sauna: {
    name: 'Sauna & Steam', emoji: '♨️', cost: 2150, size: [3, 3], income: 42, capacity: 6, appeal: 13, upkeep: 11,
    desc: 'Spa heat rooms. Therapists and cleaners help premium guests stay happy.', unlock: () => state.reputation >= 6 || countFacilities('pool') > 0, build: buildSauna
  },
  juice: {
    name: 'Juice Bar', emoji: '🥤', cost: 1350, size: [3, 2], income: 38, capacity: 6, appeal: 10, upkeep: 6,
    desc: 'Extra spend per visit. Adds a warmer social-club vibe.', unlock: () => state.reputation >= 4 || countFacilities('cardio') + countFacilities('weights') >= 2, build: buildJuice
  },
  spa: {
    name: 'Spa Room', emoji: '💆', cost: 2550, size: [3, 3], income: 52, capacity: 4, appeal: 15, upkeep: 10,
    desc: 'Massage tables, treatment lighting and luxury rating boost. Therapists boost income.', unlock: () => state.reputation >= 9 || countFacilities('sauna') > 0, build: buildSpa
  },
  lounge: {
    name: 'Cafe Lounge', emoji: '☕', cost: 1850, size: [4, 3], income: 34, capacity: 12, appeal: 13, upkeep: 7,
    desc: 'Sofas, coffee, warm lighting and a members-club feel.', unlock: () => state.reputation >= 4 || countFacilities('juice') > 0, build: buildLounge
  },
  plant: {
    name: 'Plant Decor', emoji: '🌿', cost: 180, size: [1, 1], income: 0, capacity: 0, appeal: 3, upkeep: 0,
    desc: 'Cheap luxury/decor boost. Fills dead space nicely.', unlock: () => true, build: buildPlant
  }
};

const structureDefs = {
  wall: {
    name: 'Wall Panel', emoji: '🧱', cost: 90, size: [1, 1], appeal: 0.5, occupies: false,
    desc: 'Thin internal wall panel. Use Rotate to change direction.', unlock: () => true, build: buildWallPanel
  },
  glassWall: {
    name: 'Glass Wall', emoji: '🪟', cost: 140, size: [1, 1], appeal: 1.0, occupies: false,
    desc: 'Premium transparent partition for pool, studio and spa zones.', unlock: () => true, build: buildGlassWall
  },
  door: {
    name: 'Doorway', emoji: '🚪', cost: 120, size: [1, 1], appeal: 0.8, occupies: false,
    desc: 'Door frame for room entrances. Rotate to face the right way.', unlock: () => true, build: buildDoorway
  },
  woodFloor: {
    name: 'Warm Wood Floor', emoji: '🟫', cost: 35, size: [1, 1], appeal: 0.7, floor: true,
    desc: 'A single premium floor tile. Great for lounge, studio and spa zones.', unlock: () => true, build: buildWoodFloor
  },
  stoneFloor: {
    name: 'Stone Spa Floor', emoji: '⬜', cost: 45, size: [1, 1], appeal: 0.9, floor: true,
    desc: 'A cool stone tile for spa, pool and changing areas.', unlock: () => true, build: buildStoneFloor
  }
};

const staffDefs = {
  receptionist: {
    name: 'Receptionist', emoji: '👋', cost: 650, salary: 5, colour: 0x69dbc9,
    desc: 'Boosts check-in, rating and visitor patience.', unlock: () => countFacilities('reception') > 0
  },
  cleaner: {
    name: 'Cleaner', emoji: '🧽', cost: 750, salary: 7, colour: 0xf9d36c,
    desc: 'Slows cleanliness decay and repairs facility condition overnight.', unlock: () => true
  },
  instructor: {
    name: 'Instructor', emoji: '📋', cost: 900, salary: 10, colour: 0xb99cff,
    desc: 'Boosts cardio, weights and studio income.', unlock: () => countFacilities('cardio') + countFacilities('weights') + countFacilities('studio') > 0
  },
  lifeguard: {
    name: 'Lifeguard', emoji: '🛟', cost: 1100, salary: 12, colour: 0x65a9ff,
    desc: 'Improves pool appeal and removes the unstaffed-pool penalty.', unlock: () => countFacilities('pool') > 0
  },
  therapist: {
    name: 'Therapist', emoji: '💆', cost: 1250, salary: 14, colour: 0xff8ed3,
    desc: 'Boosts spa, sauna and premium wellness income.', unlock: () => countFacilities('spa') + countFacilities('sauna') > 0
  }
};

const objectives = [
  { text: 'Place reception', done: () => countFacilities('reception') >= 1 },
  { text: 'Create a room with walls, glass or a door', done: () => state.structures.length >= 4 },
  { text: 'Hire your first staff member', done: () => state.staff.length >= 1 },
  { text: 'Build cardio and changing rooms', done: () => countFacilities('cardio') >= 1 && countFacilities('locker') >= 1 },
  { text: 'Build a pool, sauna or spa', done: () => countFacilities('pool') + countFacilities('sauna') + countFacilities('spa') >= 1 },
  { text: 'Reach 80% club rating', done: () => state.rating >= 80 },
  { text: 'Expand the plot once', done: () => state.expansions >= 1 }
];

const state = {
  cash: 10500,
  members: 0,
  rating: 58,
  reputation: 0,
  day: 1,
  minute: 6 * 60,
  cleanliness: 100,
  width: START_W,
  height: START_H,
  expansions: 0,
  selectedKind: null,
  selectedType: null,
  rotation: 0,
  deleteMode: false,
  facilities: [],
  structures: [],
  floorTiles: [],
  staff: [],
  visitors: [],
  lastIncome: 0
};

const groups = {
  world: new THREE.Group(),
  floor: new THREE.Group(),
  grid: new THREE.Group(),
  floors: new THREE.Group(),
  structures: new THREE.Group(),
  facilities: new THREE.Group(),
  staff: new THREE.Group(),
  visitors: new THREE.Group(),
  effects: new THREE.Group()
};
scene.add(groups.world, groups.floor, groups.floors, groups.grid, groups.structures, groups.facilities, groups.staff, groups.visitors, groups.effects);

const placementPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(220, 220),
  new THREE.MeshBasicMaterial({ visible: false })
);
placementPlane.rotation.x = -Math.PI / 2;
scene.add(placementPlane);

let ghost = null;
let hoveredTile = null;
let hoveredFacility = null;
let hoveredStructure = null;
let selectedFacilityId = null;
let selectedStructureId = null;
let nextFacilityId = 1;
let nextStructureId = 1;
let nextStaffId = 1;
let nextVisitorId = 1;
let toastTimer = null;
let pointerStart = null;

initLighting();
initWorldDetails();
buildFloor();
buildGrid();
rebuildFloorTiles();
rebuildStructures();
createBuildMenu();
createGhost();
wireEvents();
updateUi(true);
showToast('Build rooms with walls/glass/doors, then place facilities and hire staff.');
animate();

function $(selector) {
  return document.querySelector(selector);
}

function initLighting() {
  scene.add(new THREE.HemisphereLight(0x9fdfff, 0x102331, 1.45));

  const sun = new THREE.DirectionalLight(0xffffff, 2.35);
  sun.position.set(16, 28, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 75;
  sun.shadow.camera.left = -38;
  sun.shadow.camera.right = 38;
  sun.shadow.camera.top = 38;
  sun.shadow.camera.bottom = -38;
  scene.add(sun);

  const tealLamp = new THREE.PointLight(0x62f2d7, 9, 32, 2.1);
  tealLamp.position.set(-8, 8, 7);
  scene.add(tealLamp);

  const warmLamp = new THREE.PointLight(0xffd486, 5.5, 24, 2.1);
  warmLamp.position.set(8, 5, -8);
  scene.add(warmLamp);
}

function initWorldDetails() {
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(20, 24, 0.9, 72),
    new THREE.MeshStandardMaterial({ color: 0x07101a, roughness: 0.95 })
  );
  base.position.y = -0.58;
  base.receiveShadow = true;
  groups.world.add(base);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(20.2, 0.055, 8, 120), materials.teal);
  ring.position.y = 0.025;
  ring.rotation.x = Math.PI / 2;
  groups.world.add(ring);

  for (let i = 0; i < 46; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 22 + Math.random() * 20;
    const h = 0.35 + Math.random() * 2.4;
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.55, 0.3, 0.08 + Math.random() * 0.08), roughness: 0.9 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.2 + Math.random() * 1.5, h, 0.2 + Math.random() * 1.5), mat);
    mesh.position.set(Math.cos(angle) * radius, h / 2 - 0.25, Math.sin(angle) * radius);
    mesh.rotation.y = Math.random() * Math.PI;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    groups.world.add(mesh);
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
      groups.floor.add(tile);
    }
  }

  addPerimeterWalls();
  addEntranceAndExterior();
  placementPlane.position.set(0, 0.04, 0);
}

function addPerimeterWalls() {
  const offset = getOffset();
  const y = 0.72;

  const back = new THREE.Mesh(new THREE.BoxGeometry(state.width + 0.1, 1.45, 0.08), materials.glass);
  back.position.set(0, y, offset.z + state.height + 0.05);
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.45, state.height + 0.1), materials.glass);
  left.position.set(offset.x - 0.05, y, 0);
  const right = left.clone();
  right.position.x = offset.x + state.width + 0.05;

  const frontLeft = new THREE.Mesh(new THREE.BoxGeometry(state.width * 0.38, 1.45, 0.08), materials.glass);
  frontLeft.position.set(offset.x + state.width * 0.19, y, offset.z - 0.05);
  const frontRight = frontLeft.clone();
  frontRight.position.x = offset.x + state.width * 0.81;

  [back, left, right, frontLeft, frontRight].forEach((w) => {
    w.castShadow = true;
    w.receiveShadow = true;
    groups.floor.add(w);
  });

  for (let x = 0; x <= state.width; x += 3) {
    addPost(offset.x + x, offset.z, materials.wall);
    addPost(offset.x + x, offset.z + state.height, materials.wall);
  }
  for (let z = 0; z <= state.height; z += 3) {
    addPost(offset.x, offset.z + z, materials.wall);
    addPost(offset.x + state.width, offset.z + z, materials.wall);
  }
}

function addEntranceAndExterior() {
  const offset = getOffset();
  const frontZ = offset.z - 0.55;

  const deck = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.08, 1.2), materials.stone);
  deck.position.set(0, -0.01, frontZ);
  deck.receiveShadow = true;
  groups.floor.add(deck);

  const doorGlass = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.45, 0.06), materials.glass);
  doorGlass.position.set(0, 0.72, offset.z - 0.05);
  doorGlass.castShadow = true;
  groups.floor.add(doorGlass);

  const header = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.4, 0.22), materials.dark);
  header.position.set(0, 1.74, offset.z - 0.2);
  header.castShadow = true;
  groups.floor.add(header);

  const label = makeFloatingLabel('AURA LEISURE CLUB', 4.2);
  label.position.set(0, 1.78, offset.z - 0.36);
  label.scale.set(4.5, 0.8, 1);
  groups.floor.add(label);

  const leftPlanter = new THREE.Group();
  addPlant(leftPlanter, 0, 0, 0, 0.75);
  leftPlanter.position.set(-2.55, 0.03, frontZ);
  groups.floor.add(leftPlanter);

  const rightPlanter = new THREE.Group();
  addPlant(rightPlanter, 0, 0, 0, 0.75);
  rightPlanter.position.set(2.55, 0.03, frontZ);
  groups.floor.add(rightPlanter);
}

function addPost(x, z, mat) {
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, 0.12), mat);
  post.position.set(x, 0.8, z);
  post.castShadow = true;
  groups.floor.add(post);
}

function buildGrid() {
  clearGroup(groups.grid);
  const offset = getOffset();
  const points = [];
  for (let x = 0; x <= state.width; x++) {
    points.push(new THREE.Vector3(offset.x + x, 0.012, offset.z), new THREE.Vector3(offset.x + x, 0.012, offset.z + state.height));
  }
  for (let z = 0; z <= state.height; z++) {
    points.push(new THREE.Vector3(offset.x, 0.012, offset.z + z), new THREE.Vector3(offset.x + state.width, 0.012, offset.z + z));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  groups.grid.add(new THREE.LineSegments(geo, materials.grid));
}

function createBuildMenu() {
  ui.buildMenu.innerHTML = '';
  addMenuHeading('Facilities');
  Object.entries(facilityDefs).forEach(([type, def]) => addBuildButton('facility', type, def));

  addMenuHeading('Rooms & Building');
  Object.entries(structureDefs).forEach(([type, def]) => addBuildButton('structure', type, def));

  addMenuHeading('Staff');
  Object.entries(staffDefs).forEach(([type, def]) => addBuildButton('staff', type, def));
}

function addMenuHeading(text) {
  const heading = document.createElement('div');
  heading.className = 'menu-heading';
  heading.textContent = text;
  ui.buildMenu.appendChild(heading);
}

function addBuildButton(kind, type, def) {
  const btn = document.createElement('button');
  btn.className = 'facility-btn';
  btn.dataset.kind = kind;
  btn.dataset.type = type;

  const price = kind === 'staff' ? `${money(def.cost)} + ${money(def.salary)}/day` : money(def.cost);
  const size = kind === 'facility' ? ` · ${def.size[0]}x${def.size[1]}` : kind === 'structure' && !def.floor ? ' · rotate' : '';
  btn.innerHTML = `
    <span class="emoji">${def.emoji}</span>
    <strong>${def.name}</strong>
    <small><span class="cost">${price}</span>${size}</small>
  `;

  btn.addEventListener('click', () => {
    if (!def.unlock(state)) {
      showToast(kind === 'staff' ? 'Locked: build the matching facility first.' : 'Locked. Improve reputation or add support facilities first.');
      return;
    }

    if (kind === 'staff') {
      hireStaff(type);
      return;
    }

    if (state.selectedKind === kind && state.selectedType === type && !state.deleteMode) {
      clearSelection('Inspect mode. Camera is safe to move.');
      return;
    }

    state.deleteMode = false;
    state.selectedKind = kind;
    state.selectedType = type;
    selectedFacilityId = null;
    selectedStructureId = null;
    createGhost();
    updateUi(true);
    inspectDefinition(kind, type);
  });

  ui.buildMenu.appendChild(btn);
}

function createGhost() {
  if (ghost) scene.remove(ghost);
  ghost = null;

  if (!state.selectedKind || !state.selectedType || state.deleteMode) return;

  ghost = new THREE.Group();
  const def = getSelectedDef();
  const footprint = getSelectedFootprint();
  const material = materials.ghostValid;

  if (state.selectedKind === 'facility') {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(footprint[0], 0.16, footprint[1]), material);
    mesh.position.y = 0.08;
    ghost.add(mesh);
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 }));
    edge.position.y = 0.08;
    ghost.add(edge);
  } else if (state.selectedKind === 'structure') {
    if (def.floor) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.045, 0.94), material);
      mesh.position.y = 0.025;
      ghost.add(mesh);
    } else {
      const horizontal = state.rotation % 2 === 0;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(horizontal ? 0.96 : 0.14, 1.15, horizontal ? 0.14 : 0.96), material);
      mesh.position.y = 0.58;
      ghost.add(mesh);
    }
  }

  ghost.visible = false;
  scene.add(ghost);
}

function wireEvents() {
  window.addEventListener('resize', onResize);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('keydown', onKeyDown);

  ui.rotateBtn?.addEventListener('click', rotateBlueprint);
  ui.mobileRotate?.addEventListener('click', rotateBlueprint);
  ui.cancelBtn?.addEventListener('click', () => clearSelection('Deselected. You can move the camera without placing anything.'));
  ui.mobileCancel?.addEventListener('click', () => clearSelection('Deselected.'));
  ui.deleteBtn?.addEventListener('click', toggleBulldoze);
  ui.expandBtn?.addEventListener('click', expandPlot);
  ui.saveBtn?.addEventListener('click', saveGame);
  ui.loadBtn?.addEventListener('click', loadGame);
  ui.resetBtn?.addEventListener('click', () => {
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
  if (e.key.toLowerCase() === 'b') toggleBulldoze();
  if (e.key === 'Escape' || e.key.toLowerCase() === 'q') clearSelection('Deselected.');
}

function onPointerMove(e) {
  const hit = getPointerHit(e);
  hoveredTile = hit.tile;
  hoveredFacility = hit.facility;
  hoveredStructure = hit.structure;
  updateGhost();
}

function onPointerDown(e) {
  if (e.button === 2) return;
  pointerStart = { x: e.clientX, y: e.clientY, time: performance.now() };
}

function onPointerUp(e) {
  if (e.button === 2 || !pointerStart) return;

  const dx = e.clientX - pointerStart.x;
  const dy = e.clientY - pointerStart.y;
  const moved = Math.hypot(dx, dy);
  pointerStart = null;

  const hit = getPointerHit(e);
  hoveredTile = hit.tile;
  hoveredFacility = hit.facility;
  hoveredStructure = hit.structure;
  updateGhost();

  if (moved > 6) return;

  if (state.deleteMode) {
    if (hoveredFacility) sellFacility(hoveredFacility.userData.facilityId);
    else if (hoveredStructure) sellStructure(hoveredStructure.userData.structureId);
    return;
  }

  if (state.selectedKind && state.selectedType && hoveredTile) {
    if (state.selectedKind === 'facility') placeFacilityAt(hoveredTile.x, hoveredTile.z);
    if (state.selectedKind === 'structure') placeStructureAt(hoveredTile.x, hoveredTile.z);
    return;
  }

  if (hoveredFacility) {
    selectedFacilityId = hoveredFacility.userData.facilityId;
    selectedStructureId = null;
    inspectFacility(selectedFacilityId);
    updateUi();
  } else if (hoveredStructure) {
    selectedStructureId = hoveredStructure.userData.structureId;
    selectedFacilityId = null;
    inspectStructure(selectedStructureId);
    updateUi();
  }
}

function getPointerHit(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const facilityHits = raycaster.intersectObjects(groups.facilities.children, true);
  const facilityHit = facilityHits.find((h) => h.object.userData.facilityId || h.object.parent?.userData?.facilityId);
  const facility = facilityHit ? climbToRootWithKey(facilityHit.object, 'facilityId') : null;

  const structureHits = raycaster.intersectObjects(groups.structures.children, true);
  const structureHit = structureHits.find((h) => h.object.userData.structureId || h.object.parent?.userData?.structureId);
  const structure = structureHit ? climbToRootWithKey(structureHit.object, 'structureId') : null;

  const planeHits = raycaster.intersectObject(placementPlane, false);
  let tile = null;
  if (planeHits.length) {
    const p = planeHits[0].point;
    const offset = getOffset();
    const x = Math.floor(p.x - offset.x);
    const z = Math.floor(p.z - offset.z);
    if (x >= 0 && x < state.width && z >= 0 && z < state.height) tile = { x, z };
  }

  return { tile, facility, structure };
}

function climbToRootWithKey(object, key) {
  let node = object;
  while (node && node.parent && !node.userData[key]) node = node.parent;
  return node?.userData?.[key] ? node : null;
}

function updateGhost() {
  if (!ghost || !state.selectedKind || !state.selectedType || !hoveredTile || state.deleteMode) {
    if (ghost) ghost.visible = false;
    return;
  }

  const footprint = getSelectedFootprint();
  const offset = getOffset();
  const valid = state.selectedKind === 'facility'
    ? canPlaceFacility(hoveredTile.x, hoveredTile.z, footprint[0], footprint[1])
    : canPlaceStructure(hoveredTile.x, hoveredTile.z);

  ghost.position.set(offset.x + hoveredTile.x + footprint[0] / 2, 0.045, offset.z + hoveredTile.z + footprint[1] / 2);
  ghost.children.forEach((child) => {
    if (child.material?.isMaterial) child.material = valid ? materials.ghostValid : materials.ghostInvalid;
  });
  ghost.visible = true;
}

function rotateBlueprint() {
  state.rotation = (state.rotation + 1) % 4;
  createGhost();
  updateGhost();
  updateUi();
}

function toggleBulldoze() {
  state.deleteMode = !state.deleteMode;
  if (state.deleteMode) {
    state.selectedKind = null;
    state.selectedType = null;
  }
  createGhost();
  updateUi();
  showToast(state.deleteMode ? 'Bulldoze mode: click a facility, wall, door or floor tile to sell it.' : 'Bulldoze mode off.');
}

function clearSelection(message = 'Deselected.') {
  state.selectedKind = null;
  state.selectedType = null;
  state.deleteMode = false;
  selectedFacilityId = null;
  selectedStructureId = null;
  createGhost();
  updateUi(true);
  showToast(message);
}

function getSelectedDef() {
  if (state.selectedKind === 'facility') return facilityDefs[state.selectedType];
  if (state.selectedKind === 'structure') return structureDefs[state.selectedType];
  return null;
}

function getSelectedFootprint() {
  const def = getSelectedDef();
  if (!def) return [1, 1];
  if (state.selectedKind === 'structure') return [1, 1];
  return getRotatedSize(def.size, state.rotation);
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
    showToast(`Need ${money(def.cost - state.cash)} more for ${def.name}.`);
    return;
  }
  if (!canPlaceFacility(x, z, footprint[0], footprint[1])) {
    showToast('Cannot place there. Check overlap or plot boundary.');
    return;
  }

  const facility = {
    id: nextFacilityId++,
    type,
    x,
    z,
    w: footprint[0],
    h: footprint[1],
    rotation: state.rotation,
    condition: 100,
    users: 0,
    earned: 0
  };

  state.cash -= def.cost;
  state.facilities.push(facility);
  addFacilityMesh(facility);
  selectedFacilityId = facility.id;
  selectedStructureId = null;
  inspectFacility(facility.id);
  pulseAtTile(x, z, footprint[0], footprint[1], palette.valid);
  updateUi();
  showToast(`${def.name} built.`);
}

function placeStructureAt(x, z) {
  const type = state.selectedType;
  const def = structureDefs[type];

  if (state.cash < def.cost) {
    showToast(`Need ${money(def.cost - state.cash)} more for ${def.name}.`);
    return;
  }
  if (!canPlaceStructure(x, z)) {
    showToast('Cannot place that there.');
    return;
  }

  if (def.floor) {
    const existingIndex = state.floorTiles.findIndex((f) => f.x === x && f.z === z);
    if (existingIndex >= 0) state.floorTiles.splice(existingIndex, 1);
    state.floorTiles.push({ id: nextStructureId++, type, x, z, rotation: 0 });
    state.cash -= def.cost;
    rebuildFloorTiles();
    pulseAtTile(x, z, 1, 1, palette.valid);
    updateUi();
    showToast(`${def.name} placed.`);
    return;
  }

  const structure = {
    id: nextStructureId++,
    type,
    x,
    z,
    rotation: state.rotation
  };

  state.cash -= def.cost;
  state.structures.push(structure);
  addStructureMesh(structure);
  selectedStructureId = structure.id;
  selectedFacilityId = null;
  inspectStructure(structure.id);
  pulseAtTile(x, z, 1, 1, palette.valid);
  updateUi();
  showToast(`${def.name} placed.`);
}

function canPlaceFacility(x, z, w, h) {
  if (x < 0 || z < 0 || x + w > state.width || z + h > state.height) return false;
  return !state.facilities.some((f) => rectsOverlap(x, z, w, h, f.x, f.z, f.w, f.h));
}

function canPlaceStructure(x, z) {
  if (x < 0 || z < 0 || x >= state.width || z >= state.height) return false;
  const def = getSelectedDef();
  if (def?.floor) return true;
  return !state.structures.some((s) => s.x === x && s.z === z && s.rotation % 2 === state.rotation % 2 && s.type !== 'door');
}

function rectsOverlap(ax, az, aw, ah, bx, bz, bw, bh) {
  return ax < bx + bw && ax + aw > bx && az < bz + bh && az + ah > bz;
}

function addFacilityMesh(facility) {
  const def = facilityDefs[facility.type];
  const group = new THREE.Group();
  group.userData.facilityId = facility.id;
  group.userData.facilityType = facility.type;

  const offset = getOffset();
  group.position.set(offset.x + facility.x + facility.w / 2, 0.035, offset.z + facility.z + facility.h / 2);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(facility.w - 0.08, 0.12, facility.h - 0.08),
    new THREE.MeshStandardMaterial({ color: colorForType(facility.type), roughness: 0.58, metalness: 0.04 })
  );
  base.position.y = 0.04;
  base.receiveShadow = true;
  group.add(base);

  const label = makeFloatingLabel(`${def.emoji} ${def.name}`, facility.w);
  label.position.set(0, 1.58, -facility.h * 0.34);
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

function addStructureMesh(structure) {
  const def = structureDefs[structure.type];
  const group = new THREE.Group();
  group.userData.structureId = structure.id;
  group.userData.structureType = structure.type;
  const offset = getOffset();
  group.position.set(offset.x + structure.x + 0.5, 0.035, offset.z + structure.z + 0.5);
  def.build(group, structure);
  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.userData.structureId = structure.id;
    }
  });
  groups.structures.add(group);
}

function rebuildStructures() {
  clearGroup(groups.structures);
  state.structures.forEach(addStructureMesh);
}

function rebuildFloorTiles() {
  clearGroup(groups.floors);
  const offset = getOffset();
  state.floorTiles.forEach((tile) => {
    const def = structureDefs[tile.type];
    const group = new THREE.Group();
    group.userData.structureId = tile.id;
    group.userData.structureType = tile.type;
    group.position.set(offset.x + tile.x + 0.5, 0.011, offset.z + tile.z + 0.5);
    def.build(group, tile);
    group.traverse((child) => {
      if (child.isMesh) child.userData.structureId = tile.id;
    });
    groups.floors.add(group);
  });
}

function sellFacility(id) {
  const index = state.facilities.findIndex((f) => f.id === id);
  if (index < 0) return;
  const f = state.facilities[index];
  const def = facilityDefs[f.type];
  const refund = Math.floor(def.cost * 0.55 * (f.condition / 100));
  state.cash += refund;
  state.facilities.splice(index, 1);
  const mesh = groups.facilities.children.find((g) => g.userData.facilityId === id);
  if (mesh) groups.facilities.remove(mesh);
  selectedFacilityId = null;
  state.visitors = state.visitors.filter((v) => v.targetFacilityId !== id);
  rebuildVisitors();
  createBuildMenu();
  updateUi();
  showToast(`${def.name} sold for ${money(refund)}.`);
}

function sellStructure(id) {
  let index = state.structures.findIndex((s) => s.id === id);
  if (index >= 0) {
    const s = state.structures[index];
    const def = structureDefs[s.type];
    const refund = Math.floor(def.cost * 0.45);
    state.cash += refund;
    state.structures.splice(index, 1);
    rebuildStructures();
    selectedStructureId = null;
    updateUi();
    showToast(`${def.name} removed for ${money(refund)}.`);
    return;
  }

  index = state.floorTiles.findIndex((s) => s.id === id);
  if (index >= 0) {
    const s = state.floorTiles[index];
    const def = structureDefs[s.type];
    const refund = Math.floor(def.cost * 0.35);
    state.cash += refund;
    state.floorTiles.splice(index, 1);
    rebuildFloorTiles();
    selectedStructureId = null;
    updateUi();
    showToast(`${def.name} removed for ${money(refund)}.`);
  }
}

function hireStaff(type) {
  const def = staffDefs[type];
  if (!def.unlock(state)) {
    showToast('Build the matching facility before hiring this staff member.');
    return;
  }
  if (state.cash < def.cost) {
    showToast(`Need ${money(def.cost - state.cash)} more for ${def.name}.`);
    return;
  }
  state.cash -= def.cost;
  const staff = { id: nextStaffId++, type, energy: 100 };
  state.staff.push(staff);
  addStaffMesh(staff);
  inspectStaff(type);
  updateUi();
  showToast(`${def.name} hired. Daily salary: ${money(def.salary)}.`);
}

function addStaffMesh(staff) {
  const def = staffDefs[staff.type];
  const group = makePersonMesh(`staff-${staff.id}`, def.colour, true);
  group.userData.staffId = staff.id;
  const offset = getOffset();
  const spot = getStaffSpot(staff.type, staff.id);
  group.position.set(offset.x + spot.x, 0.08, offset.z + spot.z);
  group.rotation.y = spot.rot;

  const label = makeFloatingLabel(`${def.emoji} ${def.name}`, 1.8);
  label.position.set(0, 1.12, 0);
  label.scale.set(1.8, 0.45, 1);
  group.add(label);

  groups.staff.add(group);
}

function rebuildStaff() {
  clearGroup(groups.staff);
  state.staff.forEach(addStaffMesh);
}

function getStaffSpot(type, id) {
  const candidates = {
    receptionist: state.facilities.find((f) => f.type === 'reception'),
    cleaner: null,
    instructor: state.facilities.find((f) => ['cardio', 'weights', 'studio'].includes(f.type)),
    lifeguard: state.facilities.find((f) => f.type === 'pool'),
    therapist: state.facilities.find((f) => ['spa', 'sauna'].includes(f.type))
  };
  const target = candidates[type];
  if (target) return { x: target.x + target.w / 2, z: target.z + target.h / 2, rot: 0 };
  return { x: 1.3 + (id % 5) * 0.65, z: 1.2 + (Math.floor(id / 5) % 4) * 0.65, rot: Math.random() * Math.PI * 2 };
}

function expandPlot() {
  const cost = 4200 + state.expansions * 3500;
  if (state.cash < cost) {
    showToast(`Plot expansion costs ${money(cost)}.`);
    return;
  }
  state.cash -= cost;
  state.expansions += 1;
  state.width += 4;
  state.height += 3;
  buildFloor();
  buildGrid();
  rebuildFloorTiles();
  rebuildStructures();
  rebuildFacilities();
  rebuildStaff();
  rebuildVisitors();
  createGhost();
  updateUi();
  showToast('Plot expanded. Time to add bigger leisure rooms.');
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
  const staff = getStaffCounts();
  if (open) {
    maybeSpawnVisitor(dt);
    const upkeep = getTotalUpkeep();
    const salaries = getTotalSalary();
    state.cash -= (upkeep + salaries) * dt / 32;

    const cleanerMultiplier = 1 / (1 + staff.cleaner * 0.65);
    state.cleanliness = clamp(state.cleanliness - (state.visitors.length * 0.006 + state.facilities.length * 0.003) * cleanerMultiplier * dt, 20, 100);

    const conditionMultiplier = 1 / (1 + staff.cleaner * 0.4);
    state.facilities.forEach((f) => {
      f.condition = clamp(f.condition - (0.002 + facilityDefs[f.type].upkeep * 0.0005) * conditionMultiplier * dt, 35, 100);
    });
  } else {
    state.cleanliness = clamp(state.cleanliness + (2.2 + staff.cleaner * 0.9) * dt, 20, 100);
  }

  const metrics = calculateMetrics();
  state.rating = lerp(state.rating, metrics.rating, 0.02);
  state.members = Math.max(0, Math.round(lerp(state.members, metrics.targetMembers, 0.018)));
  state.reputation = Math.max(0, Math.floor((state.rating - 45) / 6 + state.day * 0.08 + getLuxuryScore() / 16 + state.staff.length * 0.6));

  if (Math.random() < dt * 0.6) updateUi();
}

function isClubOpen() {
  const hour = state.minute / 60;
  return hour >= 6 && hour <= 22.5;
}

function maybeSpawnVisitor(dt) {
  if (countFacilities('reception') === 0) return;
  const staff = getStaffCounts();
  const demand = Math.min(2.8, 0.18 + state.members / 92 + state.rating / 180 + staff.receptionist * 0.08);
  if (state.visitors.length > Math.max(6, getCapacity() * 0.95)) return;
  if (Math.random() < dt * demand) spawnVisitor();
}

function spawnVisitor() {
  const choices = state.facilities.filter((f) => facilityDefs[f.type].capacity > 0 && f.users < facilityDefs[f.type].capacity);
  if (!choices.length) return;
  const weighted = choices.flatMap((f) => Array(Math.max(1, Math.round(getEffectiveAppeal(f) / 2))).fill(f));
  const target = weighted[Math.floor(Math.random() * weighted.length)];
  target.users += 1;

  const offset = getOffset();
  const entrance = new THREE.Vector3(offset.x + state.width * 0.5, 0.05, offset.z - 0.8);
  const targetPos = new THREE.Vector3(
    offset.x + target.x + target.w / 2 + (Math.random() - 0.5) * Math.max(0.4, target.w - 1),
    0.05,
    offset.z + target.z + target.h / 2 + (Math.random() - 0.5) * Math.max(0.4, target.h - 1)
  );
  const visitor = {
    id: nextVisitorId++,
    targetFacilityId: target.id,
    phase: 'walkIn',
    progress: 0,
    pos: entrance.clone(),
    from: entrance,
    to: targetPos,
    useTime: 4 + Math.random() * 9,
    spend: getEffectiveIncome(target) * (0.65 + Math.random() * 0.75),
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
        const facility = state.facilities.find((f) => f.id === v.targetFacilityId);
        if (facility) {
          facility.users = Math.max(0, facility.users - 1);
          facility.earned += v.spend;
        }
        const cleanMultiplier = clamp(state.cleanliness / 100, 0.35, 1.08);
        const serviceBonus = 0.65 + cleanMultiplier * 0.35 + getStaffServiceBonus(facility);
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
  state.visitors.forEach((v) => groups.visitors.add(makeVisitorMesh(v)));
}

function dailyReview() {
  const metrics = calculateMetrics();
  const staff = getStaffCounts();
  const bonus = Math.max(0, Math.round((state.rating - 65) * 18 + state.members * 2.5));
  if (bonus > 0) {
    state.cash += bonus;
    showToast(`Day ${state.day}: membership renewals brought in ${money(bonus)}.`);
  }
  state.lastIncome = 0;
  state.cleanliness = Math.min(100, state.cleanliness + 18 + staff.cleaner * 8);
  state.facilities.forEach((f) => {
    f.condition = Math.min(100, f.condition + 8 + staff.cleaner * 4);
  });
  if (metrics.rating < 45) showToast('Members are unhappy. Add variety, staff, decor, changing rooms or reduce crowding.');
}

function calculateMetrics() {
  const capacity = getCapacity();
  const variety = new Set(state.facilities.map((f) => f.type)).size;
  const luxury = getLuxuryScore();
  const staff = getStaffCounts();
  const corePenalty = countFacilities('reception') ? 0 : 35;
  const poolPenalty = countFacilities('pool') > 0 && staff.lifeguard === 0 ? 7 : 0;
  const spaPenalty = countFacilities('spa') > 0 && staff.therapist === 0 ? 4 : 0;
  const crowding = capacity ? clamp(state.members / capacity, 0, 1.8) : 1.8;
  const crowdPenalty = Math.max(0, (crowding - 0.78) * 34);
  const conditionAvg = state.facilities.length ? avg(state.facilities.map((f) => f.condition)) : 100;
  const conditionPenalty = Math.max(0, 100 - conditionAvg) * 0.24;
  const cleanPenalty = Math.max(0, 100 - state.cleanliness) * 0.32;
  const staffBonus = staff.receptionist * 2.5 + staff.cleaner * 2 + staff.instructor * 1.7 + staff.lifeguard * 1.5 + staff.therapist * 1.6;
  const rating = clamp(32 + variety * 5 + luxury * 0.86 + capacity * 0.48 + staffBonus - crowdPenalty - corePenalty - poolPenalty - spaPenalty - conditionPenalty - cleanPenalty, 5, 100);
  const targetMembers = Math.max(0, Math.round(capacity * clamp(0.35 + rating / 105 + state.reputation / 90 + staff.receptionist * 0.03, 0, 1.32)));
  return { rating, targetMembers };
}

function getCapacity() {
  return state.facilities.reduce((sum, f) => sum + facilityDefs[f.type].capacity, 0);
}

function getTotalUpkeep() {
  return state.facilities.reduce((sum, f) => sum + facilityDefs[f.type].upkeep, 0);
}

function getTotalSalary() {
  return state.staff.reduce((sum, s) => sum + staffDefs[s.type].salary, 0);
}

function getLuxuryScore() {
  const facilityAppeal = state.facilities.reduce((sum, f) => sum + facilityDefs[f.type].appeal + (f.type === 'plant' ? 1 : 0), 0);
  const structureAppeal = state.structures.reduce((sum, s) => sum + structureDefs[s.type].appeal, 0);
  const floorAppeal = state.floorTiles.reduce((sum, s) => sum + structureDefs[s.type].appeal, 0);
  return facilityAppeal + structureAppeal + floorAppeal;
}

function getEffectiveAppeal(facility) {
  const staff = getStaffCounts();
  let appeal = facilityDefs[facility.type].appeal;
  if (facility.type === 'pool') appeal += staff.lifeguard > 0 ? 5 : -5;
  if (['spa', 'sauna'].includes(facility.type)) appeal += staff.therapist * 2;
  if (['cardio', 'weights', 'studio'].includes(facility.type)) appeal += staff.instructor * 1.7;
  return Math.max(1, appeal);
}

function getEffectiveIncome(facility) {
  const def = facilityDefs[facility.type];
  const staff = getStaffCounts();
  let income = def.income;
  if (['cardio', 'weights', 'studio'].includes(facility.type)) income *= 1 + staff.instructor * 0.12;
  if (facility.type === 'pool') income *= staff.lifeguard > 0 ? 1.12 : 0.86;
  if (['spa', 'sauna'].includes(facility.type)) income *= 1 + staff.therapist * 0.16;
  if (facility.type === 'reception') income *= 1 + staff.receptionist * 0.07;
  return income;
}

function getStaffServiceBonus(facility) {
  if (!facility) return 0;
  const staff = getStaffCounts();
  let bonus = 0;
  if (facility.type === 'reception') bonus += staff.receptionist * 0.03;
  if (['cardio', 'weights', 'studio'].includes(facility.type)) bonus += staff.instructor * 0.035;
  if (facility.type === 'pool') bonus += staff.lifeguard * 0.035;
  if (['spa', 'sauna'].includes(facility.type)) bonus += staff.therapist * 0.045;
  return bonus;
}

function getStaffCounts() {
  return state.staff.reduce((counts, staff) => {
    counts[staff.type] = (counts[staff.type] || 0) + 1;
    return counts;
  }, { receptionist: 0, cleaner: 0, instructor: 0, lifeguard: 0, therapist: 0 });
}

function countFacilities(type) {
  return state.facilities.filter((f) => f.type === type).length;
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

  document.querySelectorAll('.facility-btn').forEach((btn) => {
    const kind = btn.dataset.kind;
    const type = btn.dataset.type;
    const def = kind === 'facility' ? facilityDefs[type] : kind === 'structure' ? structureDefs[type] : staffDefs[type];
    btn.classList.toggle('active', state.selectedKind === kind && state.selectedType === type && !state.deleteMode);
    btn.classList.toggle('locked', !def.unlock(state));
    if (kind === 'staff') {
      const count = state.staff.filter((s) => s.type === type).length;
      btn.classList.toggle('hired', count > 0);
      const small = btn.querySelector('small');
      if (small) small.innerHTML = `<span class="cost">${money(def.cost)} + ${money(def.salary)}/day</span>${count ? ` · hired ${count}` : ''}`;
    }
  });

  ui.deleteBtn?.classList.toggle('active-tool', state.deleteMode);
  ui.selectedHint.textContent = state.deleteMode
    ? 'Bulldoze mode'
    : state.selectedType
      ? `${getSelectedDef()?.name || 'Selected'} · R rotates · Esc cancels`
      : 'Inspect mode · camera safe';

  const expandCost = 4200 + state.expansions * 3500;
  ui.expandBtn.textContent = `Expand ${shortNumber(expandCost)}`;

  ui.objectives.innerHTML = '';
  objectives.forEach((o) => {
    const li = document.createElement('li');
    li.textContent = o.text;
    li.className = o.done() ? 'done' : '';
    ui.objectives.appendChild(li);
  });

  if (force) {
    if (state.selectedKind && state.selectedType) inspectDefinition(state.selectedKind, state.selectedType);
    else inspectOverview();
  }
}

function inspectOverview() {
  const staff = getStaffCounts();
  ui.inspectTitle.textContent = 'Club Overview';
  ui.inspectBody.textContent = `Facilities: ${state.facilities.length}. Rooms/building pieces: ${state.structures.length + state.floorTiles.length}. Staff: ${state.staff.length}. Salaries: ${money(getTotalSalary())}/day. Cleaners: ${staff.cleaner}. Deselect is active, so dragging the scene will not place items.`;
}

function inspectDefinition(kind, type) {
  const def = kind === 'facility' ? facilityDefs[type] : structureDefs[type];
  if (kind === 'facility') {
    ui.inspectTitle.textContent = `${def.emoji} ${def.name}`;
    ui.inspectBody.textContent = `${def.desc} Cost: ${money(def.cost)}. Capacity: ${def.capacity}. Appeal: ${def.appeal}. Upkeep: ${money(def.upkeep)}/day.`;
  } else {
    ui.inspectTitle.textContent = `${def.emoji} ${def.name}`;
    ui.inspectBody.textContent = `${def.desc} Cost: ${money(def.cost)}. ${def.floor ? 'Paints one tile.' : 'Places one rotatable room piece.'}`;
  }
}

function inspectStaff(type) {
  const def = staffDefs[type];
  const count = state.staff.filter((s) => s.type === type).length;
  ui.inspectTitle.textContent = `${def.emoji} ${def.name}`;
  ui.inspectBody.textContent = `${def.desc} Hired: ${count}. Hire cost: ${money(def.cost)}. Salary: ${money(def.salary)}/day. Total staff salary: ${money(getTotalSalary())}/day.`;
}

function inspectFacility(id) {
  const f = state.facilities.find((item) => item.id === id);
  if (!f) return;
  const def = facilityDefs[f.type];
  ui.inspectTitle.textContent = `${def.emoji} ${def.name}`;
  ui.inspectBody.textContent = `Condition ${Math.round(f.condition)}%. Serving ${f.users}/${def.capacity}. Lifetime earned ${money(f.earned)}. Effective income ${money(getEffectiveIncome(f))}/use. Sell value about ${money(def.cost * 0.55 * f.condition / 100)}.`;
}

function inspectStructure(id) {
  const s = state.structures.find((item) => item.id === id) || state.floorTiles.find((item) => item.id === id);
  if (!s) return;
  const def = structureDefs[s.type];
  ui.inspectTitle.textContent = `${def.emoji} ${def.name}`;
  ui.inspectBody.textContent = `${def.desc} Position: ${s.x}, ${s.z}. Sell value about ${money(def.cost * 0.45)}.`;
}

function showToast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.add('hidden'), 2800);
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
    structures: state.structures,
    floorTiles: state.floorTiles,
    staff: state.staff,
    nextFacilityId,
    nextStructureId,
    nextStaffId
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  showToast('Game saved locally in this browser.');
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    showToast('No save found for this upgraded version yet.');
    return;
  }
  try {
    const save = JSON.parse(raw);
    Object.assign(state, {
      cash: save.cash ?? 10500,
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
      structures: save.structures ?? [],
      floorTiles: save.floorTiles ?? [],
      staff: save.staff ?? [],
      visitors: [],
      selectedKind: null,
      selectedType: null,
      deleteMode: false
    });
    nextFacilityId = save.nextFacilityId ?? (1 + Math.max(0, ...state.facilities.map((f) => f.id)));
    nextStructureId = save.nextStructureId ?? (1 + Math.max(0, ...state.structures.map((s) => s.id), ...state.floorTiles.map((s) => s.id)));
    nextStaffId = save.nextStaffId ?? (1 + Math.max(0, ...state.staff.map((s) => s.id)));
    buildFloor();
    buildGrid();
    rebuildFloorTiles();
    rebuildStructures();
    rebuildFacilities();
    rebuildStaff();
    rebuildVisitors();
    createBuildMenu();
    createGhost();
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
    cash: 10500,
    members: 0,
    rating: 58,
    reputation: 0,
    day: 1,
    minute: 6 * 60,
    cleanliness: 100,
    width: START_W,
    height: START_H,
    expansions: 0,
    selectedKind: null,
    selectedType: null,
    rotation: 0,
    deleteMode: false,
    facilities: [],
    structures: [],
    floorTiles: [],
    staff: [],
    visitors: [],
    lastIncome: 0
  });
  nextFacilityId = 1;
  nextStructureId = 1;
  nextStaffId = 1;
  nextVisitorId = 1;
  buildFloor();
  buildGrid();
  rebuildFloorTiles();
  clearGroup(groups.structures);
  clearGroup(groups.facilities);
  clearGroup(groups.staff);
  clearGroup(groups.visitors);
  createBuildMenu();
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
  const count = Math.max(3, Math.floor(f.w));
  for (let i = 0; i < count; i++) {
    const x = -f.w * 0.38 + i * ((f.w * 0.76) / Math.max(1, count - 1));
    addTreadmill(group, x, -0.45);
  }
  for (let i = 0; i < 3; i++) addBike(group, -f.w * 0.25 + i * 0.8, 0.62);
  addBox(group, 0, 1.1, -f.h * 0.44, f.w - 0.4, 0.8, 0.04, materials.glass);
}

function buildWeights(group, f) {
  for (let i = 0; i < 3; i++) addBench(group, -f.w * 0.28 + i * 0.9, -0.42);
  addRack(group, -f.w * 0.36, 0.55);
  addRack(group, f.w * 0.18, 0.55);
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
  addBox(group, 0, 0.1, 0, f.w - 0.2, 0.16, f.h - 0.25, materials.stone);
  const water = new THREE.Mesh(new THREE.BoxGeometry(f.w - 0.72, 0.08, f.h - 0.82), materials.water);
  water.position.y = 0.2;
  water.userData.animate = 'water';
  group.add(water);
  addBox(group, 0, 0.25, -f.h * 0.5 + 0.22, f.w - 0.15, 0.24, 0.2, materials.wall);
  addBox(group, 0, 0.25, f.h * 0.5 - 0.22, f.w - 0.15, 0.24, 0.2, materials.wall);
  addBox(group, -f.w * 0.5 + 0.22, 0.25, 0, 0.2, 0.24, f.h - 0.25, materials.wall);
  addBox(group, f.w * 0.5 - 0.22, 0.25, 0, 0.2, 0.24, f.h - 0.25, materials.wall);
  for (let i = 1; i < 4; i++) {
    const x = -f.w / 2 + i * (f.w / 4);
    addBox(group, x, 0.285, 0, 0.035, 0.045, f.h - 0.95, materials.wall);
  }
  addBox(group, -f.w * 0.42, 0.45, f.h * 0.32, 0.28, 0.68, 0.46, materials.gold);
  addBox(group, -f.w * 0.42, 0.85, f.h * 0.08, 0.12, 0.7, 0.08, materials.wall);
}

function buildSauna(group, f) {
  addBox(group, 0, 0.45, 0, f.w - 0.35, 0.6, f.h - 0.35, materials.wood);
  addBox(group, 0, 0.78, -f.h * 0.4, f.w - 0.45, 0.5, 0.05, materials.glass);
  addBox(group, -f.w * 0.25, 0.72, f.h * 0.18, f.w * 0.3, 0.12, f.h * 0.55, materials.dark);
  addBox(group, f.w * 0.24, 0.42, f.h * 0.25, f.w * 0.35, 0.18, f.h * 0.42, materials.wood);
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
  addStool(group, -0.7, f.h * 0.3);
  addStool(group, 0.7, f.h * 0.3);
}

function buildSpa(group, f) {
  addSpaBed(group, -0.45, -0.35);
  addSpaBed(group, 0.55, 0.25);
  addBox(group, -f.w * 0.38, 0.65, f.h * 0.34, 0.16, 1.1, 0.16, materials.gold);
  addBox(group, f.w * 0.38, 0.18, -f.h * 0.34, 0.28, 0.18, 0.28, materials.dark);
  addPlant(group, -f.w * 0.28, 0, f.h * 0.34, 0.42);
  const lamp = new THREE.PointLight(0xffb6d8, 1.8, 4, 2);
  lamp.position.set(-0.4, 1.4, 0.1);
  group.add(lamp);
}

function buildLocker(group, f) {
  for (let i = 0; i < 5; i++) addBox(group, -f.w * 0.38 + i * 0.36, 0.55, -f.h * 0.32, 0.28, 0.9, 0.22, materials.blue);
  for (let i = 0; i < 3; i++) addBox(group, -0.5 + i * 0.5, 0.25, 0.35, 0.36, 0.32, 0.9, materials.wood);
  addBox(group, f.w * 0.38, 0.58, 0.15, 0.12, 1.0, 0.9, materials.glass);
  addBox(group, f.w * 0.2, 0.72, f.h * 0.38, 0.5, 0.55, 0.05, materials.glass);
}

function buildLounge(group, f) {
  addBox(group, 0, 0.12, 0, f.w - 0.3, 0.06, f.h - 0.3, materials.wood);
  addSofa(group, -0.9, -0.45, 0);
  addSofa(group, 0.85, 0.45, Math.PI);
  addBox(group, 0, 0.28, 0, 0.9, 0.18, 0.55, materials.gold);
  addPlant(group, -f.w * 0.38, 0, f.h * 0.32, 0.5);
  addPlant(group, f.w * 0.38, 0, -f.h * 0.32, 0.45);
  const lamp = new THREE.PointLight(0xffd486, 1.4, 5, 2);
  lamp.position.set(0, 1.4, 0);
  group.add(lamp);
}

function buildPlant(group) {
  addPlant(group, 0, 0, 0, 0.75);
}

function buildWallPanel(group, s) {
  const horizontal = s.rotation % 2 === 0;
  addBox(group, 0, 0.64, 0, horizontal ? 0.96 : 0.14, 1.25, horizontal ? 0.14 : 0.96, materials.wall);
  addBox(group, 0, 1.28, 0, horizontal ? 0.96 : 0.14, 0.08, horizontal ? 0.14 : 0.96, materials.dark);
}

function buildGlassWall(group, s) {
  const horizontal = s.rotation % 2 === 0;
  addBox(group, 0, 0.65, 0, horizontal ? 0.96 : 0.1, 1.18, horizontal ? 0.1 : 0.96, materials.glass);
  addBox(group, 0, 0.08, 0, horizontal ? 1.0 : 0.12, 0.12, horizontal ? 0.12 : 1.0, materials.dark);
  addBox(group, 0, 1.24, 0, horizontal ? 1.0 : 0.12, 0.08, horizontal ? 0.12 : 1.0, materials.dark);
}

function buildDoorway(group, s) {
  const horizontal = s.rotation % 2 === 0;
  const postW = horizontal ? 0.1 : 0.14;
  const postD = horizontal ? 0.14 : 0.1;
  addBox(group, horizontal ? -0.34 : 0, 0.62, horizontal ? 0 : -0.34, postW, 1.2, postD, materials.wood);
  addBox(group, horizontal ? 0.34 : 0, 0.62, horizontal ? 0 : 0.34, postW, 1.2, postD, materials.wood);
  addBox(group, 0, 1.22, 0, horizontal ? 0.78 : 0.14, 0.12, horizontal ? 0.14 : 0.78, materials.wood);
  const openGlass = addBox(group, 0, 0.55, 0, horizontal ? 0.38 : 0.05, 0.95, horizontal ? 0.05 : 0.38, materials.glass);
  openGlass.rotation.y = horizontal ? 0.35 : -0.35;
}

function buildWoodFloor(group) {
  const base = addBox(group, 0, 0.01, 0, 0.94, 0.035, 0.94, materials.wood);
  base.receiveShadow = true;
  for (let i = -1; i <= 1; i++) addBox(group, i * 0.28, 0.035, 0, 0.025, 0.01, 0.9, materials.dark);
}

function buildStoneFloor(group) {
  const base = addBox(group, 0, 0.01, 0, 0.94, 0.035, 0.94, materials.stone);
  base.receiveShadow = true;
  addBox(group, 0, 0.035, 0, 0.9, 0.01, 0.025, materials.wall);
  addBox(group, 0, 0.035, 0, 0.025, 0.01, 0.9, materials.wall);
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

function addStool(group, x, z) {
  addCylinder(group, x, 0.28, z, 0.18, 0.24, materials.wood, 18);
  addCylinder(group, x, 0.45, z, 0.22, 0.08, materials.pink, 18);
}

function addSofa(group, x, z, rot = 0) {
  const sofa = new THREE.Group();
  addBox(sofa, 0, 0.26, 0, 1.35, 0.28, 0.55, materials.purple);
  addBox(sofa, 0, 0.52, -0.22, 1.35, 0.45, 0.16, materials.purple);
  addBox(sofa, -0.62, 0.42, 0.02, 0.16, 0.32, 0.55, materials.purple);
  addBox(sofa, 0.62, 0.42, 0.02, 0.16, 0.32, 0.55, materials.purple);
  sofa.position.set(x, 0, z);
  sofa.rotation.y = rot;
  group.add(sofa);
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

function makePersonMesh(name, colour, staff = false) {
  const g = new THREE.Group();
  g.name = name;
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(staff ? 0.14 : 0.12, staff ? 0.42 : 0.38, 6, 12), new THREE.MeshStandardMaterial({ color: colour, roughness: 0.45 }));
  body.position.y = staff ? 0.48 : 0.42;
  const head = new THREE.Mesh(new THREE.SphereGeometry(staff ? 0.14 : 0.13, 14, 10), new THREE.MeshStandardMaterial({ color: 0xf2c49c, roughness: 0.55 }));
  head.position.y = staff ? 0.86 : 0.78;
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(staff ? 0.25 : 0.22, 16), materials.shadow);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  g.add(shadow, body, head);
  return g;
}

function makeVisitorMesh(v) {
  const color = new THREE.Color().setHSL(0.48 + Math.random() * 0.32, 0.55, 0.58);
  const g = makePersonMesh(`visitor-${v.id}`, color, false);
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
  const label = makeFloatingLabel(`+${money(amount)}`, 1.6);
  label.position.copy(pos);
  label.position.y = 1.5;
  label.userData.floatLife = 1.6;
  groups.effects.add(label);
}

function pulseAtTile(x, z, w, h, color) {
  const offset = getOffset();
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.5, Math.max(w, h) * 0.72, 48),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
  );
  ring.position.set(offset.x + x + w / 2, 0.045, offset.z + z + h / 2);
  ring.rotation.x = -Math.PI / 2;
  ring.userData.pulseLife = 1.2;
  groups.effects.add(ring);
}

function animateFacilityDetails(dt) {
  groups.facilities.traverse((obj) => {
    if (obj.userData.animate === 'water') {
      obj.position.y = 0.2 + Math.sin(performance.now() * 0.003) * 0.015;
    }
    if (obj.userData.animate === 'steam') {
      obj.position.y += dt * 0.12;
      obj.material.opacity = 0.25 + Math.sin(performance.now() * 0.004 + obj.position.x) * 0.12;
      if (obj.position.y > 1.55) obj.position.y = 1.05;
    }
  });

  groups.staff.children.forEach((staff, index) => {
    staff.position.y = 0.08 + Math.sin(performance.now() * 0.004 + index) * 0.018;
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

function colorForType(type) {
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
    lounge: 0x6f5845,
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
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose?.());
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
  return `${sign}£${Math.abs(rounded).toLocaleString('en-GB')}`;
}

function shortNumber(v) {
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
  return `${v}`;
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function avg(values) { return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0; }
function easeInOut(t) { return t >= 1 ? 1 : t < 0 ? 0 : t * t * (3 - 2 * t); }
