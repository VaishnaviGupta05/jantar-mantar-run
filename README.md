# Jantar Mantar Run

Jantar Mantar Run is a premium 3D endless runner inspired by Indian urban motion, lane-based dodging, and chase-pressure gameplay. The project is built with Vite, TypeScript, and Three.js and is designed to run in the browser without external asset downloads.

## Features

- Three-lane endless runner gameplay
- Procedural Three.js environment with city-road visuals
- Original runner selection system
- Chase pressure and stamina loop
- Reporter safe zones and collectible pickups
- Local save system with resilient defaults
- Mobile-friendly touch controls and keyboard input
- Responsive UI screens and procedural fallback assets

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production build

```bash
npm run build
```

## Test

```bash
npm test
```

## Controls

- Move left: Left Arrow or A
- Move right: Right Arrow or D
- Jump: Space, W, or Up Arrow
- Slide: S or Down Arrow
- Pause: Escape or P
- Mobile: swipe gestures

## Project structure

```text
src/
  __tests__/
  core/
  game/
  main.ts
  styles.css
  types.ts
public/
  assets/
```

## Save system behavior

- Saves best score, collector progress, selected runner, and settings in localStorage
- Restores defaults safely on corrupted or missing data
- Keeps offline play intact by avoiding any required backend

## Notes

This project intentionally uses procedural geometry and synthesized audio so it remains functional even without premium external art or sound assets.
