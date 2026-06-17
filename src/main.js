import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

const canvas = document.querySelector('#game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x071521);
scene.fog = new THREE.Fog(0x071521, 35, 95);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(18, 22, 24);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.47;
controls.minDistance = 9;
controls.maxDistance = 58;
controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,
  MIDDLE: THREE.MOUSE.DOLLY,
  RIGHT: THREE.MOUSE.PAN
};
controls.update();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(99, 99);
const clock = new THREE.Clock();
const SAVE_KEY = 'leisure-club-tycoon-save-v2';

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
  expandBtn: $('#expandBtn'),
  saveBtn: $('#saveBtn'),
  loadBtn: $('#loadBtn'),
  resetBtn: $('#resetBtn'),
  mobileRotate: $('#mobileRotate'),
  mobileCancel: $('#mobileCancel')
};

const colours = {
  floor: 0x173446,
  floor2: 0x1d4054,
  line: 0x7bd8ed,
  wall: 0xe5f0f2,
  dark: 0x0b1823,
  teal: 0x72e7d5,
  blue: 0x65a9ff,
  gold: 0xf9d56f,
  green: 0x90f49f,
  pink: 0xff95d6,
  purple: 0xb8a1ff,
  wood: 0xc98b5a,
  red: 0xff7187,
  water: 0x48caf5,
  orange: 0xffb45c
};

const mat = {
  floor: new THREE.MeshStandardMaterial({ color: colours.floor, roughness: 0.8 }),
  floor2: new THREE.MeshStandardMaterial({ color: colours.floor2, roughness: 0.82 }),
  wall: new THREE.MeshStandardMaterial({ color: colours.wall, roughness: 0.55 }),
  dark: new THREE.MeshStandardMaterial({ color: colours.dark, roughness: 0.55 }),
  teal: new THREE.MeshStandardMaterial({ color: colours.teal, roughness: 0.32, metalness: 0.06 }),
  blue: new THREE.MeshStandardMaterial({ color: colours.blue, roughness: 0.38, metalness: 0.04 }),
  gold: new THREE.MeshStandardMaterial({ color: colours.gold, roughness: 0.45, metalness: 0.08 }),
  green: new THREE.MeshStandardMaterial({ color: colours.green, roughness: 0.55 }),
  pink: new THREE.MeshStandardMaterial({ color: colours.pink, roughness: 0.48 }),
  purple: new THREE.MeshStandardMaterial({ color: colours.purple, roughness: 0.38 }),
  wood: new THREE.MeshStandardMaterial({ color: colours.wood, roughness: 0.72 }),
  red: new THREE.MeshStandardMaterial({ color: colours.red, roughness: 0.48 }),
  orange: new THREE.MeshStandardMaterial({ color: colours.orange, roughness: 0.5 }),
  water: new THREE.MeshPhysicalMaterial({
    color: colours.water,
    roughness: 0.05,
    transparent: true,
    opacity: 0.76,
    transmission: 0.12
  }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0xa8f4ff,
    roughness: 0.02,
    transparent: true,
    opacity: 0.34,
    transmission: 0.25
  }),
  ghostGood: new THREE.MeshStandardMaterial({ color: 0x8effde, transparent: true, opacity: 0.44 }),
  ghostBad: new THREE.MeshStandardMaterial({ color: 0xff6a82, transparent: true, opacity: 0.44 }),
  shadow: new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.16 })
};

const facilities = {
  reception: {
    name: 'Reception',
    emoji: '🛎️',
    cost: 850,
    size: [3, 2],
    income: 12,
    capacity: 5,
    appeal: 7,
    upkeep: 2,
    colour: 'teal',
    desc: 'Check-in desk. Your club needs this before members take it seriously.',
    unlock: () => true
  },
  cardio: {
    name: 'Cardio Suite',
    emoji: '🏃',
    cost: 1450,
    size: [4, 3],
    income: 28,
    capacity: 10,
    appeal: 8,
    upkeep: 7,
    colour: 'blue',
    desc: 'Treadmills, spin bikes and a mirrored cardio zone.',
    unlock: () => has('reception')
  },
  weights: {
    name: 'Free Weights',
    emoji: '🏋️',
    cost: 1750,
    size: [4, 3],
    income: 32,
    capacity: 8,
    appeal: 7,
    upkeep: 8,
    colour: 'orange',
    desc: 'Benches, racks and strength equipment for serious members.',
    unlock: () => has('reception')
  },
  studio: {
    name: 'Wellness Studio',
    emoji: '🧘',
    cost: 1250,
    size: [4, 3],
    income: 25,
    capacity: 12,
    appeal: 10,
    upkeep: 5,
    colour: 'purple',
    desc: 'Yoga, pilates and class space. Great for ratings.',
    unlock: () => state.reputation >= 2 || has('cardio')
  },
  locker: {
    name: 'Changing Room',
    emoji: '🚿',
    cost: 1200,
    size: [3, 3],
    income: 8,
    capacity: 14,
    appeal: 11,
    upkeep: 5,
    colour: 'gold',
    desc: 'Supports bigger membership and reduces complaints.',
    unlock: () => has('reception')
  },
  juice: {
    name: 'Juice Bar',
    emoji: '🥤',
    cost: 1350,
    size: [3, 2],
    income: 38,
    capacity: 6,
    appeal: 10,
    upkeep: 6,
    colour: 'pink',
    desc: 'Members spend extra after workouts. Adds a social club feel.',
    unlock: () => state.reputation >= 4 || count('cardio') + count('weights') >= 2
  },
  pool: {
    name: 'Pool Lane',
    emoji: '🏊',
    cost: 3200,
    size: [6, 3],
    income: 55,
    capacity: 12,
    appeal: 17,
    upkeep: 18,
    colour: 'water',
    desc: 'Premium leisure-club anchor. Expensive, but transforms the vibe.',
    unlock: () => state.reputation >= 7 || state.cash >= 5200
  },
  sauna: {
    name: 'Sauna & Steam',
    emoji: '♨️',
    cost: 2150,
    size: [3, 3],
    income: 42,
    capacity: 6,
    appeal: 13,
    upkeep: 11,
    colour: 'wood',
    desc: 'Heat rooms for the spa/wellness experience.',
    unlock: () => state.reputation >= 6 || has('pool')
  },
  spa: {
    name: 'Spa Room',
    emoji: '💆',
    cost: 2550,
    size: [3, 3],
    income: 52,
    capacity: 4,
    appeal: 15,
    upkeep: 10,
    colour: 'green',
    desc: 'Treatment tables, warm lighting and luxury rating boost.',
    unlock: () => state.reputation >= 9 || has('sauna')
  },
  plant: {
    name: 'Plant Decor',
    emoji: '🌿',
    cost: 180,
    size: [1, 1],
    income: 0,
    capacity: 0,
    appeal: 3,
    upkeep: 0,
    colour: 'green',
    desc: 'Cheap decor boost that fills dead space nicely.',
    unlock: () => true
  }
};

const objectives = [
  { text: 'Place a reception desk', done: () => has('reception') },
  { text: 'Reach 25 members', done: () => state.members >= 25 },
  { text: 'Build cardio and weights', done: () => has('cardio') && has('weights') },
  { text: 'Add pool, sauna or spa', done: () => has('pool') || has('sauna') || has('spa') },
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
  width: 16,
  height: 12,
  expansions: 0,
  selectedType: 'reception',
  rotation: 0,
  deleteMode: false,
  facilities: [],
  visitors: [],
  lastIncome: 0
};

const groups = {
  floor: new THREE.Group(),
  grid: new THREE.Group(),
  club: new THREE.Group(),
  people: new THREE.Group(),
  deco: new THREE.Group()
};

scene.add(groups.floor, groups.grid, groups.club, groups.people, groups.deco);

const placementPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(250, 250),
  new THREE.MeshBasicMaterial({ visible: false })
);
placementPlane.rotation.x = -Math.PI / 2;
scene.add(placementPlane);

let ghost = null;
let hoveredTile = null;
let hoveredFacility = null;
let selectedFacility = null;
let nextFacilityId = 1;
let nextVisitorId = 1;
let toastTimer = null;

initLights();
buildShell();
rebuildFloor();
rebuildGrid();
makeBuildMenu();
makeGhost();
wireEvents();
updateUi(true);
toast('Start with Reception, then build cardio, weights and wellness spaces.');
animate();

function $(selector) {
  return document.querySelector(selector);
}

function money(n) {
  return `£${Math.round(n).toLocaleString('en-GB')}`;
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function centreX() {
  return -state.width / 2;
}

function centreZ() {
  return -state.height / 2;
}

function has(type) {
  return state.facilities.some(f => f.type === type);
}

function count(type) {
  return state.facilities.filter(f => f.type === type).length;
}

function definition(type) {
  return facilities[type];
}

function rotatedSize(type, rot = state.rotation) {
  const [w, h] = definition(type).size;
  return rot % 2 === 0 ? [w, h] : [h, w];
}

function tileToWorld(x, z, w = 1, h = 1) {
  return new THREE.Vector3(centreX() + x + w / 2, 0, centreZ() + z + h / 2);
}

function worldToTile(point) {
  return {
    x: Math.floor(point.x - centreX()),
    z: Math.floor(point.z - centreZ())
  };
}

function initLights() {
  scene.add(new THREE.HemisphereLight(0x9edcff, 0x102331, 1.4));

  const sun = new THREE.DirectionalLight(0xffffff, 2.1);
  sun.position.set(15, 28, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -35;
  sun.shadow.camera.right = 35;
  sun.shadow.camera.top = 35;
  sun.shadow.camera.bottom = -35;
  scene.add(sun);

  const glow = new THREE.PointLight(0x75e5d2, 1.1, 32);
  glow.position.set(-9, 5, 8);
  scene.add(glow);
}

function buildShell() {
  const backWall = box(20, 4.2, 0.25, mat.wall, true);
  backWall.position.set(0, 2.1, -7.6);
  groups.deco.add(backWall);

  const leftWall = box(0.25, 4.2, 15, mat.wall, true);
  leftWall.position.set(-10.1, 2.1, 0);
  groups.deco.add(leftWall);

  for (let i = 0; i < 7; i++) {
    const windowMesh = box(1.5, 2.1, 0.08, mat.glass, true);
    windowMesh.position.set(-7.5 + i * 2.45, 2.3, -7.73);
    groups.deco.add(windowMesh);
  }

  const sign = box(5.2, 0.7, 0.16, mat.dark, true);
  sign.position.set(-6.7, 4.1, -7.87);
  groups.deco.add(sign);
}

function rebuildFloor() {
  groups.floor.clear();

  const slab = box(state.width, 0.18, state.height, mat.floor, true);
  slab.position.set(0, -0.09, 0);
  groups.floor.add(slab);

  for (let x = 0; x < state.width; x++) {
    for (let z = 0; z < state.height; z++) {
      if ((x + z) % 2 !== 0) continue;

      const tile = box(0.96, 0.012, 0.96, mat.floor2, false);
      const p = tileToWorld(x, z);
      tile.position.set(p.x, 0.004, p.z);
      groups.floor.add(tile);
    }
  }

  const rails = [
    [state.width + 0.25, 0.35, 0.18, 0, 0.17, centreZ() - 0.1],
    [state.width + 0.25, 0.35, 0.18, 0, 0.17, -centreZ() + 0.1],
    [0.18, 0.35, state.height + 0.25, centreX() - 0.1, 0.17, 0],
    [0.18, 0.35, state.height + 0.25, -centreX() + 0.1, 0.17, 0]
  ];

  rails.forEach(([w, h, d, x, y, z]) => {
    const rail = box(w, h, d, mat.dark, true);
    rail.position.set(x, y, z);
    groups.floor.add(rail);
  });
}

function rebuildGrid() {
  groups.grid.clear();

  const lineMat = new THREE.LineBasicMaterial({
    color: colours.line,
    transparent: true,
    opacity: 0.2
  });

  const points = [];

  for (let x = 0; x <= state.width; x++) {
    const wx = centreX() + x;
    points.push(new THREE.Vector3(wx, 0.03, centreZ()));
    points.push(new THREE.Vector3(wx, 0.03, -centreZ()));
  }

  for (let z = 0; z <= state.height; z++) {
    const wz = centreZ() + z;
    points.push(new THREE.Vector3(centreX(), 0.03, wz));
    points.push(new THREE.Vector3(-centreX(), 0.03, wz));
  }

  const geom = new THREE.BufferGeometry().setFromPoints(points);
  groups.grid.add(new THREE.LineSegments(geom, lineMat));
}

function makeBuildMenu() {
  ui.buildMenu.innerHTML = '';

  Object.entries(facilities).forEach(([type, def]) => {
    const btn = document.createElement('button');
    btn.className = 'facility-btn';
    btn.dataset.type = type;
    btn.innerHTML = `
      <span class="emoji">${def.emoji}</span>
      <strong>${def.name}</strong>
      <small><span class="cost">${money(def.cost)}</span> · ${def.size[0]}x${def.size[1]}</small>
    `;

    btn.addEventListener('click', () => {
      if (!def.unlock(state)) {
        toast(`Locked: grow your reputation to unlock ${def.name}.`);
        return;
      }

      state.selectedType = type;
      state.deleteMode = false;
      makeGhost();
      updateUi(true);
    });

    ui.buildMenu.appendChild(btn);
  });
}

function refreshBuildButtons() {
  [...ui.buildMenu.querySelectorAll('.facility-btn')].forEach(btn => {
    const type = btn.dataset.type;
    btn.classList.toggle('active', state.selectedType === type && !state.deleteMode);
    btn.classList.toggle('locked', !definition(type).unlock(state));
  });
}

function makeGhost() {
  if (ghost) scene.remove(ghost);

  const [w, h] = rotatedSize(state.selectedType);
  ghost = box(w, 0.16, h, mat.ghostGood, false);
  ghost.position.y = 0.12;
  ghost.visible = false;
  scene.add(ghost);
}

function wireEvents() {
  window.addEventListener('resize', onResize);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerdown', onPointerDown);

  window.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'r') rotateBlueprint();
    if (e.key.toLowerCase() === 'b') toggleBulldoze();

    if (e.key === 'Escape') {
      state.deleteMode = false;
      selectedFacility = null;
      updateUi(true);
    }
  });

  ui.rotateBtn.addEventListener('click', rotateBlueprint);
  ui.mobileRotate.addEventListener('click', rotateBlueprint);
  ui.deleteBtn.addEventListener('click', toggleBulldoze);

  ui.mobileCancel.addEventListener('click', () => {
    state.deleteMode = false;
    selectedFacility = null;
    updateUi(true);
  });

  ui.expandBtn.addEventListener('click', expandPlot);
  ui.saveBtn.addEventListener('click', saveGame);
  ui.loadBtn.addEventListener('click', loadGame);

  ui.resetBtn.addEventListener('click', () => {
    if (!confirm('Reset your leisure club?')) return;
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  });
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function setPointer(e) {
  pointer.x = (e.clientX / innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / innerHeight) * 2 + 1;
}

function onPointerMove(e) {
  setPointer(e);
  updateHover();
}

function onPointerDown(e) {
  if (e.button !== 0) return;

  setPointer(e);
  updateHover();

  if (state.deleteMode) {
    if (hoveredFacility) bulldoze(hoveredFacility);
    return;
  }

  if (hoveredTile && canPlace(state.selectedType, hoveredTile.x, hoveredTile.z, state.rotation).ok) {
    placeFacility(state.selectedType, hoveredTile.x, hoveredTile.z, state.rotation);
  } else if (hoveredFacility) {
    inspect(hoveredFacility);
  }
}

function updateHover() {
  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObject(placementPlane);
  hoveredTile = null;
  hoveredFacility = null;

  if (hits.length) {
    const t = worldToTile(hits[0].point);
    const [w, h] = rotatedSize(state.selectedType);

    hoveredTile = {
      x: clamp(t.x, 0, state.width - w),
      z: clamp(t.z, 0, state.height - h)
    };
  }

  const hitMeshes = raycaster.intersectObjects(groups.club.children, true);
  const hit = hitMeshes.find(h => h.object.userData.facilityId);

  if (hit) {
    hoveredFacility = state.facilities.find(f => f.id === hit.object.userData.facilityId) || null;
  }

  if (!ghost) return;

  if (!state.deleteMode && hoveredTile) {
    const [w, h] = rotatedSize(state.selectedType);
    const p = tileToWorld(hoveredTile.x, hoveredTile.z, w, h);
    ghost.position.set(p.x, 0.13, p.z);

    const ok = canPlace(state.selectedType, hoveredTile.x, hoveredTile.z, state.rotation).ok;
    ghost.material = ok ? mat.ghostGood : mat.ghostBad;
    ghost.visible = true;
  } else {
    ghost.visible = false;
  }
}

function rotateBlueprint() {
  state.rotation = (state.rotation + 1) % 4;
  makeGhost();
  updateHover();
  updateUi(true);
}

function toggleBulldoze() {
  state.deleteMode = !state.deleteMode;

  if (ghost) ghost.visible = false;

  updateUi(true);
  toast(state.deleteMode ? 'Bulldoze mode: click a facility to remove it.' : 'Build mode active.');
}

function expandPlot() {
  const cost = 3500 + state.expansions * 2500;

  if (state.cash < cost) {
    toast(`Expansion costs ${money(cost)}.`);
    return;
  }

  state.cash -= cost;
  state.width += 4;
  state.height += 3;
  state.expansions += 1;

  rebuildFloor();
  rebuildGrid();
  updateUi(true);
  toast('Plot expanded. More room for premium wellness zones.');
}

function canPlace(type, x, z, rot) {
  const [w, h] = rotatedSize(type, rot);

  if (x < 0 || z < 0 || x + w > state.width || z + h > state.height) {
    return { ok: false, reason: 'Out of bounds' };
  }

  for (const f of state.facilities) {
    if (rectsOverlap(x, z, w, h, f.x, f.z, f.w, f.h)) {
      return { ok: false, reason: 'Overlaps another facility' };
    }
  }

  if (state.cash < definition(type).cost) {
    return { ok: false, reason: 'Not enough cash' };
  }

  if (!definition(type).unlock(state)) {
    return { ok: false, reason: 'Locked' };
  }

  return { ok: true };
}

function rectsOverlap(ax, az, aw, ah, bx, bz, bw, bh) {
  return ax < bx + bw && ax + aw > bx && az < bz + bh && az + ah > bz;
}

function placeFacility(type, x, z, rot) {
  const check = canPlace(type, x, z, rot);

  if (!check.ok) {
    toast(check.reason);
    return;
  }

  const def = definition(type);
  const [w, h] = rotatedSize(type, rot);

  const facility = {
    id: nextFacilityId++,
    type,
    x,
    z,
    w,
    h,
    rot,
    visits: 0,
    condition: 100
  };

  state.cash -= def.cost;
  state.facilities.push(facility);

  const model = buildFacilityModel(facility);
  model.userData.facilityId = facility.id;
  facility.model = model;
  groups.club.add(model);

  inspect(facility);
  updateUi(true);
  toast(`${def.name} built.`);
}

function bulldoze(facility) {
  const def = definition(facility.type);

  state.cash += Math.round(def.cost * 0.35);
  groups.club.remove(facility.model);
  state.facilities = state.facilities.filter(f => f.id !== facility.id);
  selectedFacility = null;

  updateUi(true);
  toast(`${def.name} bulldozed. Partial refund received.`);
}

function inspect(facility) {
  selectedFacility = facility;

  const def = definition(facility.type);

  ui.inspectTitle.textContent = `${def.emoji} ${def.name}`;
  ui.inspectBody.textContent = `${def.desc} Visits today: ${facility.visits}. Condition: ${Math.round(facility.condition)}%. Income per use: ${money(def.income)}.`;
}

function buildFacilityModel(facility) {
  const def = definition(facility.type);
  const g = new THREE.Group();
  const p = tileToWorld(facility.x, facility.z, facility.w, facility.h);

  g.position.set(p.x, 0.04, p.z);
  g.rotation.y = facility.rot * Math.PI / 2;

  const base = box(facility.w - 0.1, 0.18, facility.h - 0.1, mat[def.colour] || mat.teal, true);
  base.position.y = 0.09;
  base.userData.facilityId = facility.id;
  g.add(base);

  const rug = box(facility.w - 0.35, 0.035, facility.h - 0.35, mat.dark, false);
  rug.position.y = 0.23;
  rug.userData.facilityId = facility.id;
  g.add(rug);

  addSign(g, def.name, 0, 1.05, -facility.h / 2 + 0.2, facility.id);

  if (facility.type === 'reception') makeReception(g);
  if (facility.type === 'cardio') makeCardio(g);
  if (facility.type === 'weights') makeWeights(g);
  if (facility.type === 'studio') makeStudio(g, facility);
  if (facility.type === 'locker') makeLocker(g);
  if (facility.type === 'juice') makeJuice(g);
  if (facility.type === 'pool') makePool(g, facility);
  if (facility.type === 'sauna') makeSauna(g);
  if (facility.type === 'spa') makeSpa(g);
  if (facility.type === 'plant') makePlant(g);

  g.traverse(o => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
      o.userData.facilityId = facility.id;
    }
  });

  return g;
}

function makeReception(g) {
  const desk = box(2.2, 0.65, 0.55, mat.wood, true);
  desk.position.set(0, 0.58, 0.05);
  g.add(desk);

  const screen = box(0.42, 0.32, 0.08, mat.glass, true);
  screen.position.set(0.55, 1.12, -0.15);
  g.add(screen);

  const lamp = cylinder(0.11, 0.11, 0.45, mat.gold);
  lamp.position.set(-0.72, 1.1, -0.08);
  g.add(lamp);
}

function makeCardio(g) {
  [-1.25, 0, 1.25].forEach(x => {
    const base = box(0.85, 0.12, 1.05, mat.dark, true);
    base.position.set(x, 0.38, 0.18);
    g.add(base);

    const belt = box(0.58, 0.04, 0.72, mat.blue, true);
    belt.position.set(x, 0.49, 0.18);
    g.add(belt);

    const rail = box(0.72, 0.08, 0.06, mat.wall, true);
    rail.position.set(x, 0.91, -0.36);
    g.add(rail);

    const pole = cylinder(0.035, 0.035, 0.5, mat.wall);
    pole.position.set(x - 0.33, 0.72, -0.36);
    g.add(pole);

    const pole2 = cylinder(0.035, 0.035, 0.5, mat.wall);
    pole2.position.set(x + 0.33, 0.72, -0.36);
    g.add(pole2);
  });
}

function makeWeights(g) {
  [-1.15, 1.15].forEach(x => {
    const bench = box(1.0, 0.16, 0.42, mat.red, true);
    bench.position.set(x, 0.48, 0.35);
    g.add(bench);

    const leg = cylinder(0.04, 0.04, 0.55, mat.dark);
    leg.position.set(x - 0.35, 0.28, 0.35);
    g.add(leg);

    const bar = cylinder(0.04, 0.04, 1.15, mat.wall);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(x, 0.95, -0.35);
    g.add(bar);

    [-0.65, 0.65].forEach(dx => {
      const plate = cylinder(0.18, 0.18, 0.08, mat.dark);
      plate.rotation.z = Math.PI / 2;
      plate.position.set(x + dx, 0.95, -0.35);
      g.add(plate);
    });
  });
}

function makeStudio(g, f) {
  for (let i = 0; i < 6; i++) {
    const x = -f.w / 2 + 0.8 + (i % 3) * 1.2;
    const z = -0.35 + Math.floor(i / 3) * 0.85;

    const yoga = box(0.82, 0.035, 0.45, i % 2 ? mat.purple : mat.teal, false);
    yoga.position.set(x, 0.33, z);
    g.add(yoga);
  }

  const mirror = box(f.w - 0.5, 1.0, 0.04, mat.glass, true);
  mirror.position.set(0, 1.05, -f.h / 2 + 0.15);
  g.add(mirror);
}

function makeLocker(g) {
  [-0.85, 0, 0.85].forEach(x => {
    const locker = box(0.55, 1.05, 0.42, mat.gold, true);
    locker.position.set(x, 0.82, -0.5);
    g.add(locker);
  });

  const shower = cylinder(0.23, 0.23, 0.12, mat.glass);
  shower.position.set(-0.85, 0.48, 0.65);
  g.add(shower);

  const shower2 = cylinder(0.23, 0.23, 0.12, mat.glass);
  shower2.position.set(0.85, 0.48, 0.65);
  g.add(shower2);
}

function makeJuice(g) {
  const counter = box(2.3, 0.55, 0.55, mat.pink, true);
  counter.position.set(0, 0.55, 0.0);
  g.add(counter);

  for (let i = 0; i < 4; i++) {
    const cup = cylinder(0.1, 0.08, 0.28, i % 2 ? mat.green : mat.gold);
    cup.position.set(-0.75 + i * 0.5, 0.98, -0.08);
    g.add(cup);
  }

  const stool1 = cylinder(0.18, 0.18, 0.32, mat.wood);
  stool1.position.set(-0.72, 0.4, 0.75);
  g.add(stool1);

  const stool2 = cylinder(0.18, 0.18, 0.32, mat.wood);
  stool2.position.set(0.72, 0.4, 0.75);
  g.add(stool2);
}

function makePool(g, f) {
  const pool = box(f.w - 0.55, 0.12, f.h - 0.7, mat.water, false);
  pool.position.set(0, 0.36, 0);
  g.add(pool);

  [-0.9, 0.9].forEach(z => {
    const lane = box(f.w - 0.75, 0.035, 0.035, mat.wall, false);
    lane.position.set(0, 0.45, z);
    g.add(lane);
  });

  const ladder = cylinder(0.04, 0.04, 0.7, mat.wall);
  ladder.rotation.z = Math.PI / 2;
  ladder.position.set(-f.w / 2 + 0.45, 0.65, 0);
  g.add(ladder);
}

function makeSauna(g) {
  const cabin = box(2.1, 1.15, 1.8, mat.wood, true);
  cabin.position.set(0, 0.82, 0);
  g.add(cabin);

  const door = box(0.55, 0.85, 0.05, mat.glass, true);
  door.position.set(0, 0.85, 0.94);
  g.add(door);

  const stones = cylinder(0.28, 0.32, 0.25, mat.dark);
  stones.position.set(-0.65, 0.45, 0.25);
  g.add(stones);
}

function makeSpa(g) {
  [-0.65, 0.65].forEach(x => {
    const bed = box(0.9, 0.22, 1.45, mat.wall, true);
    bed.position.set(x, 0.5, 0.2);
    g.add(bed);

    const pillow = box(0.42, 0.16, 0.25, mat.green, true);
    pillow.position.set(x, 0.72, -0.45);
    g.add(pillow);
  });

  const candle = cylinder(0.08, 0.08, 0.18, mat.gold);
  candle.position.set(0, 0.45, -0.8);
  g.add(candle);
}

function makePlant(g) {
  const pot = cylinder(0.22, 0.28, 0.35, mat.wood);
  pot.position.y = 0.42;
  g.add(pot);

  for (let i = 0; i < 6; i++) {
    const leaf = box(0.13, 0.42, 0.04, mat.green, true);
    leaf.position.set(Math.cos(i) * 0.18, 0.75 + (i % 2) * 0.1, Math.sin(i) * 0.18);
    leaf.rotation.set(0.55, i, 0.25);
    g.add(leaf);
  }
}

function addSign(g, text, x, y, z, facilityId) {
  const sign = box(1.65, 0.38, 0.06, mat.dark, true);
  sign.position.set(x, y, z);
  sign.userData.facilityId = facilityId;
  g.add(sign);

  const sprite = makeTextSprite(text);
  sprite.position.set(x, y + 0.02, z - 0.05);
  sprite.scale.set(1.35, 0.34, 1);
  g.add(sprite);
}

function makeTextSprite(text) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;

  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#f8fbff';
  ctx.font = '700 46px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, c.width / 2, c.height / 2);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;

  return new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
}

function box(w, h, d, material, cast = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  return mesh;
}

function cylinder(r1, r2, h, material) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 24), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function spawnVisitor() {
  if (!has('reception')) return;
  if (state.visitors.length >= Math.min(55, Math.max(6, Math.floor(state.members / 2)))) return;

  const usable = state.facilities.filter(f => definition(f.type).capacity > 0);
  if (!usable.length) return;

  const target = usable[Math.floor(Math.random() * usable.length)];
  const person = makePerson();
  const start = tileToWorld(0, Math.floor(state.height / 2));

  person.position.set(start.x, 0.05, start.z);
  groups.people.add(person);

  state.visitors.push({
    id: nextVisitorId++,
    mesh: person,
    targetId: target.id,
    speed: 1.5 + Math.random() * 0.8,
    spendTimer: 0,
    leaving: false
  });
}

function makePerson() {
  const g = new THREE.Group();

  const body = cylinder(
    0.16,
    0.18,
    0.48,
    [mat.teal, mat.blue, mat.gold, mat.pink, mat.purple][Math.floor(Math.random() * 5)]
  );
  body.position.y = 0.38;
  g.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 18, 18), mat.wall);
  head.position.y = 0.72;
  head.castShadow = true;
  g.add(head);

  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.28, 24), mat.shadow);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  g.add(shadow);

  return g;
}

function updateVisitors(dt) {
  for (const v of [...state.visitors]) {
    const target = state.facilities.find(f => f.id === v.targetId);

    if (!target) {
      removeVisitor(v);
      continue;
    }

    const dest = v.leaving
      ? tileToWorld(0, Math.floor(state.height / 2))
      : tileToWorld(target.x, target.z, target.w, target.h);

    const dir = new THREE.Vector3(dest.x - v.mesh.position.x, 0, dest.z - v.mesh.position.z);
    const dist = dir.length();

    if (dist > 0.08) {
      dir.normalize();
      v.mesh.position.addScaledVector(dir, v.speed * dt);
      v.mesh.rotation.y = Math.atan2(dir.x, dir.z);
      v.mesh.position.y = 0.05 + Math.sin(performance.now() * 0.008 + v.id) * 0.025;
    } else if (v.leaving) {
      removeVisitor(v);
    } else {
      v.spendTimer += dt;

      if (v.spendTimer > 2.6 + Math.random() * 2.2) {
        const def = definition(target.type);
        const earned = Math.round(def.income * (0.75 + state.rating / 100));

        state.cash += earned;
        state.lastIncome += earned;
        target.visits += 1;
        target.condition = clamp(target.condition - 0.4 - Math.random() * 0.35, 35, 100);

        v.leaving = Math.random() < 0.35;

        if (!v.leaving) {
          const choices = state.facilities.filter(f => definition(f.type).capacity > 0);
          v.targetId = choices[Math.floor(Math.random() * choices.length)].id;
          v.spendTimer = 0;
        }
      }
    }
  }
}

function removeVisitor(v) {
  groups.people.remove(v.mesh);
  state.visitors = state.visitors.filter(x => x !== v);
}

let simAccumulator = 0;

function updateSimulation(dt) {
  state.minute += dt * 6.5;

  if (state.minute >= 24 * 60) {
    state.minute -= 24 * 60;
    state.day += 1;
    state.lastIncome = 0;
    state.facilities.forEach(f => {
      f.visits = 0;
    });
  }

  simAccumulator += dt;

  if (simAccumulator >= 1) {
    simAccumulator = 0;

    const cap = state.facilities.reduce((sum, f) => sum + definition(f.type).capacity, 0);
    const appeal = state.facilities.reduce((sum, f) => sum + definition(f.type).appeal, 0);
    const upkeep = state.facilities.reduce((sum, f) => sum + definition(f.type).upkeep, 0);
    const variety = new Set(state.facilities.map(f => f.type)).size;
    const luxury = clamp(appeal * 1.8 + variety * 2, 0, 100);
    const conditionAverage = state.facilities.length
      ? state.facilities.reduce((s, f) => s + f.condition, 0) / state.facilities.length
      : 100;

    state.cleanliness = clamp(conditionAverage - state.visitors.length * 0.22, 20, 100);

    state.rating = Math.round(
      clamp(
        42 + luxury * 0.42 + state.cleanliness * 0.22 + variety * 1.4 - Math.max(0, state.members - cap) * 0.4,
        15,
        99
      )
    );

    const targetMembers = has('reception')
      ? Math.floor(8 + cap * 2.15 + state.rating * 0.58 + state.reputation * 2.6)
      : 0;

    state.members += Math.sign(targetMembers - state.members) * Math.min(2, Math.abs(targetMembers - state.members));

    state.reputation = Math.floor((state.rating - 45) / 7 + state.facilities.length * 0.75 + state.expansions * 2);
    state.reputation = Math.max(0, state.reputation);

    state.facilities.forEach(f => {
      f.condition = clamp(f.condition - definition(f.type).upkeep * 0.002, 30, 100);
    });

    state.cash -= upkeep * 0.18;

    if (Math.random() < clamp(state.members / 110, 0.08, 0.75)) {
      spawnVisitor();
    }

    updateUi(false);
  }
}

function updateUi(full = false) {
  ui.cash.textContent = money(state.cash);
  ui.members.textContent = String(Math.round(state.members));
  ui.rating.textContent = `${Math.round(state.rating)}%`;
  ui.rep.textContent = String(Math.max(0, state.reputation));
  ui.day.textContent = String(state.day);
  ui.clock.textContent = `${String(Math.floor(state.minute / 60)).padStart(2, '0')}:${String(Math.floor(state.minute % 60)).padStart(2, '0')}`;

  ui.cleanText.textContent = `${Math.round(state.cleanliness)}%`;
  ui.cleanBar.style.width = `${state.cleanliness}%`;

  const luxury = clamp(state.facilities.reduce((s, f) => s + definition(f.type).appeal, 0) * 1.8, 0, 100);
  ui.luxuryText.textContent = `${Math.round(luxury)}%`;
  ui.luxuryBar.style.width = `${luxury}%`;

  ui.selectedHint.textContent = state.deleteMode
    ? 'Bulldoze mode'
    : `${definition(state.selectedType).name} · R rotates`;

  ui.deleteBtn.classList.toggle('active-tool', state.deleteMode);

  const expandCost = 3500 + state.expansions * 2500;
  ui.expandBtn.textContent = `Expand Plot ${money(expandCost)}`;

  refreshBuildButtons();
  renderObjectives();

  if (!selectedFacility) {
    ui.inspectTitle.textContent = 'Club Overview';
    ui.inspectBody.textContent = has('reception')
      ? `Your leisure club has ${state.facilities.length} facilities. Members spend money when they reach equipment. Better variety, cleanliness and luxury raise ratings.`
      : 'Place a Reception first, then build cardio, weights, changing rooms, wellness spaces, pool, sauna and spa.';
  } else if (full) {
    inspect(selectedFacility);
  }
}

function renderObjectives() {
  ui.objectives.innerHTML = objectives
    .map(o => `<li class="${o.done() ? 'done' : ''}">${o.done() ? '✓' : '○'} ${o.text}</li>`)
    .join('');
}

function toast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.remove('hidden');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.add('hidden'), 2600);
}

function saveGame() {
  const data = {
    ...state,
    facilities: state.facilities.map(({ model, ...f }) => f),
    visitors: [],
    selectedType: state.selectedType,
    rotation: state.rotation
  };

  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  toast('Game saved in this browser.');
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);

  if (!raw) {
    toast('No save found yet.');
    return;
  }

  const data = JSON.parse(raw);

  groups.club.clear();
  groups.people.clear();

  Object.assign(state, data, {
    visitors: [],
    deleteMode: false
  });

  nextFacilityId = Math.max(1, ...state.facilities.map(f => f.id + 1));

  state.facilities.forEach(f => {
    f.model = buildFacilityModel(f);
    groups.club.add(f.model);
  });

  rebuildFloor();
  rebuildGrid();
  makeGhost();

  selectedFacility = null;
  updateUi(true);
  toast('Save loaded.');
}

function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);

  controls.update();
  updateVisitors(dt);
  updateSimulation(dt);
  animateWaterAndSigns();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function animateWaterAndSigns() {
  const t = performance.now() * 0.001;

  groups.club.traverse(o => {
    if (o.material === mat.water) {
      o.position.y += Math.sin(t * 2) * 0.0008;
    }
  });
}
