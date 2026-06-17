# Leisure Club Tycoon 3D - Design Notes v8

## Current direction

The game is moving from a simple facility placer into a true blank-canvas 3D leisure club builder. Players create the shell, floors, walls, doors, windows, reception, gym areas, pool/spa areas, cafe spaces and outdoor leisure areas themselves.

## Core v8 focus

### Access-first member flow

Members must now pass through access gates before using any object. The gate is not just decorative:

1. Member arrives from the road/front entrance.
2. Member routes to an access gate.
3. Members queue one-by-one.
4. Gate paddles open.
5. A green scanner flash/glow plays.
6. Member routes to their chosen item.

This makes the entrance, reception and access design matter.

### Path/debug visibility

The player can turn on:

- Paths overlay
- Blocked tile overlay
- Inspector reachability check

This helps test layouts and understand why members cannot reach equipment.

### More customisation

The build catalogue now supports search and a broader item list. Equipment does not include built-in floors. Players place floors separately and then build zones from individual objects.

## New item priorities

### Reception / Cafe

- Reception desk
- Access gates
- Membership kiosk
- Logo wall
- Cafe counter
- Barista station
- Cafe tables
- Retail wall

### Pool / Spa

- Small spa pool
- Family pool
- Pool lane
- Large lap pool
- Hydro pool
- Sauna
- Steam room
- Shower pod
- Treatment bed

### Outdoor

- Padel court
- Tennis court
- Sun beds
- Parasol table
- Outdoor hot tub
- Garden yoga deck
- Outdoor lounge
- Fire pit seating
- Bike rack
- Outdoor shower

## Next design targets

- Room zoning and automatic room detection
- Dynamic complaints/reviews
- Queues for specific equipment, not just access gates
- More detailed staff behaviour
- Outdoor landscaping tools
- Multi-floor building support
