# Vogue Station - Frontend

Web client for **Vogue Station**, a project where a user picks a garment
(shirts, t-shirts, and later skirts/pants), applies patterns and colors, and
previews the result on a 3D model / mannequin. See [docs/PLAN.md](docs/PLAN.md)
for the full product vision.

This repo is the frontend only. It is a pet project deliberately structured like
a larger codebase (feature folders, barrel/facade exports, config-driven UI) so
the workflow of building a real product can be practiced.

## Stack

- **React 19** + **TypeScript**
- **Vite** (dev server, build) with the React Compiler enabled
- **three.js** + **@react-three/fiber** for 3D rendering
- **ESLint** (typescript-eslint, react-hooks, react-refresh)

## Getting started

```sh
npm install
npm run dev       # start the dev server (HMR)
```

Other scripts:

```sh
npm run build     # type-check (tsc -b) + production build
npm run preview   # serve the production build locally
npm run lint      # run ESLint
```

Environment-specific constants belong in a `.env` file (copy `.env.example`).
The app talks to the `vogue-station-backend` API at `VITE_API_URL`
(default `http://localhost:3000`); see [docs/BACKEND_API.md](docs/BACKEND_API.md)
for running the backend and the auth/data flow. Regenerate the typed API client
after backend DTO changes with `npm run api:types`.

## The viewer

The viewer loads a `.glb` garment and lets you move and rotate it with sliders
for the X/Y/Z position and rotation axes, over a floor grid.

Because uploaded models have unknown units and origins, `Model.tsx` normalizes
each model on load: it measures the bounding box, recenters it on the origin,
and scales it to a consistent world size (`TARGET_SIZE`). This guarantees a model
is framed and visible regardless of how it was exported.

### Roadmap (frontend)

- Orbit/pan camera controls (drag to look around) alongside the sliders
- A visible light source and adjustable lighting
- Pattern and color selection panel
- Draggable/resizable viewer window
- Toggle between garment-only and clothed-mannequin views
- User and admin cabinets; i18n (planned post-MVP)
