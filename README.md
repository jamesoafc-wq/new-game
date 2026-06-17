# Leisure Club Tycoon 3D Builder

A browser-based 3D leisure club tycoon prototype focused on blank-canvas building.

## What this version adds

- Starter plot is pinned to the front road side so the entrance can stay at the front.
- Expansion grows sideways and backwards, not in front of the club.
- Larger surrounding town plot with roads, paths, grass, trees, facade buildings, cars and street furniture.
- Walls, doors and windows snap to grid edges.
- Slim glass wall option that is thinner than solid walls.
- More window variety, including taller, full-height, frosted, pool-viewing and clerestory windows.
- Seamless floor tiles with no visible gaps between each tile.
- Equipment no longer includes built-in floor pads.
- More detailed equipment models.
- Equipment is grounded to the floor so objects should no longer float.
- Visitors no longer disappear when using items; they pause and animate/pose at cardio, weights, studio, pool/spa and clubhouse objects.
- Staff hiring and better pathfinding retained.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL Vite prints, usually `http://localhost:5173/`.

## Build

```bash
npm run build
```

## Controls

- Left drag: rotate camera
- Right drag: pan camera
- Mouse wheel: zoom
- Click a build card, then click the plot to place it
- Walls, doors and windows place on grid edges
- R: rotate selected equipment
- B: bulldoze mode
- Q / Esc: deselect
- Save/load uses browser localStorage
