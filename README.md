# Leisure Club Tycoon 3D Builder

A browser-based 3D leisure-club tycoon prototype using Vite + Three.js.

This version is focused on a proper blank-canvas builder:

- Large plot with small-town surroundings
- Starter plot pinned to the road/front entrance side
- Expansions grow sideways and backwards
- Tile-by-tile floor placement
- Walls, doors and windows snap to grid edges
- Individual gym/leisure/spa objects instead of pre-made room blocks
- Staff hiring
- Visitor pathfinding around walls, doors and objects
- Visitor use poses/animations linked to object type
- WASD camera movement plus OrbitControls

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL Vite prints.

## Build

```bash
npm run build
```

## Controls

- Left drag: rotate camera
- Right drag: pan camera
- Mouse wheel: zoom
- WASD: move camera around the plot
- Shift + WASD: move faster
- R: rotate selected object
- Q / Esc: deselect
- B: bulldoze mode
- Click build cards to choose floors, edge pieces or objects
- Walls, doors and windows place on grid edges
- Objects and floors place in grid cells

## Notes

This is still a prototype. The aim is to move the game away from pre-made facility blocks and towards true leisure club customisation: the player lays flooring, draws rooms, places windows/doors, and designs detailed gym, spa, pool and clubhouse areas from individual pieces.
