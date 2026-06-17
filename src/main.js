import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

const canvas = document.querySelector('#game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87b9d9);
scene.fog = new THREE.Fog(0x87b9d9, 65, 155);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 260);
camera.position.set(24, 30, 34);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.48;
controls.minDistance = 12;
controls.maxDistance = 88;
controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
controls.update();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(99, 99);
const clock = new THREE.Clock();
const SAVE_KEY = 'leisure-club-tycoon-builder-v3';

const ui = {
  cash: $('#cash'), members: $('#members'), rating: $('#rating'), rep: $('#rep'), day: $('#day'), clock: $('#clock'),
  selectedHint: $('#selectedHint'), categoryTabs: $('#categoryTabs'), buildMenu: $('#buildMenu'), staffMenu: $('#staffMenu'),
  inspectTitle: $('#inspectTitle'), inspectBody: $('#inspectBody'), cleanText: $('#cleanText'), cleanBar: $('#cleanBar'),
  luxuryText: $('#luxuryText'), luxuryBar: $('#luxuryBar'), routeText: $('#routeText'), routeBar: $('#routeBar'), objectives: $('#objectives'),
  toast: $('#toast'), rotateBtn: $('#rotateBtn'), deselectBtn: $('#deselectBtn'), bulldozeBtn: $('#bulldozeBtn'), expandBtn: $('#expandBtn'),
  saveBtn: $('#saveBtn'), loadBtn: $('#loadBtn'), resetBtn: $('#resetBtn'), mobileRotate: $('#mobileRotate'), mobileDeselect: $('#mobileDeselect')
};

const C = {
  grass: 0x80c876, grass2: 0x6db467, road: 0x303947, path: 0xcfc2aa, kerb: 0xe7e3d5,
  plot: 0x8bbd77, grid: 0xe8fbff, locked: 0x294057, concrete: 0xa7abb0, dark: 0x0e1a24,
  wall: 0xe9eef0, exterior: 0xd9d0c3, brick: 0xb06b4f, glass: 0xa8f4ff, wood: 0xbe8759,
  teal: 0x62dbc8, blue: 0x65a9ff, gold: 0xf8d46e, green: 0x88e69a, pink: 0xff94d0,
  purple: 0xb8a1ff, red: 0xff7187, orange: 0xffae63, water: 0x34c8ef, stone: 0xb9b2a8
};

const mat = {
  grass: new THREE.MeshStandardMaterial({ color: C.grass, roughness: 0.96 }),
  grass2: new THREE.MeshStandardMaterial({ color: C.grass2, roughness: 0.96 }),
  road: new THREE.MeshStandardMaterial({ color: C.road, roughness: 0.85 }),
  path: new THREE.MeshStandardMaterial({ color: C.path, roughness: 0.78 }),
  kerb: new THREE.MeshStandardMaterial({ color: C.kerb, roughness: 0.7 }),
  plot: new THREE.MeshStandardMaterial({ color: C.plot, roughness: 0.95 }),
  plotLocked: new THREE.MeshStandardMaterial({ color: C.locked, roughness: 0.85, transparent: true, opacity: 0.32 }),
  grid: new THREE.LineBasicMaterial({ color: C.grid, transparent: true, opacity: 0.24 }),
  wall: new THREE.MeshStandardMaterial({ color: C.wall, roughness: 0.56 }),
  exterior: new THREE.MeshStandardMaterial({ color: C.exterior, roughness: 0.72 }),
  brick: new THREE.MeshStandardMaterial({ color: C.brick, roughness: 0.8 }),
  dark: new THREE.MeshStandardMaterial({ color: C.dark, roughness: 0.55 }),
  glass: new THREE.MeshPhysicalMaterial({ color: C.glass, roughness: 0.03, transparent: true, opacity: 0.42, transmission: 0.25 }),
  doorGlass: new THREE.MeshPhysicalMaterial({ color: C.glass, roughness: 0.08, transparent: true, opacity: 0.62, transmission: 0.18 }),
  wood: new THREE.MeshStandardMaterial({ color: C.wood, roughness: 0.72 }),
  metal: new THREE.MeshStandardMaterial({ color: 0xc9d2da, roughness: 0.32, metalness: 0.24 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x202833, roughness: 0.72 }),
  teal: new THREE.MeshStandardMaterial({ color: C.teal, roughness: 0.38, metalness: 0.05 }),
  blue: new THREE.MeshStandardMaterial({ color: C.blue, roughness: 0.42 }),
  gold: new THREE.MeshStandardMaterial({ color: C.gold, roughness: 0.5 }),
  green: new THREE.MeshStandardMaterial({ color: C.green, roughness: 0.55 }),
  pink: new THREE.MeshStandardMaterial({ color: C.pink, roughness: 0.48 }),
  purple: new THREE.MeshStandardMaterial({ color: C.purple, roughness: 0.4 }),
  red: new THREE.MeshStandardMaterial({ color: C.red, roughness: 0.5 }),
  orange: new THREE.MeshStandardMaterial({ color: C.orange, roughness: 0.52 }),
  water: new THREE.MeshPhysicalMaterial({ color: C.water, roughness: 0.04, transparent: true, opacity: 0.76, transmission: 0.14 }),
  shadow: new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.16 }),
  ghostGood: new THREE.MeshStandardMaterial({ color: 0x7dffe2, transparent: true, opacity: 0.44 }),
  ghostBad: new THREE.MeshStandardMaterial({ color: 0xff667a, transparent: true, opacity: 0.45 }),
  ghostEdge: new THREE.MeshStandardMaterial({ color: 0xf8d46e, transparent: true, opacity: 0.58 })
};

const floorTypes = [
  ['concrete','Polished Concrete','⬜',90,0xb8bdc0,'Neutral club shell'],
  ['rubberBlack','Black Rubber Gym','⬛',130,0x242a31,'Heavy weights and functional zones'],
  ['rubberBlue','Blue Rubber Gym','🟦',135,0x315b8e,'Cardio or PT training'],
  ['rubberGreen','Green Turf Strip','🟩',145,0x3f9151,'Sled track / functional training'],
  ['oak','Warm Oak','🪵',150,0xc28b5c,'Reception, cafe and studio'],
  ['walnut','Dark Walnut','🟫',170,0x7a4c31,'Premium lounge areas'],
  ['stone','Spa Stone','◻️',170,0xbcb6ad,'Spa and wet changing areas'],
  ['marble','White Marble','🤍',220,0xe9e4da,'Luxury reception/spa'],
  ['slate','Dark Slate','◼️',165,0x4e5458,'Pool and spa contrast'],
  ['poolTile','Blue Pool Tile','🌊',150,0x5cbde5,'Poolside floor'],
  ['sandTile','Sand Tile','🟨',130,0xd8c398,'Cafe, poolside, outdoor feel'],
  ['yogaMat','Soft Studio Floor','🧘',155,0xa98edb,'Yoga/pilates studio'],
  ['spinFloor','Spin Studio Floor','🚴',150,0x2d3444,'Dark spin room finish'],
  ['courtWood','Sports Court Wood','🏸',175,0xd2a05e,'Indoor courts'],
  ['lockerTile','Changing Tile','🚿',135,0xcad6d8,'Changing rooms'],
  ['kidsFoam','Kids Foam Floor','🧸',120,0xf2a5c9,'Creche/play areas'],
  ['terrace','Outdoor Decking','🌤️',160,0xa87042,'Terrace areas'],
  ['grassMat','Indoor Grass Mat','🌿',120,0x5fa661,'Decor/relaxation zones'],
  ['cafeTerrazzo','Terrazzo Cafe','☕',180,0xded4c2,'Cafe and lounge'],
  ['premiumCarpet','Premium Carpet','🟪',145,0x6f578d,'Members lounge / offices']
].map(([id,name,emoji,cost,color,desc]) => ({ id,name,emoji,cost,color,desc, category:'floors' }));

const wallTypes = [
  { id:'solidWall', name:'Internal Wall', emoji:'🧱', cost:95, kind:'wall', blocks:true, material:'wall', desc:'Plain interior wall segment.' },
  { id:'exteriorWall', name:'Exterior Wall', emoji:'🏢', cost:135, kind:'wall', blocks:true, material:'exterior', desc:'Thicker exterior wall for the building shell.' },
  { id:'brickWall', name:'Feature Brick Wall', emoji:'🧱', cost:150, kind:'wall', blocks:true, material:'brick', desc:'Warm brick feature wall.' },
  { id:'glassWall', name:'Glass Wall', emoji:'🪟', cost:185, kind:'wall', blocks:true, material:'glass', desc:'Premium glazed wall segment.' },
  { id:'lowDivider', name:'Low Divider', emoji:'▁', cost:70, kind:'wall', blocks:false, material:'dark', height:0.75, desc:'Low divider that people can route around/through.' }
];

const openingTypes = [
  { id:'singleDoor', name:'Single Door', emoji:'🚪', cost:140, kind:'door', blocks:false, material:'wood', desc:'A passable interior door.' },
  { id:'doubleDoor', name:'Double Glass Door', emoji:'🚪', cost:220, kind:'door', blocks:false, material:'doorGlass', desc:'Premium double door, passable.' },
  { id:'slidingDoor', name:'Sliding Spa Door', emoji:'↔️', cost:260, kind:'door', blocks:false, material:'doorGlass', desc:'Passable glass sliding door.' },
  { id:'archedDoor', name:'Arched Doorway', emoji:'⌒', cost:190, kind:'door', blocks:false, material:'wood', desc:'Open arched pass-through.' },
  { id:'windowPanel', name:'Window Panel', emoji:'🪟', cost:160, kind:'window', blocks:true, material:'glass', desc:'Window set into a wall edge; blocks movement.' },
  { id:'wideWindow', name:'Wide Window', emoji:'▭', cost:220, kind:'window', blocks:true, material:'glass', desc:'Wide premium glass window.' },
  { id:'poolWindow', name:'Pool Viewing Window', emoji:'🌊', cost:260, kind:'window', blocks:true, material:'glass', desc:'Large blue-tinted viewing window.' }
];

const itemDefs = {
  receptionDesk:{cat:'clubhouse',name:'Reception Desk',emoji:'🛎️',cost:800,size:[2,1],income:9,appeal:8,capacity:4,blocks:true,desc:'Check-in desk. Staff work better near this.',build:makeReceptionDesk},
  turnstile:{cat:'clubhouse',name:'Access Gates',emoji:'🎫',cost:430,size:[2,1],income:4,appeal:5,capacity:8,blocks:true,desc:'Member access gates near entrance.',build:makeTurnstile},
  cafeCounter:{cat:'clubhouse',name:'Cafe Counter',emoji:'☕',cost:1050,size:[3,1],income:34,appeal:9,capacity:6,blocks:true,desc:'Cafe counter for post-workout spend.',build:makeCafeCounter},
  loungeSofa:{cat:'clubhouse',name:'Lounge Sofa',emoji:'🛋️',cost:420,size:[2,1],income:5,appeal:8,capacity:4,blocks:true,desc:'Members lounge seating.',build:makeSofa},
  lockerBank:{cat:'clubhouse',name:'Locker Bank',emoji:'🔐',cost:550,size:[2,1],income:3,appeal:7,capacity:8,blocks:true,desc:'Changing room storage.',build:makeLockerBank},
  changingBench:{cat:'clubhouse',name:'Changing Bench',emoji:'🪑',cost:250,size:[2,1],income:2,appeal:4,capacity:6,blocks:true,desc:'Bench for changing rooms.',build:makeBench},
  vending:{cat:'clubhouse',name:'Vending Machine',emoji:'🥤',cost:520,size:[1,1],income:18,appeal:4,capacity:3,blocks:true,desc:'Simple add-on income.',build:makeVending},

  dumbbellRack:{cat:'freeweights',name:'Dumbbell Rack',emoji:'🏋️',cost:620,size:[2,1],income:16,appeal:6,capacity:4,blocks:true,desc:'Rack of dumbbells for custom weights areas.',build:makeDumbbellRack},
  benchPress:{cat:'freeweights',name:'Bench Press',emoji:'🏋️',cost:760,size:[2,2],income:20,appeal:6,capacity:2,blocks:true,desc:'Classic bench station.',build:makeBenchPress},
  squatRack:{cat:'freeweights',name:'Squat Rack',emoji:'🏋️',cost:980,size:[2,2],income:24,appeal:7,capacity:2,blocks:true,desc:'Rack for serious strength training.',build:makeSquatRack},
  cableMachine:{cat:'freeweights',name:'Cable Machine',emoji:'🧲',cost:1250,size:[2,2],income:28,appeal:8,capacity:3,blocks:true,desc:'Dual cable station.',build:makeCableMachine},
  legPress:{cat:'freeweights',name:'Leg Press',emoji:'🦵',cost:1100,size:[2,2],income:25,appeal:7,capacity:2,blocks:true,desc:'Strength machine for leg training.',build:makeLegPress},
  weightBench:{cat:'freeweights',name:'Adjustable Bench',emoji:'🪑',cost:340,size:[1,2],income:9,appeal:4,capacity:1,blocks:true,desc:'Flexible bench for weights area.',build:makeWeightBench},
  plateTree:{cat:'freeweights',name:'Plate Tree',emoji:'⚫',cost:230,size:[1,1],income:3,appeal:3,capacity:1,blocks:true,desc:'Storage detail for plates.',build:makePlateTree},

  treadmill:{cat:'cardio',name:'Treadmill',emoji:'🏃',cost:620,size:[1,2],income:18,appeal:5,capacity:1,blocks:true,desc:'Individual treadmill.',build:makeTreadmill},
  spinBike:{cat:'cardio',name:'Spin Bike',emoji:'🚴',cost:430,size:[1,1],income:13,appeal:4,capacity:1,blocks:true,desc:'Spin bike for cardio/studio zones.',build:makeSpinBike},
  rower:{cat:'cardio',name:'Rowing Machine',emoji:'🚣',cost:520,size:[1,2],income:15,appeal:5,capacity:1,blocks:true,desc:'Rowing machine.',build:makeRower},
  crossTrainer:{cat:'cardio',name:'Cross Trainer',emoji:'🫀',cost:650,size:[1,2],income:17,appeal:5,capacity:1,blocks:true,desc:'Elliptical trainer.',build:makeCrossTrainer},
  stairClimber:{cat:'cardio',name:'Stair Climber',emoji:'🪜',cost:720,size:[1,1],income:19,appeal:5,capacity:1,blocks:true,desc:'Compact premium cardio item.',build:makeStairClimber},

  yogaMat:{cat:'studio',name:'Yoga Mat',emoji:'🧘',cost:90,size:[1,1],income:5,appeal:3,capacity:1,blocks:false,desc:'Build your own studio layout.',build:makeYogaMat},
  reformer:{cat:'studio',name:'Pilates Reformer',emoji:'🤸',cost:690,size:[1,2],income:21,appeal:8,capacity:1,blocks:true,desc:'Premium pilates reformer.',build:makeReformer},
  classMirror:{cat:'studio',name:'Studio Mirror',emoji:'🪞',cost:180,size:[1,1],income:0,appeal:5,capacity:0,blocks:true,wallFriendly:true,desc:'Mirror detail for wall edges.',build:makeMirror},
  speakerPod:{cat:'studio',name:'Speaker Pod',emoji:'🔊',cost:160,size:[1,1],income:0,appeal:3,capacity:0,blocks:true,desc:'Studio decor/atmosphere.',build:makeSpeaker},

  poolLane:{cat:'poolspa',name:'Pool Lane',emoji:'🏊',cost:2800,size:[6,2],income:42,appeal:16,capacity:5,blocks:true,desc:'Placeable pool basin; rotation now matches preview.',build:makePoolLane},
  jacuzzi:{cat:'poolspa',name:'Jacuzzi',emoji:'♨️',cost:1850,size:[2,2],income:35,appeal:14,capacity:4,blocks:true,desc:'Premium leisure spa pool.',build:makeJacuzzi},
  saunaCabin:{cat:'poolspa',name:'Sauna Cabin',emoji:'🔥',cost:1600,size:[2,2],income:30,appeal:12,capacity:4,blocks:true,desc:'Place against walls or in spa zones.',build:makeSaunaCabin},
  steamRoom:{cat:'poolspa',name:'Steam Room',emoji:'💨',cost:1700,size:[2,2],income:32,appeal:12,capacity:4,blocks:true,desc:'Premium wet spa item.',build:makeSteamRoom},
  showerPod:{cat:'poolspa',name:'Shower Pod',emoji:'🚿',cost:420,size:[1,1],income:3,appeal:5,capacity:1,blocks:true,desc:'Changing/poolside showers.',build:makeShowerPod},
  treatmentBed:{cat:'poolspa',name:'Treatment Bed',emoji:'💆',cost:800,size:[1,2],income:28,appeal:10,capacity:1,blocks:true,desc:'Spa treatment room item.',build:makeTreatmentBed},

  planter:{cat:'decor',name:'Planter',emoji:'🌿',cost:120,size:[1,1],income:0,appeal:4,capacity:0,blocks:true,desc:'Greenery for premium feel.',build:makePlanter},
  waterFeature:{cat:'decor',name:'Water Feature',emoji:'⛲',cost:850,size:[2,2],income:0,appeal:12,capacity:0,blocks:true,desc:'Luxury lobby/spa statement.',build:makeWaterFeature},
  wallArt:{cat:'decor',name:'Wall Art',emoji:'🖼️',cost:220,size:[1,1],income:0,appeal:5,capacity:0,blocks:true,wallFriendly:true,desc:'Decor that sits neatly by walls.',build:makeWallArt},
  towelStand:{cat:'decor',name:'Towel Stand',emoji:'🧺',cost:180,size:[1,1],income:1,appeal:4,capacity:0,blocks:true,desc:'Pool/spa detail.',build:makeTowelStand},
  plantWall:{cat:'decor',name:'Living Plant Wall',emoji:'🌱',cost:650,size:[2,1],income:0,appeal:10,capacity:0,blocks:true,wallFriendly:true,desc:'Premium feature wall.',build:makePlantWall}
};

const staffDefs = {
  receptionist:{name:'Receptionist',emoji:'🧑‍💼',cost:650,wage:8,desc:'Improves check-in, early rating and member growth.'},
  cleaner:{name:'Cleaner',emoji:'🧹',cost:520,wage:7,desc:'Slows cleanliness and condition decay.'},
  instructor:{name:'Instructor',emoji:'🏋️',cost:780,wage:10,desc:'Boosts gym and studio income.'},
  lifeguard:{name:'Lifeguard',emoji:'🛟',cost:720,wage:9,desc:'Boosts pool safety, access and rating.'},
  therapist:{name:'Therapist',emoji:'💆',cost:840,wage:11,desc:'Boosts spa income and luxury feel.'}
};

const categories = [
  { id:'floors', label:'Floors', emoji:'▦', items:floorTypes },
  { id:'walls', label:'Walls', emoji:'🧱', items:wallTypes },
  { id:'openings', label:'Doors & Windows', emoji:'🚪', items:openingTypes },
  { id:'freeweights', label:'Free Weights', emoji:'🏋️', itemsByCat:true },
  { id:'cardio', label:'Cardio', emoji:'🏃', itemsByCat:true },
  { id:'studio', label:'Studio', emoji:'🧘', itemsByCat:true },
  { id:'poolspa', label:'Pool & Spa', emoji:'🏊', itemsByCat:true },
  { id:'clubhouse', label:'Clubhouse', emoji:'☕', itemsByCat:true },
  { id:'decor', label:'Decor', emoji:'🌿', itemsByCat:true }
];

const objectives = [
  { text:'Lay at least 20 floor tiles', done:()=>state.floors.length >= 20 },
  { text:'Build an entrance with a door', done:()=>state.edges.some(e=>edgeDef(e.type)?.kind === 'door') },
  { text:'Place reception and 8 gym items', done:()=>hasItem('receptionDesk') && state.items.filter(i=>['freeweights','cardio'].includes(itemDefs[i.type].cat)).length >= 8 },
  { text:'Hire cleaner and receptionist', done:()=>state.staff.cleaner > 0 && state.staff.receptionist > 0 },
  { text:'Reach 70 members', done:()=>state.members >= 70 },
  { text:'Expand the plot once', done:()=>state.expansions >= 1 }
];

const state = {
  cash: 18000, members: 0, rating: 54, reputation: 0, day: 1, minute: 6*60,
  cleanliness: 100, routeScore: 100, luxury: 0,
  buildW: 24, buildH: 18, maxW: 48, maxH: 36, expansions: 0,
  mode: 'floor', category: 'floors', selectedId: 'concrete', rotation: 0, bulldoze: false,
  floors: [], edges: [], items: [], visitors: [], staff: { receptionist:0, cleaner:0, instructor:0, lifeguard:0, therapist:0 }
};

const groups = { env:new THREE.Group(), plot:new THREE.Group(), grid:new THREE.Group(), floors:new THREE.Group(), edges:new THREE.Group(), items:new THREE.Group(), people:new THREE.Group(), staff:new THREE.Group(), previews:new THREE.Group() };
scene.add(groups.env, groups.plot, groups.grid, groups.floors, groups.edges, groups.items, groups.people, groups.staff, groups.previews);

const placementPlane = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ visible:false }));
placementPlane.rotation.x = -Math.PI / 2;
scene.add(placementPlane);

let ghost = null;
let hovered = null;
let selectedThing = null;
let nextId = 1;
let nextVisitorId = 1;
let toastTimer = null;
let pointerDown = null;
let isDragging = false;
let pathCacheVersion = 0;
let lastRouteCheck = 0;
let simAcc = 0;

initLights();
buildEnvironment();
rebuildPlot();
makeTabs();
makeBuildMenu();
makeStaffMenu();
wireEvents();
rebuildAll();
updateUi(true);
toast('Blank canvas ready. Floors fill tiles; walls, doors and windows snap to grid edges. Q/Esc deselects.');
animate();

function $(s){ return document.querySelector(s); }
function money(n){ return `£${Math.round(n).toLocaleString('en-GB')}`; }
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function plotOriginX(){ return -state.maxW / 2; }
function plotOriginZ(){ return -state.maxH / 2; }
function buildOffsetX(){ return Math.floor((state.maxW - state.buildW) / 2); }
function buildOffsetZ(){ return Math.floor((state.maxH - state.buildH) / 2); }
function isUnlockedCell(x,z){ const ox=buildOffsetX(), oz=buildOffsetZ(); return x>=ox && z>=oz && x<ox+state.buildW && z<oz+state.buildH; }
function tileToWorld(x,z,w=1,h=1){ return new THREE.Vector3(plotOriginX()+x+w/2, 0, plotOriginZ()+z+h/2); }
function worldToTile(p){ return { x:Math.floor(p.x - plotOriginX()), z:Math.floor(p.z - plotOriginZ()) }; }
function edgeKey(x,z,dir){ return `${dir}:${x}:${z}`; }
function hasItem(type){ return state.items.some(i=>i.type===type); }
function itemDef(id){ return itemDefs[id]; }
function edgeDef(id){ return [...wallTypes, ...openingTypes].find(x=>x.id===id); }
function floorDef(id){ return floorTypes.find(x=>x.id===id); }
function selectedDef(){ if(state.mode==='floor') return floorDef(state.selectedId); if(state.mode==='edge') return edgeDef(state.selectedId); if(state.mode==='item') return itemDef(state.selectedId); return null; }
function rotatedSize(def, rot=state.rotation){ const [w,h]=def.size || [1,1]; return rot % 2 === 0 ? [w,h] : [h,w]; }

function initLights(){
  scene.add(new THREE.HemisphereLight(0xbce9ff, 0x53865a, 1.8));
  const sun = new THREE.DirectionalLight(0xffffff, 2.25);
  sun.position.set(28, 40, 24);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048,2048);
  sun.shadow.camera.left = -65; sun.shadow.camera.right = 65; sun.shadow.camera.top = 65; sun.shadow.camera.bottom = -65;
  scene.add(sun);
  const blue = new THREE.PointLight(0x70e4ff, 1.0, 42); blue.position.set(-18,7,-14); scene.add(blue);
}

function buildEnvironment(){
  groups.env.clear();
  const grass = box(150,0.12,130,mat.grass,false); grass.position.y=-0.08; groups.env.add(grass);
  addRoad(0,-36,150,10); addRoad(-36,0,10,130); addRoad(40,0,8,130);
  addPath(0, -24, 24, 3); addPath(-15, -18, 3, 18); addPath(18, -18, 3, 16);
  makeTownBuilding(-54,-30,8,7,5,0xd8c4aa); makeTownBuilding(-45,27,10,8,7,0xc4ced8); makeTownBuilding(49,30,12,9,8,0xd7bfa2); makeTownBuilding(55,-15,10,7,6,0xbecbd0); makeTownBuilding(5,45,18,7,6,0xcfc4b2); makeTownBuilding(-20,43,14,8,7,0xbcd2c7);
  for(let i=0;i<46;i++) makeTree(-65 + Math.random()*130, -58 + Math.random()*116, 0.8+Math.random()*0.7);
  for(let i=0;i<12;i++) makeStreetLight(-30+i*5.5, -30.5);
  for(let i=0;i<8;i++) makeCar(-22+i*6, -38.5, i%3);
  makePlotSign(-18, -27.5);
}

function addRoad(x,z,w,d){ const road=box(w,0.05,d,mat.road,false); road.position.set(x,-0.01,z); groups.env.add(road); const l1=box(w,0.065,0.14,mat.kerb,false); l1.position.set(x,0.03,z-d/2+0.5); groups.env.add(l1); const l2=box(w,0.065,0.14,mat.kerb,false); l2.position.set(x,0.03,z+d/2-0.5); groups.env.add(l2); }
function addPath(x,z,w,d){ const p=box(w,0.055,d,mat.path,false); p.position.set(x,0.02,z); groups.env.add(p); }
function makeTownBuilding(x,z,w,d,h,color){ const m=new THREE.MeshStandardMaterial({color, roughness:.68}); const b=box(w,h,d,m,true); b.position.set(x,h/2,z); groups.env.add(b); const roof=box(w+.8,.6,d+.8,mat.dark,true); roof.position.set(x,h+.3,z); groups.env.add(roof); for(let ix=-1; ix<=1; ix++){ const win=box(.8,1,.08,mat.glass,true); win.position.set(x+ix*w/4, h*.55, z-d/2-.05); groups.env.add(win); }}
function makeTree(x,z,s=1){ if(Math.abs(x)<30 && Math.abs(z)<24) return; const trunk=cylinder(.13*s,.18*s,1.2*s,mat.wood); trunk.position.set(x,.6*s,z); groups.env.add(trunk); const crown=new THREE.Mesh(new THREE.ConeGeometry(.9*s,2*s,8), mat.green); crown.position.set(x,1.85*s,z); crown.castShadow=true; crown.receiveShadow=true; groups.env.add(crown); }
function makeStreetLight(x,z){ const pole=cylinder(.04,.05,3,mat.metal); pole.position.set(x,1.5,z); groups.env.add(pole); const head=box(.8,.13,.25,mat.gold,true); head.position.set(x+.25,3.05,z); groups.env.add(head); }
function makeCar(x,z,i){ const cols=[mat.blue,mat.red,mat.orange]; const body=box(2.1,.55,1.05,cols[i],true); body.position.set(x,.32,z); groups.env.add(body); const top=box(1.15,.45,.85,mat.glass,true); top.position.set(x,.82,z); groups.env.add(top); }
function makePlotSign(x,z){ const p1=cylinder(.05,.05,1.2,mat.wood); p1.position.set(x-.9,.65,z); groups.env.add(p1); const p2=cylinder(.05,.05,1.2,mat.wood); p2.position.set(x+.9,.65,z); groups.env.add(p2); const sign=box(2.4,.8,.08,mat.dark,true); sign.position.set(x,1.15,z); groups.env.add(sign); const spr=makeTextSprite('Future Leisure Club'); spr.position.set(x,1.17,z-.08); spr.scale.set(2,.45,1); groups.env.add(spr); }

function rebuildPlot(){
  groups.plot.clear(); groups.grid.clear();
  const full = box(state.maxW,0.1,state.maxH,mat.grass2,false); full.position.set(0,0.005,0); groups.plot.add(full);
  const unlocked = box(state.buildW,0.035,state.buildH,mat.plot,false); unlocked.position.set(0,0.055,0); groups.plot.add(unlocked);
  const lockedW = (state.maxW - state.buildW)/2;
  const lockedH = (state.maxH - state.buildH)/2;
  if(lockedW>0){ const l=box(lockedW,0.04,state.maxH,mat.plotLocked,false); l.position.set(-state.buildW/2-lockedW/2,.075,0); groups.plot.add(l); const r=l.clone(); r.position.x=state.buildW/2+lockedW/2; groups.plot.add(r); }
  if(lockedH>0){ const t=box(state.buildW,0.04,lockedH,mat.plotLocked,false); t.position.set(0,.08,-state.buildH/2-lockedH/2); groups.plot.add(t); const b=t.clone(); b.position.z=state.buildH/2+lockedH/2; groups.plot.add(b); }
  rebuildGrid();
}

function rebuildGrid(){
  groups.grid.clear();
  const pts=[]; const ox=buildOffsetX(), oz=buildOffsetZ();
  for(let x=ox; x<=ox+state.buildW; x++){ pts.push(new THREE.Vector3(plotOriginX()+x,.09,plotOriginZ()+oz)); pts.push(new THREE.Vector3(plotOriginX()+x,.09,plotOriginZ()+oz+state.buildH)); }
  for(let z=oz; z<=oz+state.buildH; z++){ pts.push(new THREE.Vector3(plotOriginX()+ox,.09,plotOriginZ()+z)); pts.push(new THREE.Vector3(plotOriginX()+ox+state.buildW,.09,plotOriginZ()+z)); }
  const geo=new THREE.BufferGeometry().setFromPoints(pts);
  groups.grid.add(new THREE.LineSegments(geo, mat.grid));
}

function makeTabs(){
  ui.categoryTabs.innerHTML='';
  categories.forEach(cat=>{
    const btn=document.createElement('button'); btn.className='tab-btn'; btn.textContent=`${cat.emoji} ${cat.label}`; btn.dataset.cat=cat.id;
    btn.addEventListener('click',()=>{ state.category=cat.id; const first=getCategoryItems(cat.id)[0]; if(first){ state.mode=getModeForCat(cat.id); state.selectedId=first.id; state.bulldoze=false; } makeBuildMenu(); updateUi(true); });
    ui.categoryTabs.appendChild(btn);
  });
}
function getModeForCat(cat){ if(cat==='floors') return 'floor'; if(cat==='walls'||cat==='openings') return 'edge'; return 'item'; }
function getCategoryItems(catId){ const cat=categories.find(c=>c.id===catId); if(!cat) return []; if(cat.items) return cat.items; return Object.entries(itemDefs).filter(([,d])=>d.cat===catId).map(([id,d])=>({id,...d})); }
function makeBuildMenu(){
  ui.buildMenu.innerHTML='';
  [...ui.categoryTabs.children].forEach(b=>b.classList.toggle('active', b.dataset.cat===state.category));
  getCategoryItems(state.category).forEach(def=>{
    const id=def.id;
    const btn=document.createElement('button'); btn.className='build-card'; btn.dataset.id=id;
    btn.innerHTML=`<span class="emoji">${def.emoji}</span><strong>${def.name}</strong><small><span class="cost">${money(def.cost)}</span>${def.size?` · ${def.size[0]}x${def.size[1]}`:''}<br>${def.desc||''}</small>`;
    btn.addEventListener('click',()=>{
      if(state.selectedId===id && !state.bulldoze){ deselect(); return; }
      state.selectedId=id; state.mode=getModeForCat(state.category); state.bulldoze=false; selectedThing=null; refreshPreview(); updateUi(true);
    });
    ui.buildMenu.appendChild(btn);
  });
}
function refreshBuildButtons(){ [...ui.buildMenu.querySelectorAll('.build-card')].forEach(btn=>btn.classList.toggle('active', state.selectedId===btn.dataset.id && !state.bulldoze)); [...ui.categoryTabs.children].forEach(b=>b.classList.toggle('active', b.dataset.cat===state.category)); }
function makeStaffMenu(){
  ui.staffMenu.innerHTML='';
  Object.entries(staffDefs).forEach(([id,s])=>{
    const row=document.createElement('div'); row.className='staff-row';
    row.innerHTML=`<div><strong>${s.emoji} ${s.name} <span id="staff-${id}">0</span></strong><span>${money(s.cost)} hire · ${money(s.wage)}/tick · ${s.desc}</span></div>`;
    const btn=document.createElement('button'); btn.className='staff-btn'; btn.textContent='Hire'; btn.addEventListener('click',()=>hireStaff(id));
    row.appendChild(btn); ui.staffMenu.appendChild(row);
  });
}
function hireStaff(id){ const s=staffDefs[id]; if(state.cash<s.cost){ toast(`${s.name} costs ${money(s.cost)}.`); return; } state.cash-=s.cost; state.staff[id]++; rebuildStaff(); updateUi(true); toast(`${s.name} hired.`); }

function wireEvents(){
  window.addEventListener('resize',onResize);
  renderer.domElement.addEventListener('pointerdown',onPointerDown);
  renderer.domElement.addEventListener('pointermove',onPointerMove);
  renderer.domElement.addEventListener('pointerup',onPointerUp);
  renderer.domElement.addEventListener('pointerleave',()=>{ pointerDown=null; isDragging=false; });
  window.addEventListener('keydown',e=>{ if(e.key.toLowerCase()==='r') rotate(); if(e.key.toLowerCase()==='b') toggleBulldoze(); if(e.key==='Escape'||e.key.toLowerCase()==='q') deselect(); });
  ui.rotateBtn.addEventListener('click',rotate); ui.mobileRotate.addEventListener('click',rotate);
  ui.deselectBtn.addEventListener('click',deselect); ui.mobileDeselect.addEventListener('click',deselect);
  ui.bulldozeBtn.addEventListener('click',toggleBulldoze); ui.expandBtn.addEventListener('click',expandPlot);
  ui.saveBtn.addEventListener('click',saveGame); ui.loadBtn.addEventListener('click',loadGame);
  ui.resetBtn.addEventListener('click',()=>{ if(confirm('Reset your leisure club?')){ localStorage.removeItem(SAVE_KEY); location.reload(); }});
}
function onResize(){ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); }
function setPointer(e){ pointer.x=(e.clientX/innerWidth)*2-1; pointer.y=-(e.clientY/innerHeight)*2+1; }
function onPointerDown(e){ if(e.button!==0) return; setPointer(e); pointerDown={x:e.clientX,y:e.clientY,t:performance.now()}; isDragging=false; updateHover(); }
function onPointerMove(e){ setPointer(e); if(pointerDown && Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y)>6) isDragging=true; updateHover(); }
function onPointerUp(e){ if(e.button!==0) return; setPointer(e); updateHover(); const wasDrag=isDragging; pointerDown=null; isDragging=false; if(wasDrag) return; handleClick(); }
function rotate(){ state.rotation=(state.rotation+1)%4; refreshPreview(); updateHover(); updateUi(true); }
function deselect(){ state.selectedId=null; state.bulldoze=false; selectedThing=null; clearGhost(); updateUi(true); }
function toggleBulldoze(){ state.bulldoze=!state.bulldoze; if(state.bulldoze) clearGhost(); updateUi(true); toast(state.bulldoze?'Bulldoze mode: click floors, walls, doors, windows or items.':'Build mode active.'); }
function expandPlot(){ const cost=6500+state.expansions*4500; if(state.cash<cost){ toast(`Expansion costs ${money(cost)}.`); return; } if(state.buildW>=state.maxW && state.buildH>=state.maxH){ toast('Plot already fully expanded.'); return; } state.cash-=cost; state.expansions++; state.buildW=Math.min(state.maxW, state.buildW+8); state.buildH=Math.min(state.maxH, state.buildH+6); rebuildPlot(); updateUi(true); toast('Plot expanded. The surrounding land is now buildable.'); }

function updateHover(){
  raycaster.setFromCamera(pointer,camera);
  const hit=raycaster.intersectObject(placementPlane)[0];
  hovered=null;
  if(hit){ const p=hit.point; if(state.mode==='edge') hovered=snapEdge(p); else hovered=snapTile(p); }
  const objectHit = raycaster.intersectObjects([...groups.items.children, ...groups.edges.children, ...groups.floors.children], true).find(h=>h.object.userData.kind);
  if(objectHit) hovered = { ...(hovered||{}), hitKind:objectHit.object.userData.kind, hitId:objectHit.object.userData.id };
  refreshPreview();
}
function snapTile(p){ const t=worldToTile(p); const def=selectedDef(); const [w,h]=def?.size ? rotatedSize(def) : [1,1]; return { x:clamp(t.x,0,state.maxW-w), z:clamp(t.z,0,state.maxH-h), w,h, p }; }
function snapEdge(p){
  const fx=p.x - plotOriginX(); const fz=p.z - plotOriginZ();
  const x0=Math.floor(fx); const z0=Math.floor(fz); const dx=fx-x0; const dz=fz-z0;
  if(dx < dz && dx < 1-dz){ return { dir:'v', x:clamp(x0,0,state.maxW), z:clamp(z0,0,state.maxH-1) }; }
  if(1-dx < dz && 1-dx < 1-dz){ return { dir:'v', x:clamp(x0+1,0,state.maxW), z:clamp(z0,0,state.maxH-1) }; }
  if(dz < 1-dz){ return { dir:'h', x:clamp(x0,0,state.maxW-1), z:clamp(z0,0,state.maxH) }; }
  return { dir:'h', x:clamp(x0,0,state.maxW-1), z:clamp(z0+1,0,state.maxH) };
}
function clearGhost(){ if(ghost){ groups.previews.remove(ghost); ghost=null; } }
function refreshPreview(){
  clearGhost();
  if(!state.selectedId || state.bulldoze || !hovered) return;
  const def=selectedDef(); if(!def) return;
  let ok=false;
  if(state.mode==='floor'){ ok=canPlaceFloor(hovered.x,hovered.z); ghost=box(1,.08,1,ok?mat.ghostGood:mat.ghostBad,false); const p=tileToWorld(hovered.x,hovered.z); ghost.position.set(p.x,.18,p.z); }
  if(state.mode==='item'){ const [w,h]=rotatedSize(def); ok=canPlaceItem(state.selectedId, hovered.x, hovered.z, state.rotation).ok; ghost=box(w,.35,h,ok?mat.ghostGood:mat.ghostBad,false); const p=tileToWorld(hovered.x,hovered.z,w,h); ghost.position.set(p.x,.35,p.z); ghost.rotation.y=state.rotation*Math.PI/2; }
  if(state.mode==='edge'){ ok=canPlaceEdge(hovered.x,hovered.z,hovered.dir).ok; ghost=makeEdgePreview(hovered.x,hovered.z,hovered.dir, ok); }
  if(ghost) groups.previews.add(ghost);
}
function makeEdgePreview(x,z,dir,ok){ const g=new THREE.Group(); const mesh=box(dir==='h'?1:.16,.9,dir==='h'?.16:1,ok?mat.ghostEdge:mat.ghostBad,false); const pos=edgeWorld(x,z,dir); mesh.position.set(pos.x,.52,pos.z); g.add(mesh); return g; }
function edgeWorld(x,z,dir){ return dir==='h' ? new THREE.Vector3(plotOriginX()+x+.5,0,plotOriginZ()+z) : new THREE.Vector3(plotOriginX()+x,0,plotOriginZ()+z+.5); }

function handleClick(){
  if(state.bulldoze){ bulldozeAtHover(); return; }
  if(!state.selectedId){ if(hovered?.hitKind) inspectThing(hovered.hitKind,hovered.hitId); return; }
  if(state.mode==='floor' && hovered) placeFloor(hovered.x,hovered.z);
  if(state.mode==='edge' && hovered) placeEdge(state.selectedId, hovered.x, hovered.z, hovered.dir);
  if(state.mode==='item' && hovered) placeItem(state.selectedId, hovered.x, hovered.z, state.rotation);
}
function canPlaceFloor(x,z){ return isUnlockedCell(x,z); }
function canPlaceEdge(x,z,dir){
  const a = dir==='h' ? [x,z-1] : [x-1,z]; const b = dir==='h' ? [x,z] : [x,z];
  if(!(isUnlockedCell(a[0],a[1]) || isUnlockedCell(b[0],b[1]))) return {ok:false,reason:'Edge is outside unlocked plot'};
  if(state.edges.some(e=>e.x===x && e.z===z && e.dir===dir)) return {ok:false,reason:'Edge already has a wall/opening'};
  return {ok:true};
}
function canPlaceItem(type,x,z,rot){
  const def=itemDef(type);
  if(!def) return {ok:false,reason:'Select an equipment item first'};
  const [w,h]=rotatedSize(def,rot);
  for(let ix=x; ix<x+w; ix++) for(let iz=z; iz<z+h; iz++) if(!isUnlockedCell(ix,iz)) return {ok:false,reason:'Outside unlocked plot'};
  for(const it of state.items) if(rectOverlap(x,z,w,h,it.x,it.z,it.w,it.h)) return {ok:false,reason:'Overlaps another object'};
  if(state.cash < def.cost) return {ok:false,reason:'Not enough cash'};
  return {ok:true};
}
function rectOverlap(ax,az,aw,ah,bx,bz,bw,bh){ return ax<bx+bw && ax+aw>bx && az<bz+bh && az+ah>bz; }
function placeFloor(x,z){ if(!canPlaceFloor(x,z)){ toast('Floor is outside unlocked plot.'); return; } const def=floorDef(state.selectedId); if(state.cash<def.cost){ toast(`${def.name} costs ${money(def.cost)}.`); return; } const existing=state.floors.find(f=>f.x===x&&f.z===z); if(existing){ if(existing.type===def.id){ inspectThing('floor', existing.id); return; } existing.type=def.id; state.cash-=Math.round(def.cost*.45); } else { state.cash-=def.cost; state.floors.push({id:nextId++,type:def.id,x,z}); } rebuildFloors(); updateUi(true); }
function placeEdge(type,x,z,dir){ const check=canPlaceEdge(x,z,dir); if(!check.ok){ toast(check.reason); return; } const def=edgeDef(type); if(state.cash<def.cost){ toast(`${def.name} costs ${money(def.cost)}.`); return; } state.cash-=def.cost; state.edges.push({id:nextId++,type,x,z,dir}); rebuildEdges(); pathCacheVersion++; updateUi(true); }
function placeItem(type,x,z,rot){ const check=canPlaceItem(type,x,z,rot); if(!check.ok){ toast(check.reason); return; } const def=itemDef(type); if(!def){ toast('Select an equipment item first'); return; } const [w,h]=rotatedSize(def,rot); state.cash-=def.cost; const item={id:nextId++,type,x,z,w,h,rot,condition:100,visits:0}; state.items.push(item); rebuildItems(); pathCacheVersion++; inspectThing('item', item.id); updateUi(true); }
function bulldozeAtHover(){ if(!hovered) return; if(hovered.hitKind){ removeThing(hovered.hitKind, hovered.hitId); return; } if(state.mode==='edge' && hovered.dir){ const e=state.edges.find(e=>e.x===hovered.x&&e.z===hovered.z&&e.dir===hovered.dir); if(e) removeThing('edge',e.id); return; } if(hovered.x!==undefined){ const f=state.floors.find(f=>f.x===hovered.x&&f.z===hovered.z); if(f) removeThing('floor',f.id); }}
function removeThing(kind,id){
  if(kind==='item'){ const it=state.items.find(i=>i.id===id); if(!it) return; state.cash+=Math.round(itemDef(it.type).cost*.35); state.items=state.items.filter(i=>i.id!==id); rebuildItems(); pathCacheVersion++; toast('Object removed.'); }
  if(kind==='edge'){ const e=state.edges.find(e=>e.id===id); if(!e) return; state.cash+=Math.round(edgeDef(e.type).cost*.35); state.edges=state.edges.filter(x=>x.id!==id); rebuildEdges(); pathCacheVersion++; toast('Wall/opening removed.'); }
  if(kind==='floor'){ const f=state.floors.find(f=>f.id===id); if(!f) return; state.cash+=Math.round(floorDef(f.type).cost*.2); state.floors=state.floors.filter(x=>x.id!==id); rebuildFloors(); toast('Floor tile removed.'); }
  selectedThing=null; updateUi(true);
}
function inspectThing(kind,id){ selectedThing={kind,id}; let title='Selected', body='';
  if(kind==='item'){ const it=state.items.find(i=>i.id===id); if(!it) return; const def=itemDef(it.type); title=`${def.emoji} ${def.name}`; body=`${def.desc} Visits today: ${it.visits}. Condition: ${Math.round(it.condition)}%. Footprint: ${it.w}x${it.h}.`; }
  if(kind==='edge'){ const e=state.edges.find(e=>e.id===id); if(!e) return; const def=edgeDef(e.type); title=`${def.emoji} ${def.name}`; body=`${def.desc} It is placed on a grid edge, so equipment can sit cleanly next to it.`; }
  if(kind==='floor'){ const f=state.floors.find(f=>f.id===id); if(!f) return; const def=floorDef(f.type); title=`${def.emoji} ${def.name}`; body=`${def.desc} Floor tiles do not come built into equipment any more.`; }
  ui.inspectTitle.textContent=title; ui.inspectBody.textContent=body;
}

function rebuildAll(){ rebuildFloors(); rebuildEdges(); rebuildItems(); rebuildStaff(); }
function rebuildFloors(){ groups.floors.clear(); state.floors.forEach(f=>{ const def=floorDef(f.type); const m=new THREE.MeshStandardMaterial({color:def.color, roughness:.72}); const tile=box(.96,.06,.96,m,false); const p=tileToWorld(f.x,f.z); tile.position.set(p.x,.13,p.z); tile.userData={kind:'floor',id:f.id}; groups.floors.add(tile); addFloorPattern(tile,def,f); }); }
function addFloorPattern(tile,def,f){ if(['rubberGreen','poolTile','courtWood','kidsFoam','cafeTerrazzo'].includes(def.id)){ const line=box(.72,.012,.05,mat.dark,false); line.position.set(tile.position.x,.17,tile.position.z); line.userData={kind:'floor',id:f.id}; groups.floors.add(line); } }
function rebuildEdges(){ groups.edges.clear(); state.edges.forEach(e=>{ const model=makeEdgeModel(e); groups.edges.add(model); }); }
function makeEdgeModel(e){ const def=edgeDef(e.type); const g=new THREE.Group(); const pos=edgeWorld(e.x,e.z,e.dir); const h=def.height||2.45; const d=e.dir==='h'?[1,.18]:[.18,1]; const material=mat[def.material]||mat.wall;
  if(def.kind==='door'){
    const post1=box(e.dir==='h'?.12:.18,h,e.dir==='h'?.18:.12,mat.exterior,true); const post2=post1.clone();
    if(e.dir==='h'){ post1.position.set(pos.x-.45,h/2,pos.z); post2.position.set(pos.x+.45,h/2,pos.z); } else { post1.position.set(pos.x,h/2,pos.z-.45); post2.position.set(pos.x,h/2,pos.z+.45); }
    const lintel=box(e.dir==='h'?1:.18,.18,e.dir==='h'?.18:1,mat.exterior,true); lintel.position.set(pos.x,h-.1,pos.z); g.add(post1,post2,lintel);
    if(e.type!=='archedDoor'){ const leaf=box(e.dir==='h'?.55:.08,1.55,e.dir==='h'?.08:.55,material,true); leaf.position.set(pos.x,.82,pos.z); g.add(leaf); }
  } else if(def.kind==='window'){
    const low=box(e.dir==='h'?1:.18,.55,e.dir==='h'?.18:1,mat.wall,true); low.position.set(pos.x,.28,pos.z); const glass=box(e.dir==='h'?.9:.08,1.35,e.dir==='h'?.08:.9,material,true); glass.position.set(pos.x,1.25,pos.z); const top=box(e.dir==='h'?1:.18,.35,e.dir==='h'?.18:1,mat.wall,true); top.position.set(pos.x,2.08,pos.z); g.add(low,glass,top);
  } else {
    const wall=box(d[0],h,d[1],material,true); wall.position.set(pos.x,h/2,pos.z); g.add(wall);
  }
  g.traverse(o=>{ if(o.isMesh){ o.userData={kind:'edge',id:e.id}; o.castShadow=true; o.receiveShadow=true; }}); return g; }
function rebuildItems(){ groups.items.clear(); state.items.forEach(it=>{ const def=itemDef(it.type); const g=def.build(it); const [w,h]=[it.w,it.h]; const p=tileToWorld(it.x,it.z,w,h); g.position.set(p.x,.16,p.z); g.rotation.y=it.rot*Math.PI/2; g.userData={kind:'item',id:it.id}; g.traverse(o=>{ if(o.isMesh||o.isSprite){ o.userData={kind:'item',id:it.id}; if(o.isMesh){o.castShadow=true; o.receiveShadow=true;} }}); groups.items.add(g); }); }
function rebuildStaff(){ groups.staff.clear(); let idx=0; Object.entries(state.staff).forEach(([id,count])=>{ for(let n=0;n<count;n++){ const s=makeStaffFigure(id); const x=buildOffsetX()+1+(idx%5); const z=buildOffsetZ()+1+Math.floor(idx/5); const p=tileToWorld(x,z); s.position.set(p.x,.16,p.z); groups.staff.add(s); idx++; }}); }

// Item models: no built-in floor plates, just equipment/furniture.
function makeReceptionDesk(){ const g=new THREE.Group(); g.add(box(1.7,.72,.55,mat.wood,true).positioned(0,.44,0)); g.add(box(.38,.28,.06,mat.glass,true).positioned(.45,.95,-.18)); g.add(box(.3,.18,.25,mat.metal,true).positioned(-.55,.86,-.12)); return g; }
function makeTurnstile(){ const g=new THREE.Group(); [-.35,.35].forEach(x=>{ g.add(cylinder(.06,.06,.75,mat.metal).positioned(x,.45,0)); g.add(box(.5,.06,.06,mat.metal,true).positioned(x,.75,0)); }); return g; }
function makeCafeCounter(){ const g=new THREE.Group(); g.add(box(2.6,.72,.55,mat.pink,true).positioned(0,.44,0)); for(let i=0;i<4;i++) g.add(cylinder(.08,.07,.22,i%2?mat.green:mat.gold).positioned(-.9+i*.55,.92,-.08)); return g; }
function makeSofa(){ const g=new THREE.Group(); g.add(box(1.7,.32,.62,mat.purple,true).positioned(0,.34,0)); g.add(box(1.75,.62,.16,mat.purple,true).positioned(0,.58,-.27)); return g; }
function makeLockerBank(){ const g=new THREE.Group(); [-.45,.15,.75].forEach((x,i)=>g.add(box(.5,1.2,.38,i%2?mat.gold:mat.metal,true).positioned(x,.72,0))); return g; }
function makeBench(){ const g=new THREE.Group(); g.add(box(1.6,.18,.35,mat.wood,true).positioned(0,.38,0)); [-.55,.55].forEach(x=>g.add(cylinder(.04,.04,.45,mat.metal).positioned(x,.19,0))); return g; }
function makeVending(){ const g=new THREE.Group(); g.add(box(.72,1.4,.48,mat.blue,true).positioned(0,.82,0)); g.add(box(.42,.72,.04,mat.glass,true).positioned(-.05,.92,-.25)); return g; }
function makeDumbbellRack(){ const g=new THREE.Group(); g.add(box(1.65,.12,.26,mat.metal,true).positioned(0,.48,0)); for(let i=0;i<6;i++){ const x=-.68+i*.27; g.add(cylinder(.08,.08,.08,mat.rubber).rotated(Math.PI/2,0,0).positioned(x,.62,-.08)); g.add(cylinder(.08,.08,.08,mat.rubber).rotated(Math.PI/2,0,0).positioned(x,.62,.08)); } return g; }
function makeBenchPress(){ const g=new THREE.Group(); g.add(box(1.25,.18,.42,mat.red,true).positioned(0,.42,.35)); g.add(cylinder(.035,.035,1.55,mat.metal).rotated(0,0,Math.PI/2).positioned(0,.92,-.35)); [-.82,.82].forEach(x=>g.add(cylinder(.16,.16,.08,mat.rubber).rotated(0,0,Math.PI/2).positioned(x,.92,-.35))); return g; }
function makeSquatRack(){ const g=new THREE.Group(); [-.55,.55].forEach(x=>{ g.add(cylinder(.04,.04,1.45,mat.metal).positioned(x,.85,-.45)); g.add(cylinder(.04,.04,1.45,mat.metal).positioned(x,.85,.45)); }); g.add(cylinder(.035,.035,1.35,mat.metal).rotated(0,0,Math.PI/2).positioned(0,1.35,-.45)); return g; }
function makeCableMachine(){ const g=new THREE.Group(); [-.55,.55].forEach(x=>{ g.add(box(.28,1.55,.28,mat.dark,true).positioned(x,.9,0)); g.add(cylinder(.025,.025,1.05,mat.metal).positioned(x,.92,.35)); }); g.add(box(1.4,.12,.18,mat.metal,true).positioned(0,1.55,0)); return g; }
function makeLegPress(){ const g=new THREE.Group(); g.add(box(1.0,.25,.65,mat.rubber,true).positioned(0,.42,.25)); g.add(box(.72,.12,.8,mat.metal,true).rotated(-.45,0,0).positioned(0,.72,-.25)); return g; }
function makeWeightBench(){ const g=new THREE.Group(); g.add(box(.52,.2,1.2,mat.red,true).positioned(0,.4,0)); g.add(cylinder(.04,.04,.5,mat.metal).positioned(0,.2,-.35)); return g; }
function makePlateTree(){ const g=new THREE.Group(); g.add(cylinder(.04,.04,.9,mat.metal).positioned(0,.55,0)); for(let i=0;i<4;i++) g.add(cylinder(.16+.03*i,.16+.03*i,.06,mat.rubber).rotated(0,0,Math.PI/2).positioned(i%2?-.22:.22,.4+i*.12,0)); return g; }
function makeTreadmill(){ const g=new THREE.Group(); g.add(box(.72,.16,1.25,mat.rubber,true).positioned(0,.28,.05)); g.add(box(.58,.05,.82,mat.dark,true).positioned(0,.4,.12)); g.add(box(.72,.1,.06,mat.metal,true).positioned(0,.85,-.48)); return g; }
function makeSpinBike(){ const g=new THREE.Group(); g.add(cylinder(.22,.22,.05,mat.rubber).rotated(Math.PI/2,0,0).positioned(0,.36,0)); g.add(cylinder(.04,.04,.6,mat.metal).positioned(0,.62,0)); g.add(box(.45,.08,.22,mat.rubber,true).positioned(0,.88,.22)); return g; }
function makeRower(){ const g=new THREE.Group(); g.add(box(.36,.08,1.35,mat.metal,true).positioned(0,.32,0)); g.add(box(.42,.14,.28,mat.rubber,true).positioned(0,.45,.25)); g.add(cylinder(.18,.18,.08,mat.rubber).rotated(Math.PI/2,0,0).positioned(0,.35,-.58)); return g; }
function makeCrossTrainer(){ const g=new THREE.Group(); g.add(box(.55,.1,1.0,mat.metal,true).positioned(0,.28,0)); [-.18,.18].forEach(x=>g.add(cylinder(.025,.025,1.0,mat.metal).positioned(x,.75,-.18))); g.add(box(.58,.08,.08,mat.rubber,true).positioned(0,.62,.35)); return g; }
function makeStairClimber(){ const g=new THREE.Group(); for(let i=0;i<4;i++) g.add(box(.65,.08,.18,mat.rubber,true).positioned(0,.25+i*.13,.22-i*.16)); g.add(box(.65,1.0,.08,mat.metal,true).positioned(0,.72,-.42)); return g; }
function makeYogaMat(){ const g=new THREE.Group(); g.add(box(.78,.035,.78,mat.purple,false).positioned(0,.18,0)); return g; }
function makeReformer(){ const g=new THREE.Group(); g.add(box(.62,.16,1.35,mat.wood,true).positioned(0,.32,0)); g.add(box(.42,.12,.42,mat.rubber,true).positioned(0,.46,.28)); g.add(cylinder(.025,.025,.7,mat.metal).rotated(0,0,Math.PI/2).positioned(0,.62,-.48)); return g; }
function makeMirror(){ const g=new THREE.Group(); g.add(box(.82,1.2,.06,mat.glass,true).positioned(0,.85,0)); return g; }
function makeSpeaker(){ const g=new THREE.Group(); g.add(box(.42,.85,.38,mat.dark,true).positioned(0,.58,0)); g.add(cylinder(.13,.13,.04,mat.rubber).rotated(Math.PI/2,0,0).positioned(0,.72,-.21)); return g; }
function makePoolLane(){ const g=new THREE.Group(); const baseW=6, baseH=2; g.add(box(baseW-.18,.22,baseH-.18,mat.stone,true).positioned(0,.26,0)); g.add(box(baseW-.46,.12,baseH-.46,mat.water,false).positioned(0,.42,0)); for(let z=-.45; z<=.45; z+=.9) g.add(box(baseW-.65,.035,.035,mat.kerb,false).positioned(0,.52,z)); return g; }
function makeJacuzzi(){ const g=new THREE.Group(); g.add(cylinder(.9,.95,.36,mat.stone).positioned(0,.36,0)); g.add(cylinder(.72,.75,.12,mat.water).positioned(0,.62,0)); return g; }
function makeSaunaCabin(){ const g=new THREE.Group(); g.add(box(1.65,1.3,1.55,mat.wood,true).positioned(0,.82,0)); g.add(box(.55,.9,.05,mat.glass,true).positioned(0,.74,-.79)); return g; }
function makeSteamRoom(){ const g=new THREE.Group(); g.add(box(1.55,1.25,1.55,mat.glass,true).positioned(0,.78,0)); g.add(box(.45,.2,.45,mat.stone,true).positioned(-.45,.34,.35)); return g; }
function makeShowerPod(){ const g=new THREE.Group(); g.add(cylinder(.22,.22,.08,mat.stone).positioned(0,.25,0)); g.add(cylinder(.025,.025,1.05,mat.metal).positioned(0,.78,.18)); g.add(cylinder(.12,.12,.05,mat.metal).positioned(0,1.25,.15)); return g; }
function makeTreatmentBed(){ const g=new THREE.Group(); g.add(box(.68,.22,1.35,mat.wall,true).positioned(0,.38,0)); g.add(box(.36,.14,.28,mat.green,true).positioned(0,.58,-.42)); return g; }
function makePlanter(){ const g=new THREE.Group(); g.add(cylinder(.22,.28,.35,mat.wood).positioned(0,.32,0)); for(let i=0;i<6;i++) g.add(box(.12,.38,.04,mat.green,true).rotated(.45,i,0).positioned(Math.cos(i)*.16,.65,Math.sin(i)*.16)); return g; }
function makeWaterFeature(){ const g=new THREE.Group(); g.add(cylinder(.85,.9,.25,mat.stone).positioned(0,.28,0)); g.add(cylinder(.55,.55,.08,mat.water).positioned(0,.45,0)); g.add(cylinder(.08,.1,.65,mat.stone).positioned(0,.72,0)); return g; }
function makeWallArt(){ const g=new THREE.Group(); g.add(box(.72,.72,.05,mat.gold,true).positioned(0,.74,0)); g.add(box(.56,.5,.06,mat.blue,true).positioned(0,.74,-.03)); return g; }
function makeTowelStand(){ const g=new THREE.Group(); g.add(cylinder(.04,.04,.9,mat.metal).positioned(0,.55,0)); for(let i=0;i<3;i++) g.add(box(.55,.08,.22,[mat.teal,mat.blue,mat.pink][i],true).positioned(0,.35+i*.18,0)); return g; }
function makePlantWall(){ const g=new THREE.Group(); g.add(box(1.55,1.2,.12,mat.green,true).positioned(0,.78,0)); for(let i=0;i<6;i++) g.add(box(.18,.2,.05,mat.grass,true).positioned(-.6+(i%3)*.6,.45+Math.floor(i/3)*.38,-.08)); return g; }
function makeStaffFigure(id){ const g=new THREE.Group(); const color={receptionist:mat.teal, cleaner:mat.gold, instructor:mat.orange, lifeguard:mat.red, therapist:mat.purple}[id]||mat.blue; g.add(cylinder(.16,.18,.5,color).positioned(0,.45,0)); const head=new THREE.Mesh(new THREE.SphereGeometry(.15,18,18),mat.wall); head.position.y=.82; head.castShadow=true; g.add(head); const label=makeTextSprite(staffDefs[id].name.split(' ')[0]); label.position.set(0,1.18,0); label.scale.set(.8,.22,1); g.add(label); return g; }

THREE.Object3D.prototype.positioned = function(x,y,z){ this.position.set(x,y,z); return this; };
THREE.Object3D.prototype.rotated = function(x,y,z){ this.rotation.set(x,y,z); return this; };
function box(w,h,d,material,cast=true){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material); m.castShadow=cast; m.receiveShadow=true; return m; }
function cylinder(r1,r2,h,material){ const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,24), material); m.castShadow=true; m.receiveShadow=true; return m; }
function makeTextSprite(text){ const c=document.createElement('canvas'); c.width=512; c.height=128; const ctx=c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height); ctx.fillStyle='#f8fbff'; ctx.font='700 42px system-ui, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(text,c.width/2,c.height/2); const tex=new THREE.CanvasTexture(c); tex.colorSpace=THREE.SRGBColorSpace; return new THREE.Sprite(new THREE.SpriteMaterial({map:tex, transparent:true})); }

function buildPassability(){
  const walk=Array.from({length:state.maxW},(_,x)=>Array.from({length:state.maxH},(_,z)=>isUnlockedCell(x,z)));
  for(const it of state.items){ const def=itemDef(it.type); if(!def.blocks) continue; for(let x=it.x; x<it.x+it.w; x++) for(let z=it.z; z<it.z+it.h; z++) if(walk[x]?.[z]!==undefined) walk[x][z]=false; }
  return walk;
}
function wallBlocksBetween(ax,az,bx,bz){
  let dir,x,z; if(ax===bx){ dir='h'; x=ax; z=Math.max(az,bz); } else { dir='v'; x=Math.max(ax,bx); z=az; }
  const e=state.edges.find(e=>e.x===x&&e.z===z&&e.dir===dir); if(!e) return false; return !!edgeDef(e.type).blocks;
}
function findPath(start,goal){
  const walk=buildPassability(); const open=[start]; const came=new Map(); const g=new Map([[`${start.x},${start.z}`,0]]); const goalKey=`${goal.x},${goal.z}`; const seen=new Set();
  function score(n){ return (g.get(`${n.x},${n.z}`)||0)+Math.abs(n.x-goal.x)+Math.abs(n.z-goal.z); }
  while(open.length){ open.sort((a,b)=>score(a)-score(b)); const cur=open.shift(); const key=`${cur.x},${cur.z}`; if(seen.has(key)) continue; seen.add(key); if(key===goalKey) return reconstruct(came,cur); const ns=[[1,0],[-1,0],[0,1],[0,-1]]; for(const [dx,dz] of ns){ const nx=cur.x+dx,nz=cur.z+dz; const nk=`${nx},${nz}`; if(nx<0||nz<0||nx>=state.maxW||nz>=state.maxH||!walk[nx][nz]||wallBlocksBetween(cur.x,cur.z,nx,nz)) continue; const ng=(g.get(key)||0)+1; if(!g.has(nk)||ng<g.get(nk)){ g.set(nk,ng); came.set(nk,cur); open.push({x:nx,z:nz}); } } }
  return null;
}
function reconstruct(came,cur){ const path=[cur]; while(came.has(`${cur.x},${cur.z}`)){ cur=came.get(`${cur.x},${cur.z}`); path.push(cur); } return path.reverse(); }
function nearestTargetCell(item){ const candidates=[]; for(let x=item.x-1;x<=item.x+item.w;x++){ candidates.push({x,z:item.z-1}); candidates.push({x,z:item.z+item.h}); } for(let z=item.z;z<item.z+item.h;z++){ candidates.push({x:item.x-1,z}); candidates.push({x:item.x+item.w,z}); } const walk=buildPassability(); return candidates.find(c=>c.x>=0&&c.z>=0&&c.x<state.maxW&&c.z<state.maxH&&walk[c.x][c.z]) || {x:item.x,z:item.z}; }
function entranceCell(){ const doors=state.edges.filter(e=>edgeDef(e.type)?.kind==='door'); if(doors.length){ const d=doors[0]; const inside = d.dir==='h' ? {x:d.x,z:clamp(d.z,0,state.maxH-1)} : {x:clamp(d.x,0,state.maxW-1),z:d.z}; if(isUnlockedCell(inside.x,inside.z)) return inside; }
  return {x:buildOffsetX()+1,z:buildOffsetZ()+1}; }

function spawnVisitor(){
  const usable=state.items.filter(i=>itemDef(i.type).capacity>0); if(!usable.length) return; if(state.visitors.length>=Math.min(90, Math.max(8, Math.floor(state.members/2)))) return;
  const target=usable[Math.floor(Math.random()*usable.length)]; const start=entranceCell(); const goal=nearestTargetCell(target); const path=findPath(start,goal);
  if(!path){ state.routeScore=Math.max(0,state.routeScore-6); return; }
  const mesh=makeVisitor(); const wp=tileToWorld(start.x,start.z); mesh.position.set(wp.x,.16,wp.z); groups.people.add(mesh); state.visitors.push({id:nextVisitorId++,mesh,targetId:target.id,path,pathIndex:0,speed:1.65+Math.random()*.7,spend:0,leaving:false});
}
function makeVisitor(){ const g=new THREE.Group(); const body=cylinder(.15,.18,.48,[mat.teal,mat.blue,mat.gold,mat.pink,mat.purple][Math.floor(Math.random()*5)]); body.position.y=.42; g.add(body); const head=new THREE.Mesh(new THREE.SphereGeometry(.14,18,18),mat.wall); head.position.y=.75; head.castShadow=true; g.add(head); const sh=new THREE.Mesh(new THREE.CircleGeometry(.28,24),mat.shadow); sh.rotation.x=-Math.PI/2; sh.position.y=.02; g.add(sh); return g; }
function updateVisitors(dt){
  for(const v of [...state.visitors]){
    const targetCell=v.path[v.pathIndex]; if(!targetCell){ removeVisitor(v); continue; }
    const dest=tileToWorld(targetCell.x,targetCell.z); const dir=new THREE.Vector3(dest.x-v.mesh.position.x,0,dest.z-v.mesh.position.z); const dist=dir.length();
    if(dist>.08){ dir.normalize(); v.mesh.position.addScaledVector(dir,v.speed*dt); v.mesh.rotation.y=Math.atan2(dir.x,dir.z); v.mesh.position.y=.16+Math.sin(performance.now()*.008+v.id)*.025; }
    else { v.pathIndex++; if(v.pathIndex>=v.path.length){ if(v.leaving){ removeVisitor(v); continue; } v.spend+=dt; if(v.spend>2.2+Math.random()*1.6){ const target=state.items.find(i=>i.id===v.targetId); if(target){ const def=itemDef(target.type); let mult=.8+state.rating/100; if(['freeweights','cardio','studio'].includes(def.cat)) mult+=state.staff.instructor*.05; if(def.cat==='poolspa') mult+=state.staff.lifeguard*.04+state.staff.therapist*.05; state.cash+=Math.round(def.income*mult); target.visits++; target.condition=clamp(target.condition-(.35+Math.random()*.35)/(1+state.staff.cleaner*.25),35,100); }
        if(Math.random()<.42){ v.leaving=true; const start=entranceCell(); const cur=worldToTile(v.mesh.position); v.path=findPath(cur,start)||[cur,start]; v.pathIndex=0; } else { const choices=state.items.filter(i=>itemDef(i.type).capacity>0); const next=choices[Math.floor(Math.random()*choices.length)]; v.targetId=next.id; const cur=worldToTile(v.mesh.position); v.path=findPath(cur,nearestTargetCell(next))||[cur]; v.pathIndex=0; v.spend=0; }
      }}}
  }
}
function removeVisitor(v){ groups.people.remove(v.mesh); state.visitors=state.visitors.filter(x=>x!==v); }

function updateSimulation(dt){
  state.minute += dt*5.6; if(state.minute>=1440){ state.minute-=1440; state.day++; state.items.forEach(i=>i.visits=0); }
  simAcc+=dt; if(simAcc<1) return; simAcc=0;
  const cap=state.items.reduce((s,i)=>s+itemDef(i.type).capacity,0);
  const appeal=state.items.reduce((s,i)=>s+itemDef(i.type).appeal,0)+state.edges.filter(e=>['glassWall','windowPanel','wideWindow','poolWindow'].includes(e.type)).length*1.5+state.floors.length*.18;
  const variety=new Set(state.items.map(i=>i.type)).size + new Set(state.floors.map(f=>f.type)).size*.15;
  const condition=state.items.length?state.items.reduce((s,i)=>s+i.condition,0)/state.items.length:100;
  const cleanerBoost=state.staff.cleaner*8;
  state.cleanliness=clamp(condition - state.visitors.length*.18 + cleanerBoost,20,100);
  state.luxury=clamp(appeal*1.35 + variety*1.2 + state.staff.therapist*4,0,100);
  if(performance.now()-lastRouteCheck>2500){ state.routeScore=calculateRouteScore(); lastRouteCheck=performance.now(); }
  state.rating=Math.round(clamp(32 + state.cleanliness*.22 + state.luxury*.36 + state.routeScore*.16 + state.staff.receptionist*3 - Math.max(0,state.members-cap)*.28, 12, 99));
  const targetMembers = hasItem('receptionDesk') ? Math.floor(6 + cap*2.6 + state.rating*.7 + state.reputation*2.5 + state.staff.receptionist*8) : Math.floor(cap*.2);
  state.members += Math.sign(targetMembers-state.members)*Math.min(3,Math.abs(targetMembers-state.members));
  state.reputation=Math.max(0,Math.floor((state.rating-42)/6 + state.items.length*.28 + state.expansions*2));
  const wage=Object.entries(state.staff).reduce((s,[id,c])=>s+c*staffDefs[id].wage,0);
  state.cash-=wage*.28;
  state.items.forEach(i=>{ i.condition=clamp(i.condition - .006/(1+state.staff.cleaner*.35),25,100); });
  if(Math.random()<clamp(state.members/125,.08,.85)) spawnVisitor();
  updateUi(false);
}
function calculateRouteScore(){ const usable=state.items.filter(i=>itemDef(i.type).capacity>0).slice(0,10); if(!usable.length) return 100; const start=entranceCell(); let reachable=0; for(const it of usable){ if(findPath(start,nearestTargetCell(it))) reachable++; } return Math.round((reachable/usable.length)*100); }

function updateUi(full=false){
  ui.cash.textContent=money(state.cash); ui.members.textContent=String(Math.round(state.members)); ui.rating.textContent=`${state.rating}%`; ui.rep.textContent=String(state.reputation); ui.day.textContent=String(state.day); ui.clock.textContent=`${String(Math.floor(state.minute/60)).padStart(2,'0')}:${String(Math.floor(state.minute%60)).padStart(2,'0')}`;
  ui.cleanText.textContent=`${Math.round(state.cleanliness)}%`; ui.cleanBar.style.width=`${state.cleanliness}%`; ui.luxuryText.textContent=`${Math.round(state.luxury)}%`; ui.luxuryBar.style.width=`${state.luxury}%`; ui.routeText.textContent=state.routeScore>75?'Good':state.routeScore>35?'Patchy':'Blocked'; ui.routeBar.style.width=`${state.routeScore}%`;
  const def=selectedDef(); ui.selectedHint.textContent=state.bulldoze?'Bulldoze mode':def?`${def.name} · ${state.mode==='edge'?'edge snap':'R rotates'} · Q deselect`:'Nothing selected'; ui.bulldozeBtn.classList.toggle('active-tool',state.bulldoze);
  const cost=6500+state.expansions*4500; ui.expandBtn.textContent=`Expand ${money(cost)}`;
  refreshBuildButtons(); renderObjectives(); Object.keys(staffDefs).forEach(id=>{ const el=document.getElementById(`staff-${id}`); if(el) el.textContent=String(state.staff[id]); });
  if(!selectedThing || full){ ui.inspectTitle.textContent=def?`${def.emoji} ${def.name}`:'Blank Plot'; ui.inspectBody.textContent=def?`${def.desc||''} ${state.mode==='edge'?'This will place on grid edges, not tile centres.':''}`:'Use floors first, draw walls on edges, add doors/windows, then place individual equipment to design your own areas.'; }
}
function renderObjectives(){ ui.objectives.innerHTML=objectives.map(o=>`<li class="${o.done()?'done':''}">${o.done()?'✓':'○'} ${o.text}</li>`).join(''); }
function toast(msg){ ui.toast.textContent=msg; ui.toast.classList.remove('hidden'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>ui.toast.classList.add('hidden'),3200); }
function saveGame(){ const data={...state, visitors:[]}; localStorage.setItem(SAVE_KEY,JSON.stringify(data)); toast('Game saved in this browser.'); }
function loadGame(){ const raw=localStorage.getItem(SAVE_KEY); if(!raw){ toast('No save found yet.'); return; } const data=JSON.parse(raw); Object.assign(state,data,{visitors:[]}); nextId=Math.max(1,...state.floors.map(f=>f.id+1),...state.edges.map(e=>e.id+1),...state.items.map(i=>i.id+1)); groups.people.clear(); rebuildPlot(); rebuildAll(); updateUi(true); toast('Save loaded.'); }

function animate(){ const dt=Math.min(clock.getDelta(),.05); controls.update(); updateVisitors(dt); updateSimulation(dt); animateWater(); renderer.render(scene,camera); requestAnimationFrame(animate); }
function animateWater(){ const t=performance.now()*.001; groups.items.traverse(o=>{ if(o.material===mat.water) o.position.y += Math.sin(t*2)*.0008; }); }
