# Leisure Club Tycoon 3D Builder v8

A browser-based blank-canvas 3D leisure club tycoon prototype.

## v8 additions

- Members now require **Access Gates** before using the club.
- Access gates queue members one-by-one, open as they pass, and flash green.
- Route/debug tools:
  - show access paths
  - show blocked tiles
  - object reachability in the inspector
- Improved build catalogue:
  - compact tabs
  - search bar
  - outdoor section
- Inspector upgrade:
  - condition
  - visits
  - income estimate
  - footprint
  - reachability
  - focus selected
  - sell selected
- Exterior frontage upgrades:
  - road trees no longer spawn on roads
  - animated cars drive past
  - improved car models
- Reception/cafe additions:
  - membership kiosk
  - logo feature wall
  - cafe table set
  - barista station
  - retail display wall
- Pool/spa additions:
  - small spa pool
  - family pool
  - hydro pool
  - large lap pool
  - improved pool lane visuals
- Outdoor additions:
  - padel court
  - tennis court
  - sun bed pair
  - parasol table
  - outdoor hot tub
  - garden yoga deck
  - outdoor lounge
  - fire pit seating
  - bike rack
  - outdoor shower

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL Vite shows.

## Build

```bash
npm run build
```

## Controls

- Left mouse drag: rotate camera
- Right mouse drag: pan camera
- WASD: move around
- Shift + WASD: move faster
- Mouse wheel: zoom
- R: rotate selected item
- Q/Esc: deselect
- B: bulldoze
- Paths button: show access routes
- Blocked button: show blocked tiles

## Important gameplay note

For members to properly use the club, place an entrance/door and an **Access Gates** object near the entrance. Members will arrive, queue through the gate, trigger the green access flash, and then route to the equipment.
