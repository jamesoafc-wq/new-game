# Leisure Club Tycoon 3D

A lightweight browser-based 3D leisure-club tycoon prototype built with Vite and Three.js.

## This version

This is the blank-canvas builder version. It moves away from pre-made room blocks and gives the player more customisation:

- Large plot with town surroundings, roads, paths, grass, trees and facade buildings.
- Expandable starter plot inside a larger future site.
- Floor tiles are placed separately from equipment.
- Walls, doors and windows snap to grid edges rather than tile centres.
- Around 20 floor options, including gym rubber, turf, pool tile, spa stone, studio floor, cafe terrazzo and premium carpet.
- Wall options, window options and door options.
- Individual placeable equipment for free weights, cardio, studio, clubhouse, pool/spa and decor.
- Free weights is now made from individual items such as dumbbell rack, bench press, squat rack, cable machine, leg press and plate tree.
- Better visitor pathfinding using grid routes and wall/door passability.
- Staff hiring: receptionist, cleaner, instructor, lifeguard and therapist.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL Vite prints in the terminal.

## Build

```bash
npm run build
```

## Controls

- Left mouse drag: rotate camera
- Right mouse drag: pan camera
- Mouse wheel: zoom
- Click build cards to select items
- Click the same selected card again to deselect
- Q or Esc: deselect
- R: rotate selected item
- B: bulldoze mode
- Walls, doors and windows place on grid edges
- Floors and equipment place on tile cells

## GitHub Pages

The included workflow deploys the built `dist` folder to GitHub Pages using GitHub Actions.


## v7 update

- Sleeker compact UI layout.
- Double doors now span two grid edges.
- Door panels are taller and better fitted to frames.
- Doors animate open/closed when members pass nearby.
- Arched doorway rebuilt with a true curved arch.
