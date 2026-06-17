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
const SAVE_KEY = 'leisure-club-tycoon-builder-v5';

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
  { id:'solidWall', name:'Internal Wall', emoji:'🧱', cost:95, kind:'wall', blocks:true, material:'wall', thickness:.18, height:2.45, desc:'Plain interior wall segment.' },
  { id:'exteriorWall', name:'Exterior Wall', emoji:'🏢', cost:135, kind:'wall', blocks:true, material:'exterior', thickness:.24, height:2.75, desc:'Thicker exterior wall for the building shell.' },
  { id:'brickWall', name:'Feature Brick Wall', emoji:'🧱', cost:150, kind:'wall', blocks:true, material:'brick', thickness:.20, height:2.55, desc:'Warm brick feature wall.' },
  { id:'glassWall', name:'Slim Glass Wall', emoji:'🪟', cost:185, kind:'wall', blocks:true, material:'glass', thickness:.085, height:2.65, mullions:true, desc:'Thin premium glazed wall segment. Slimmer than solid walls so equipment can sit tighter beside it.' },
  { id:'lowDivider', name:'Low Divider', emoji:'▁', cost:70, kind:'wall', blocks:false, material:'dark', thickness:.13, height:.82, desc:'Low divider that people can route through.' }
];

const openingTypes = [
  { id:'singleDoor', name:'Single Door', emoji:'🚪', cost:140, kind:'door', blocks:false, material:'wood', thickness:.12, height:2.25, desc:'A passable interior door.' },
  { id:'doubleDoor', name:'Double Glass Door', emoji:'🚪', cost:220, kind:'door', blocks:false, material:'doorGlass', thickness:.08, height:2.45, desc:'Premium double door, passable.' },
  { id:'slidingDoor', name:'Sliding Spa Door', emoji:'↔️', cost:260, kind:'door', blocks:false, material:'doorGlass', thickness:.075, height:2.35, desc:'Passable glass sliding door.' },
  { id:'archedDoor', name:'Arched Doorway', emoji:'⌒', cost:190, kind:'door', blocks:false, material:'wood', thickness:.16, height:2.5, desc:'Open arched pass-through.' },
  { id:'windowPanel', name:'Standard Window', emoji:'🪟', cost:160, kind:'window', blocks:true, material:'glass', thickness:.08, sill:.55, glassH:1.55, top:.24, desc:'Taller standard window panel.' },
  { id:'wideWindow', name:'Wide Picture Window', emoji:'▭', cost:220, kind:'window', blocks:true, material:'glass', thickness:.075, sill:.42, glassH:1.75, top:.2, wide:true, desc:'Wider, taller premium glass window.' },
  { id:'fullHeightWindow', name:'Full-Height Glass', emoji:'▯', cost:280, kind:'window', blocks:true, material:'glass', thickness:.07, sill:.1, glassH:2.25, top:.08, desc:'Almost floor-to-ceiling glass panel.' },
  { id:'frostedSpaWindow', name:'Frosted Spa Window', emoji:'🧊', cost:240, kind:'window', blocks:true, material:'glass', tint:'frosted', thickness:.075, sill:.85, glassH:1.35, top:.32, desc:'Privacy window for spa/changing areas.' },
  { id:'poolWindow', name:'Pool Viewing Window', emoji:'🌊', cost:290, kind:'window', blocks:true, material:'glass', tint:'pool', thickness:.075, sill:.25, glassH:1.95, top:.16, desc:'Tall blue-tinted viewing window for pool halls.' },
  { id:'clerestoryWindow', name:'High Clerestory Window', emoji:'▔', cost:180, kind:'window', blocks:true, material:'glass', thickness:.07, sill:1.45, glassH:.72, top:.32, desc:'High window strip for privacy and natural light.' }
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
  buildW: 26, buildH: 18, maxW: 56, maxH: 44, expansions: 0,
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
function buildOffsetZ(){ return 0; } // starter plot is pinned to the front edge; expansions grow backwards
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
  const grass = box(170,0.12,145,mat.grass,false); grass.position.y=-0.08; groups.env.add(grass);
  addRoad(0,-40,170,10); addRoad(-44,0,10,145); addRoad(48,0,8,145);
  addPath(0, -29, 30, 3.2); addPath(-18, -24, 3, 22); addPath(21, -23, 3, 20);
  makeTownBuilding(-62,-32,9,7,5,0xd8c4aa); makeTownBuilding(-52,31,10,8,7,0xc4ced8); makeTownBuilding(56,32,12,9,8,0xd7bfa2); makeTownBuilding(62,-16,10,7,6,0xbecbd0); makeTownBuilding(5,52,18,7,6,0xcfc4b2); makeTownBuilding(-25,50,14,8,7,0xbcd2c7);
  for(let i=0;i<58;i++) makeTree(-78 + Math.random()*156, -64 + Math.random()*128, 0.8+Math.random()*0.7);
  for(let i=0;i<15;i++) makeStreetLight(-40+i*5.8, -34.5);
  for(let i=0;i<10;i++) makeCar(-31+i*6.4, -42.5, i%3);
  makePlotSign(-19, -32.2);
  const entry=box(8,.05,3.4,mat.path,false); entry.position.set(0,.045,plotOriginZ()-1.1); groups.env.add(entry);
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
  const ox=buildOffsetX(), oz=buildOffsetZ();
  const unlockedCenter=tileToWorld(ox,oz,state.buildW,state.buildH);
  const unlocked = box(state.buildW,0.04,state.buildH,mat.plot,false); unlocked.position.set(unlockedCenter.x,0.055,unlockedCenter.z); groups.plot.add(unlocked);
  // locked land overlays surround the starter footprint. The front edge is intentionally already available so expansion never happens in front of the entrance.
  addLockedRect(0, 0, ox, state.maxH);
  addLockedRect(ox+state.buildW, 0, state.maxW-(ox+state.buildW), state.maxH);
  addLockedRect(ox, oz+state.buildH, state.buildW, state.maxH-(oz+state.buildH));
  rebuildGrid();
}
function addLockedRect(x,z,w,h){ if(w<=0||h<=0) return; const c=tileToWorld(x,z,w,h); const r=box(w,0.045,h,mat.plotLocked,false); r.position.set(c.x,.078,c.z); groups.plot.add(r); }

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
function expandPlot(){ const cost=6500+state.expansions*4500; if(state.cash<cost){ toast(`Expansion costs ${money(cost)}.`); return; } if(state.buildW>=state.maxW && state.buildH>=state.maxH){ toast('Plot already fully expanded.'); return; } state.cash-=cost; state.expansions++; state.buildW=Math.min(state.maxW, state.buildW+8); state.buildH=Math.min(state.maxH, state.buildH+6); rebuildPlot(); updateUi(true); toast('Plot expanded sideways/backwards. The front entrance stays on the road side.'); }

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
  if(state.mode==='floor'){ ok=canPlaceFloor(hovered.x,hovered.z); ghost=box(1.02,.06,1.02,ok?mat.ghostGood:mat.ghostBad,false); const p=tileToWorld(hovered.x,hovered.z); ghost.position.set(p.x,.17,p.z); }
  if(state.mode==='item'){ const [w,h]=rotatedSize(def); ok=canPlaceItem(state.selectedId, hovered.x, hovered.z, state.rotation).ok; ghost=box(w,.35,h,ok?mat.ghostGood:mat.ghostBad,false); const p=tileToWorld(hovered.x,hovered.z,w,h); ghost.position.set(p.x,.35,p.z); ghost.rotation.y=state.rotation*Math.PI/2; }
  if(state.mode==='edge'){ ok=canPlaceEdge(hovered.x,hovered.z,hovered.dir).ok; ghost=makeEdgePreview(hovered.x,hovered.z,hovered.dir, ok); }
  if(ghost) groups.previews.add(ghost);
}
function makeEdgePreview(x,z,dir,ok){ const g=new THREE.Group(); const def=edgeDef(state.selectedId)||{}; const thick=def.thickness||.16; const h=def.kind==='window'?1.8:(def.height||.9); const mesh=box(dir==='h'?1:thick,h,dir==='h'?thick:1,ok?mat.ghostEdge:mat.ghostBad,false); const pos=edgeWorld(x,z,dir); mesh.position.set(pos.x,h/2,pos.z); g.add(mesh); return g; }
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
function rebuildFloors(){ groups.floors.clear(); state.floors.forEach(f=>{ const def=floorDef(f.type); const m=new THREE.MeshStandardMaterial({color:def.color, roughness:.72}); const tile=box(1.012,.055,1.012,m,false); const p=tileToWorld(f.x,f.z); tile.position.set(p.x,.118,p.z); tile.userData={kind:'floor',id:f.id}; groups.floors.add(tile); addFloorPattern(tile,def,f); }); }
function addFloorPattern(tile,def,f){ if(['rubberGreen','poolTile','courtWood','kidsFoam','cafeTerrazzo'].includes(def.id)){ const line=box(.92,.01,.035,mat.dark,false); line.position.set(tile.position.x,.151,tile.position.z); line.userData={kind:'floor',id:f.id}; groups.floors.add(line); } }
function rebuildEdges(){ groups.edges.clear(); state.edges.forEach(e=>{ const model=makeEdgeModel(e); groups.edges.add(model); }); }
function makeEdgeModel(e){
  const def=edgeDef(e.type); const g=new THREE.Group(); const pos=edgeWorld(e.x,e.z,e.dir); const h=def.height||2.45; const thick=def.thickness||.18; const material=mat[def.material]||mat.wall;
  const wallDims=e.dir==='h'?[1,thick]:[thick,1];
  if(def.kind==='door'){
    const postMat=e.type.includes('Glass')||e.type==='slidingDoor'?mat.metal:mat.exterior;
    const post1=box(e.dir==='h'?.11:thick,h,e.dir==='h'?thick:.11,postMat,true); const post2=post1.clone();
    if(e.dir==='h'){ post1.position.set(pos.x-.45,h/2,pos.z); post2.position.set(pos.x+.45,h/2,pos.z); } else { post1.position.set(pos.x,h/2,pos.z-.45); post2.position.set(pos.x,h/2,pos.z+.45); }
    const lintel=box(e.dir==='h'?1:thick,.18,e.dir==='h'?thick:1,postMat,true); lintel.position.set(pos.x,h-.09,pos.z); g.add(post1,post2,lintel);
    if(e.type==='archedDoor'){
      const arch=cylinder(.48,.48,.08,postMat); arch.rotation.set(Math.PI/2,0,e.dir==='h'?Math.PI/2:0); arch.position.set(pos.x,h-.35,pos.z); g.add(arch);
    } else {
      const leafW=e.type==='singleDoor'?.52:.76; const leaf=box(e.dir==='h'?leafW:.06,1.78,e.dir==='h'?.06:leafW,material,true); leaf.position.set(pos.x,.96,pos.z); g.add(leaf);
      const handle=cylinder(.035,.035,.08,mat.gold); handle.rotation.x=Math.PI/2; handle.position.set(pos.x+(e.dir==='h'?leafW*.28:.04),.96,pos.z+(e.dir==='h'?.04:leafW*.28)); g.add(handle);
    }
  } else if(def.kind==='window'){
    const sill=def.sill ?? .55, glassH=def.glassH ?? 1.45, top=def.top ?? .25;
    const frameMat=def.tint==='pool'?mat.blue:def.tint==='frosted'?mat.wall:mat.metal;
    const glassMat=def.tint==='pool'?mat.water:material;
    const bottom=box(e.dir==='h'?1:thick,sill,e.dir==='h'?thick:1,mat.wall,true); bottom.position.set(pos.x,sill/2,pos.z); g.add(bottom);
    const glassW=def.wide?.98:.86;
    const glass=box(e.dir==='h'?glassW:thick*.65,glassH,e.dir==='h'?thick*.65:glassW,glassMat,true); glass.position.set(pos.x,sill+glassH/2,pos.z); g.add(glass);
    const railA=box(e.dir==='h'?1.02:thick*.9,.065,e.dir==='h'?thick*.9:1.02,frameMat,true); railA.position.set(pos.x,sill,pos.z); const railB=railA.clone(); railB.position.y=sill+glassH; g.add(railA,railB);
    const mullion=box(e.dir==='h'?.045:thick*.72,glassH,e.dir==='h'?thick*.72:.045,frameMat,true); mullion.position.set(pos.x,sill+glassH/2,pos.z); g.add(mullion);
    if(top>0){ const cap=box(e.dir==='h'?1:thick,top,e.dir==='h'?thick:1,mat.wall,true); cap.position.set(pos.x,sill+glassH+top/2,pos.z); g.add(cap); }
  } else {
    const wall=box(wallDims[0],h,wallDims[1],material,true); wall.position.set(pos.x,h/2,pos.z); g.add(wall);
    if(def.mullions){ const m1=box(e.dir==='h'?.04:thick*.9,h*.88,e.dir==='h'?thick*.9:.04,mat.metal,true); m1.position.set(pos.x-.28,h*.48,pos.z); const m2=m1.clone(); if(e.dir==='h') m2.position.x=pos.x+.28; else m2.position.z=pos.z+.28; g.add(m1,m2); }
  }
  g.traverse(o=>{ if(o.isMesh){ o.userData={kind:'edge',id:e.id}; o.castShadow=true; o.receiveShadow=true; }}); return g;
}

function rebuildItems(){ groups.items.clear(); state.items.forEach(it=>{ const def=itemDef(it.type); const g=def.build(it); addItemDetail(g,it.type); groundGroup(g); const [w,h]=[it.w,it.h]; const p=tileToWorld(it.x,it.z,w,h); g.position.set(p.x,.155,p.z); g.rotation.y=it.rot*Math.PI/2; g.userData={kind:'item',id:it.id}; g.traverse(o=>{ if(o.isMesh||o.isSprite){ o.userData={kind:'item',id:it.id}; if(o.isMesh){o.castShadow=true; o.receiveShadow=true;} }}); groups.items.add(g); }); }
function rebuildStaff(){ groups.staff.clear(); let idx=0; Object.entries(state.staff).forEach(([id,count])=>{ for(let n=0;n<count;n++){ const s=makeStaffFigure(id); const x=buildOffsetX()+1+(idx%5); const z=buildOffsetZ()+1+Math.floor(idx/5); const p=tileToWorld(x,z); s.position.set(p.x,.16,p.z); groups.staff.add(s); idx++; }}); }

// Item models: no built-in floor plates, just equipment/furniture.
function makeReceptionDesk(){ const g=new THREE.Group(); g.add(box(1.85,.72,.58,mat.wood,true).positioned(0,.36,0)); g.add(box(1.72,.08,.12,mat.gold,true).positioned(0,.76,-.23)); g.add(box(.42,.28,.06,mat.glass,true).positioned(.48,.94,-.24)); g.add(box(.3,.18,.25,mat.metal,true).positioned(-.58,.84,-.13)); g.add(cylinder(.06,.06,.32,mat.gold).positioned(-.82,.94,.14)); return g; }
function makeTurnstile(){ const g=new THREE.Group(); [-.38,.38].forEach(x=>{ g.add(cylinder(.055,.055,.78,mat.metal).positioned(x,.39,0)); g.add(box(.56,.055,.055,mat.metal,true).positioned(x,.68,0)); g.add(box(.08,.5,.22,mat.glass,true).positioned(x,.42,.28)); }); g.add(box(1.35,.07,.12,mat.dark,true).positioned(0,.08,0)); return g; }
function makeCafeCounter(){ const g=new THREE.Group(); g.add(box(2.7,.74,.58,mat.pink,true).positioned(0,.37,0)); g.add(box(2.55,.12,.18,mat.dark,true).positioned(0,.78,-.18)); g.add(box(.48,.62,.06,mat.glass,true).positioned(-.85,.84,-.31)); for(let i=0;i<5;i++) g.add(cylinder(.07,.06,.22,i%2?mat.green:mat.gold).positioned(-.55+i*.28,.92,.05)); g.add(box(.7,.2,.24,mat.metal,true).positioned(.88,.93,-.12)); return g; }
function makeSofa(){ const g=new THREE.Group(); g.add(box(1.78,.34,.68,mat.purple,true).positioned(0,.17,0)); g.add(box(1.82,.68,.17,mat.purple,true).positioned(0,.42,-.29)); [-.68,0,.68].forEach(x=>g.add(box(.48,.08,.5,mat.pink,true).positioned(x,.38,.06))); g.add(box(.12,.36,.68,mat.purple,true).positioned(-.96,.28,0)); g.add(box(.12,.36,.68,mat.purple,true).positioned(.96,.28,0)); return g; }
function makeLockerBank(){ const g=new THREE.Group(); [-.62,-.05,.52].forEach((x,i)=>{ g.add(box(.5,1.28,.36,i%2?mat.gold:mat.metal,true).positioned(x,.64,0)); g.add(box(.04,.08,.025,mat.dark,true).positioned(x+.14,.75,-.19)); g.add(box(.35,.025,.03,mat.dark,true).positioned(x,.38,-.19)); }); return g; }
function makeBench(){ const g=new THREE.Group(); g.add(box(1.65,.18,.36,mat.wood,true).positioned(0,.33,0)); [-.55,.55].forEach(x=>{ g.add(cylinder(.035,.035,.42,mat.metal).positioned(x,.16,-.1)); g.add(cylinder(.035,.035,.42,mat.metal).positioned(x,.16,.1)); }); return g; }
function makeVending(){ const g=new THREE.Group(); g.add(box(.76,1.45,.5,mat.blue,true).positioned(0,.72,0)); g.add(box(.42,.76,.04,mat.glass,true).positioned(-.07,.86,-.27)); g.add(box(.18,.22,.045,mat.dark,true).positioned(.24,.78,-.28)); for(let i=0;i<4;i++) g.add(box(.12,.08,.03,[mat.red,mat.gold,mat.green,mat.purple][i],true).positioned(-.18+(i%2)*.17,.62+Math.floor(i/2)*.17,-.3)); return g; }
function makeDumbbellRack(){ const g=new THREE.Group(); g.add(box(1.72,.08,.22,mat.metal,true).positioned(0,.25,0)); g.add(box(1.72,.08,.22,mat.metal,true).positioned(0,.55,0)); [-.78,.78].forEach(x=>g.add(cylinder(.035,.035,.55,mat.metal).positioned(x,.35,0))); for(let i=0;i<8;i++){ const x=-.74+i*.21; g.add(cylinder(.07+.01*(i%4),.07+.01*(i%4),.07,mat.rubber).rotated(Math.PI/2,0,0).positioned(x,.64,-.08)); g.add(cylinder(.07+.01*(i%4),.07+.01*(i%4),.07,mat.rubber).rotated(Math.PI/2,0,0).positioned(x,.64,.08)); } return g; }
function makeBenchPress(){ const g=new THREE.Group(); g.add(box(1.2,.16,.42,mat.red,true).positioned(0,.23,.32)); [-.45,.45].forEach(x=>g.add(cylinder(.04,.04,.78,mat.metal).positioned(x,.43,-.34))); g.add(cylinder(.035,.035,1.65,mat.metal).rotated(0,0,Math.PI/2).positioned(0,.83,-.34)); [-.9,.9].forEach(x=>{ g.add(cylinder(.17,.17,.075,mat.rubber).rotated(0,0,Math.PI/2).positioned(x,.83,-.34)); g.add(cylinder(.09,.09,.08,mat.rubber).rotated(0,0,Math.PI/2).positioned(x*.86,.83,-.34)); }); return g; }
function makeSquatRack(){ const g=new THREE.Group(); [-.58,.58].forEach(x=>{ [-.47,.47].forEach(z=>g.add(cylinder(.04,.04,1.55,mat.metal).positioned(x,.78,z))); g.add(box(.12,.08,.18,mat.gold,true).positioned(x,.98,-.47)); }); g.add(cylinder(.035,.035,1.35,mat.metal).rotated(0,0,Math.PI/2).positioned(0,1.32,-.47)); g.add(box(1.35,.06,.08,mat.metal,true).positioned(0,1.48,.47)); return g; }
function makeCableMachine(){ const g=new THREE.Group(); [-.62,.62].forEach(x=>{ g.add(box(.3,1.58,.32,mat.dark,true).positioned(x,.79,0)); g.add(cylinder(.022,.022,1.12,mat.metal).positioned(x,.73,.38)); g.add(box(.16,.16,.05,mat.gold,true).positioned(x,.95,.52)); }); g.add(box(1.5,.12,.2,mat.metal,true).positioned(0,1.53,0)); g.add(cylinder(.018,.018,1.3,mat.metal).rotated(0,0,Math.PI/2).positioned(0,1.34,.38)); return g; }
function makeLegPress(){ const g=new THREE.Group(); g.add(box(1.0,.26,.66,mat.rubber,true).positioned(0,.22,.28)); g.add(box(.78,.13,.88,mat.metal,true).rotated(-.45,0,0).positioned(0,.54,-.24)); g.add(box(.65,.48,.08,mat.dark,true).rotated(-.45,0,0).positioned(0,.78,-.56)); g.add(box(.56,.12,.5,mat.red,true).positioned(0,.42,.45)); return g; }
function makeWeightBench(){ const g=new THREE.Group(); g.add(box(.54,.18,1.2,mat.red,true).positioned(0,.25,0)); g.add(box(.5,.16,.42,mat.red,true).rotated(.35,0,0).positioned(0,.35,-.42)); [-.18,.18].forEach(x=>g.add(cylinder(.035,.035,.46,mat.metal).positioned(x,.12,.25))); return g; }
function makePlateTree(){ const g=new THREE.Group(); g.add(cylinder(.045,.045,.92,mat.metal).positioned(0,.46,0)); for(let i=0;i<5;i++) g.add(cylinder(.15+.03*i,.15+.03*i,.055,mat.rubber).rotated(0,0,Math.PI/2).positioned(i%2?-.24:.24,.22+i*.12,0)); g.add(cylinder(.18,.22,.08,mat.metal).positioned(0,.04,0)); return g; }
function makeTreadmill(){ const g=new THREE.Group(); g.add(box(.76,.15,1.3,mat.rubber,true).positioned(0,.12,.06)); g.add(box(.58,.045,.86,mat.dark,true).positioned(0,.22,.12)); [-.32,.32].forEach(x=>g.add(cylinder(.025,.025,.7,mat.metal).positioned(x,.5,-.46))); g.add(box(.78,.1,.08,mat.metal,true).positioned(0,.82,-.48)); g.add(box(.42,.24,.05,mat.glass,true).positioned(0,.94,-.53)); return g; }
function makeSpinBike(){ const g=new THREE.Group(); g.add(cylinder(.22,.22,.05,mat.rubber).rotated(Math.PI/2,0,0).positioned(0,.24,0)); g.add(cylinder(.2,.2,.05,mat.rubber).rotated(Math.PI/2,0,0).positioned(0,.24,.45)); g.add(cylinder(.035,.035,.58,mat.metal).rotated(.25,0,0).positioned(0,.48,.18)); g.add(box(.45,.08,.22,mat.rubber,true).positioned(0,.68,.26)); g.add(box(.52,.05,.08,mat.metal,true).positioned(0,.84,-.28)); return g; }
function makeRower(){ const g=new THREE.Group(); g.add(box(.36,.08,1.38,mat.metal,true).positioned(0,.13,0)); g.add(box(.42,.14,.28,mat.rubber,true).positioned(0,.27,.25)); g.add(cylinder(.18,.18,.08,mat.rubber).rotated(Math.PI/2,0,0).positioned(0,.18,-.58)); g.add(cylinder(.02,.02,.78,mat.metal).rotated(Math.PI/2,0,0).positioned(0,.43,-.18)); return g; }
function makeCrossTrainer(){ const g=new THREE.Group(); g.add(box(.58,.09,1.05,mat.metal,true).positioned(0,.1,0)); [-.2,.2].forEach(x=>{ g.add(cylinder(.024,.024,1.0,mat.metal).positioned(x,.55,-.18)); g.add(box(.14,.05,.65,mat.rubber,true).positioned(x,.22,.2)); }); g.add(box(.6,.08,.08,mat.rubber,true).positioned(0,.62,.35)); g.add(box(.36,.18,.05,mat.glass,true).positioned(0,.78,-.42)); return g; }
function makeStairClimber(){ const g=new THREE.Group(); for(let i=0;i<5;i++) g.add(box(.68,.075,.18,mat.rubber,true).positioned(0,.08+i*.11,.25-i*.14)); g.add(box(.68,.9,.08,mat.metal,true).positioned(0,.58,-.42)); g.add(box(.34,.16,.05,mat.glass,true).positioned(0,.88,-.48)); return g; }
function makeYogaMat(){ const g=new THREE.Group(); g.add(box(.82,.035,.82,mat.purple,false).positioned(0,.018,0)); g.add(cylinder(.05,.05,.78,mat.teal).rotated(0,0,Math.PI/2).positioned(0,.07,-.32)); return g; }
function makeReformer(){ const g=new THREE.Group(); g.add(box(.64,.16,1.36,mat.wood,true).positioned(0,.08,0)); g.add(box(.44,.12,.44,mat.rubber,true).positioned(0,.22,.28)); g.add(cylinder(.025,.025,.72,mat.metal).rotated(0,0,Math.PI/2).positioned(0,.39,-.5)); [-.26,.26].forEach(x=>g.add(cylinder(.018,.018,.85,mat.metal).positioned(x,.24,0))); return g; }
function makeMirror(){ const g=new THREE.Group(); g.add(box(.86,1.45,.035,mat.glass,true).positioned(0,.72,0)); g.add(box(.94,.06,.045,mat.metal,true).positioned(0,1.46,0)); g.add(box(.94,.06,.045,mat.metal,true).positioned(0,-.02,0)); return g; }
function makeSpeaker(){ const g=new THREE.Group(); g.add(box(.44,.88,.38,mat.dark,true).positioned(0,.44,0)); g.add(cylinder(.14,.14,.04,mat.rubber).rotated(Math.PI/2,0,0).positioned(0,.6,-.21)); g.add(cylinder(.08,.08,.04,mat.gold).rotated(Math.PI/2,0,0).positioned(0,.3,-.21)); return g; }
function makePoolLane(){ const g=new THREE.Group(); const baseW=6, baseH=2; g.add(box(baseW-.05,.22,baseH-.05,mat.stone,true).positioned(0,.11,0)); g.add(box(baseW-.38,.12,baseH-.38,mat.water,false).positioned(0,.25,0)); for(let z=-.45; z<=.45; z+=.9) g.add(box(baseW-.65,.035,.035,mat.kerb,false).positioned(0,.34,z)); [-2.6,2.6].forEach(x=>g.add(cylinder(.035,.035,.55,mat.metal).rotated(0,0,Math.PI/2).positioned(x,.45,.78))); return g; }
function makeJacuzzi(){ const g=new THREE.Group(); g.add(cylinder(.94,.98,.34,mat.stone).positioned(0,.17,0)); g.add(cylinder(.72,.75,.12,mat.water).positioned(0,.38,0)); for(let i=0;i<8;i++) g.add(cylinder(.035,.035,.02,mat.glass).positioned(Math.cos(i)*.5,.46,Math.sin(i)*.5)); return g; }
function makeSaunaCabin(){ const g=new THREE.Group(); g.add(box(1.68,1.3,1.55,mat.wood,true).positioned(0,.65,0)); for(let x=-.5;x<=.5;x+=.5) g.add(box(.04,1.2,.04,mat.dark,true).positioned(x,.66,-.79)); g.add(box(.55,.9,.045,mat.glass,true).positioned(0,.58,-.79)); g.add(box(1.2,.18,.38,mat.wood,true).positioned(0,.25,.35)); return g; }
function makeSteamRoom(){ const g=new THREE.Group(); g.add(box(1.58,1.28,1.58,mat.glass,true).positioned(0,.64,0)); g.add(box(.48,.22,.48,mat.stone,true).positioned(-.45,.11,.35)); for(let i=0;i<4;i++) g.add(cylinder(.04,.04,.35,mat.water).positioned(.3+i*.08,.55,.45)); return g; }
function makeShowerPod(){ const g=new THREE.Group(); g.add(cylinder(.24,.24,.08,mat.stone).positioned(0,.04,0)); g.add(cylinder(.025,.025,1.08,mat.metal).positioned(0,.54,.18)); g.add(cylinder(.13,.13,.045,mat.metal).positioned(0,1.08,.15)); g.add(box(.42,1.0,.035,mat.glass,true).positioned(0,.5,-.22)); return g; }
function makeTreatmentBed(){ const g=new THREE.Group(); g.add(box(.7,.22,1.38,mat.wall,true).positioned(0,.11,0)); g.add(box(.38,.14,.28,mat.green,true).positioned(0,.29,-.43)); g.add(cylinder(.05,.05,.75,mat.gold).positioned(-.45,.38,.45)); g.add(box(.22,.1,.22,mat.gold,true).positioned(-.45,.77,.45)); return g; }
function makePlanter(){ const g=new THREE.Group(); g.add(cylinder(.24,.3,.35,mat.wood).positioned(0,.17,0)); for(let i=0;i<9;i++) g.add(box(.12,.42,.04,mat.green,true).rotated(.45,i*.7,0).positioned(Math.cos(i)*.18,.45+Math.random()*.08,Math.sin(i)*.18)); return g; }
function makeWaterFeature(){ const g=new THREE.Group(); g.add(cylinder(.88,.92,.24,mat.stone).positioned(0,.12,0)); g.add(cylinder(.58,.58,.08,mat.water).positioned(0,.29,0)); g.add(cylinder(.08,.1,.65,mat.stone).positioned(0,.55,0)); g.add(cylinder(.32,.02,.42,mat.water).positioned(0,.9,0)); return g; }
function makeWallArt(){ const g=new THREE.Group(); g.add(box(.76,.78,.045,mat.gold,true).positioned(0,.39,0)); g.add(box(.58,.52,.05,mat.blue,true).positioned(0,.39,-.03)); g.add(box(.22,.2,.055,mat.pink,true).positioned(-.12,.46,-.06)); return g; }
function makeTowelStand(){ const g=new THREE.Group(); g.add(cylinder(.04,.04,.92,mat.metal).positioned(0,.46,0)); g.add(box(.64,.04,.08,mat.metal,true).positioned(0,.86,0)); for(let i=0;i<4;i++) g.add(box(.58,.075,.22,[mat.teal,mat.blue,mat.pink,mat.gold][i],true).positioned(0,.2+i*.16,0)); return g; }
function makePlantWall(){ const g=new THREE.Group(); g.add(box(1.6,1.28,.1,mat.green,true).positioned(0,.64,0)); for(let i=0;i<12;i++) g.add(box(.16,.18,.05,i%2?mat.grass:mat.green,true).positioned(-.64+(i%4)*.42,.28+Math.floor(i/4)*.32,-.08)); g.add(box(1.7,.06,.12,mat.wood,true).positioned(0,1.32,0)); return g; }

function addItemDetail(g,type){
  const tag=box(.34,.055,.08,mat.gold,true).positioned(0,.04,.44); g.add(tag);
  if(['classMirror','wallArt','plantWall'].includes(type)){ g.add(box(.08,.12,.08,mat.metal,true).positioned(-.42,.08,.02)); g.add(box(.08,.12,.08,mat.metal,true).positioned(.42,.08,.02)); }
}
function groundGroup(g){
  g.updateMatrixWorld(true);
  const box3=new THREE.Box3().setFromObject(g);
  if(!Number.isFinite(box3.min.y)) return;
  const dy=-box3.min.y;
  g.children.forEach(ch=>ch.position.y+=dy);
}

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
  const mesh=makeVisitor(); const wp=tileToWorld(start.x,start.z); mesh.position.set(wp.x,.155,wp.z); groups.people.add(mesh); state.visitors.push({id:nextVisitorId++,mesh,targetId:target.id,path,pathIndex:0,speed:1.65+Math.random()*.7,spend:0,leaving:false,using:false,useTime:2.6+Math.random()*2.0});
}
function makeVisitor(){
  const g=new THREE.Group();
  const shirt=[mat.teal,mat.blue,mat.gold,mat.pink,mat.purple][Math.floor(Math.random()*5)];
  const body=cylinder(.15,.18,.48,shirt).positioned(0,.42,0); g.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.14,18,18),mat.wall); head.position.y=.75; head.castShadow=true; g.add(head);
  const armL=cylinder(.035,.04,.45,mat.wall).positioned(-.19,.46,0); const armR=cylinder(.035,.04,.45,mat.wall).positioned(.19,.46,0); g.add(armL,armR);
  const legL=cylinder(.045,.045,.42,mat.dark).positioned(-.07,.17,0); const legR=cylinder(.045,.045,.42,mat.dark).positioned(.07,.17,0); g.add(legL,legR);
  const sh=new THREE.Mesh(new THREE.CircleGeometry(.28,24),mat.shadow); sh.rotation.x=-Math.PI/2; sh.position.y=.015; g.add(sh);
  g.userData.parts={body,head,armL,armR,legL,legR};
  return g;
}
function updateVisitors(dt){
  for(const v of [...state.visitors]){
    if(v.using){ updateVisitorUse(v,dt); continue; }
    const targetCell=v.path[v.pathIndex];
    if(!targetCell){ if(v.leaving) removeVisitor(v); else v.using=true; continue; }
    const dest=tileToWorld(targetCell.x,targetCell.z); const dir=new THREE.Vector3(dest.x-v.mesh.position.x,0,dest.z-v.mesh.position.z); const dist=dir.length();
    if(dist>.08){
      resetVisitorPose(v);
      dir.normalize(); v.mesh.position.addScaledVector(dir,v.speed*dt); v.mesh.rotation.y=Math.atan2(dir.x,dir.z); v.mesh.position.y=.155+Math.sin(performance.now()*.008+v.id)*.025;
    } else {
      v.pathIndex++;
      if(v.pathIndex>=v.path.length){
        if(v.leaving){ removeVisitor(v); continue; }
        v.using=true; v.spend=0; v.useTime=2.6+Math.random()*2.0;
      }
    }
  }
}
function updateVisitorUse(v,dt){
  const target=state.items.find(i=>i.id===v.targetId);
  if(!target){ removeVisitor(v); return; }
  const def=itemDef(target.type);
  poseVisitorUsing(v,target,def);
  v.spend+=dt;
  if(v.spend<v.useTime) return;
  let mult=.8+state.rating/100; if(['freeweights','cardio','studio'].includes(def.cat)) mult+=state.staff.instructor*.05; if(def.cat==='poolspa') mult+=state.staff.lifeguard*.04+state.staff.therapist*.05;
  state.cash+=Math.round(def.income*mult); target.visits++; target.condition=clamp(target.condition-(.35+Math.random()*.35)/(1+state.staff.cleaner*.25),35,100);
  v.using=false; resetVisitorPose(v);
  if(Math.random()<.42){ v.leaving=true; const start=entranceCell(); const cur=worldToTile(v.mesh.position); v.path=findPath(cur,start)||[cur,start]; v.pathIndex=0; }
  else { const choices=state.items.filter(i=>itemDef(i.type).capacity>0); const next=choices[Math.floor(Math.random()*choices.length)]; v.targetId=next.id; const cur=worldToTile(v.mesh.position); v.path=findPath(cur,nearestTargetCell(next))||[cur]; v.pathIndex=0; v.spend=0; }
}
function resetVisitorPose(v){
  const p=v.mesh.userData.parts; if(!p) return; const t=performance.now()*.006+v.id;
  v.mesh.scale.set(1,1,1); v.mesh.position.y=.155;
  p.body.rotation.set(0,0,0); p.head.rotation.set(0,0,0);
  p.armL.rotation.set(Math.sin(t)*.45,0,.18); p.armR.rotation.set(-Math.sin(t)*.45,0,-.18);
  p.legL.rotation.set(-Math.sin(t)*.35,0,0); p.legR.rotation.set(Math.sin(t)*.35,0,0);
}
function poseVisitorUsing(v,item,def){
  const p=v.mesh.userData.parts; if(!p) return; const t=performance.now()*.006+v.id;
  const itemCenter=tileToWorld(item.x,item.z,item.w,item.h); v.mesh.lookAt(itemCenter.x,v.mesh.position.y,itemCenter.z);
  v.mesh.position.y=.155;
  p.body.rotation.set(0,0,0); p.head.rotation.set(0,0,0);
  p.armL.rotation.set(0,0,.7); p.armR.rotation.set(0,0,-.7); p.legL.rotation.set(0,0,0); p.legR.rotation.set(0,0,0);
  if(def.cat==='cardio'){
    p.armL.rotation.x=Math.sin(t*2)*.65; p.armR.rotation.x=-Math.sin(t*2)*.65; p.legL.rotation.x=-Math.sin(t*2)*.75; p.legR.rotation.x=Math.sin(t*2)*.75; v.mesh.position.y=.155+Math.abs(Math.sin(t*2))*.025;
  } else if(def.cat==='freeweights'){
    p.armL.rotation.set(-1.15+Math.sin(t*1.8)*.25,0,.35); p.armR.rotation.set(-1.15+Math.sin(t*1.8)*.25,0,-.35); p.body.rotation.x=.1;
  } else if(def.cat==='studio'){
    v.mesh.scale.set(1.05,.72,1.05); p.armL.rotation.set(0,0,1.25); p.armR.rotation.set(0,0,-1.25); p.legL.rotation.set(.55,0,.25); p.legR.rotation.set(.55,0,-.25);
  } else if(def.cat==='poolspa' && item.type==='poolLane'){
    v.mesh.position.y=.24+Math.sin(t*2)*.015; v.mesh.scale.set(1.15,.55,1.15); p.armL.rotation.x=Math.sin(t*3)*1.1; p.armR.rotation.x=-Math.sin(t*3)*1.1;
  } else if(def.cat==='poolspa'){
    v.mesh.scale.set(1,.85,1); p.armL.rotation.set(0,0,.95); p.armR.rotation.set(0,0,-.95);
  } else if(def.cat==='clubhouse'){
    v.mesh.scale.set(1,.9,1); p.armL.rotation.set(-.55,0,.55); p.armR.rotation.set(-.45,0,-.55);
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
