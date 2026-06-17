# Leisure Club Tycoon 3D

A one-shot starter prototype for a browser-based 3D leisure club tycoon.

You start with an empty premium wellness-club shell and build facilities such as reception, cardio, weights, wellness studio, pool, sauna, changing rooms, juice bar, spa rooms and decor. Members visit facilities, spend money, affect cleanliness and drive the club rating. The plot can be expanded and the game saves locally in the browser.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Build for GitHub Pages

```bash
npm run build
```

The static output will be in `dist/`.

## Controls

- Left drag: rotate camera
- Right drag: pan camera
- Mouse wheel / trackpad: zoom
- Click build cards: choose a facility
- Click grid: place selected facility
- R: rotate blueprint
- B: bulldoze mode
- Escape: cancel current mode
- Save / Load: browser localStorage

## Current gameplay systems

- 3D grid-based building placement
- Facility footprints, costs, capacities, upkeep and appeal
- Unlocks based on reputation and supporting facilities
- Procedural 3D facility models with no image/model assets
- Visitor spawning, facility use and spending
- Cash, members, rating, reputation, day/time simulation
- Cleanliness and condition decay/recovery
- Plot expansion
- Objectives
- Local browser save/load
- Responsive HUD for desktop and mobile-sized screens

## Why this is asset-light

Everything is generated from simple Three.js geometry. There are no large textures, models, audio files or binary assets yet, which keeps the repository small and easy to push.

## Suggested next steps

1. Split the single `main.js` into modules: `state`, `facilities`, `simulation`, `ui`, `rendering`.
2. Add walls/floors placement as build modes, not just facility blocks.
3. Add staff: cleaners, receptionists, instructors, lifeguards, spa therapists.
4. Add member types: casual, bodybuilder, swimmer, senior, luxury spa guest, student, corporate.
5. Add queueing/pathfinding rather than direct walking.
6. Add loans, rent, monthly bills and marketing campaigns.
7. Add a room-zoning system so facilities must sit inside proper rooms.
8. Add quality levels/upgrades for every facility.
9. Add sound, ambient music and small UI animations.
10. Add importable glTF props later, only when needed.
