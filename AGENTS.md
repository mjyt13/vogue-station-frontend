# CLAUDE.md

Guidance for working in this repo. See [docs/PLAN.md](docs/PLAN.md) for the
product vision and [README.md](README.md) for setup.

## What this is

Frontend for **Vogue Station**: a user picks a garment (t-shirts now; shirts,
skirts, pants later), applies **patterns and colors**, and previews it on a 3D
model / mannequin. Pet project deliberately built like a larger codebase to
practice real-product architecture. This repo is the **frontend only**; a Node.js
backend (RBAC, auth, S3 model links) and Postgres + S3/MinIO storage are planned.

## Stack

React 19 + TypeScript, Vite (React Compiler enabled), three.js +
@react-three/fiber for 3D. No @react-three/drei yet — helpers (grid, orbit
controls, texture loading) are done with plain three or hand-rolled. Adding drei
is reasonable if the hand-rolled surface grows.

## Commands

```sh
npm run dev       # dev server with HMR
npm run build     # tsc -b + vite build
npm run preview   # serve production build
npm run lint      # eslint
```

Type-check with `npx tsc -b`. Always leave `tsc -b` and `eslint src` clean.

## Architecture conventions

- **Feature folders** under `src/features/<name>/` with a **barrel** `index.ts`.
  Import a feature via its barrel (`from './features/viewer'`), never from a file
  deep inside it. Barrel = facade (a pattern PLAN.md calls for).
- **Shared primitives** in `src/shared/` are domain-agnostic (e.g. `AxisSlider`
  just reports a number via `onChange` — it knows nothing about x/y/z).
- **Config-driven UI over duplication.** The 6 transform sliders are generated
  from `GROUPS × AXES` in `viewer/config.ts` with one `AxisSlider` and one
  `setAxis` handler. Adding a control group is a data change, not new functions.
  Prefer this style: one generic component + config, not N near-copies.
- **Backend-linked constants live in `.env`** (none needed yet locally).
- Patterns valued in this project: singleton (API client), facade (barrels),
  and factory-style creation on the backend. Don't over-engineer, but lean
  toward these when a seam appears.

## Structure

```
src/
  App.tsx              shell — composes wardrobe + viewer, owns material state
  main.tsx             React entry
  shared/              domain-agnostic UI primitives
    controls.tsx       AxisSlider (generic range input)
    SwatchPicker.tsx   hover/focus swatch dropdown (color or image)
    Toggle.tsx         generic on/off switch
  features/viewer/     3D garment viewer (renders a GarmentMaterial it's given)
    index.ts           barrel (exports Viewer + GarmentMaterial type)
    Viewer.tsx         owns transform + scene-option state; Canvas + camera
    Model.tsx          loads a GLB, normalizes it, applies color/pattern
    TransformPanel.tsx position/rotation sliders
    UVMap.tsx          2D UV-unwrap preview
    config.ts          slider groups/ranges, TARGET_SIZE
    types.ts           Vec3 / Transform / Kind / Axis / GarmentMaterial
  features/wardrobe/   color + pattern catalog and its pickers
    index.ts           barrel (exports Wardrobe + INITIAL_MATERIAL)
    Wardrobe.tsx       color/pattern SwatchPickers + scale slider
    config.ts          COLOR_PRESETS, PATTERN_PRESETS, PATTERN_SCALE
  assets/
    tshirt.glb         current test model (~11 MB)
    patterns/*.png     demo pattern tiles (+ .svg sources)
```

**Feature dependencies:** `App` composes both. `wardrobe → viewer` (imports the
`GarmentMaterial` render-contract from viewer's barrel); the viewer never depends
on the wardrobe — it just renders whatever material App hands it. No cycle.

## 3D / rendering notes

- **Model normalization (Model.tsx):** GLBs have unknown units/origin, so on load
  we measure the bounding box, recenter on origin, and scale to `TARGET_SIZE`.
  This is why a model is always framed. Keep this when swapping to lighter
  production models — just change the URL.
- **`useLoader` caches by URL.** Mutating a loaded material/scene in place leaks
  across instances and remounts. To apply per-instance color/pattern, **clone the
  scene and its materials** first, then mutate the clone.
- **The tshirt.glb material:** 4 meshes share **1 material**; all meshes have
  `TEXCOORD_0` (UVs) — so texturing works out of the box. The material ships with
  `metalness: 0.77` which is wrong for cloth; force `metalness ≈ 0`,
  `roughness ≈ 0.8–1.0` so colors/patterns read correctly.
- **Color vs pattern:** final base color is `map × color`. Color = `material.color`
  (baseColorFactor); pattern = an image → `THREE.Texture` → `material.map` with
  `colorSpace = SRGBColorSpace` and `RepeatWrapping`/`repeat` for tiling. Full-color
  prints keep color white; grayscale patterns are tinted by color.
- **Patterns are raster PNGs** (`assets/patterns/*.png`, rasterized from the `.svg`
  sources beside them). SVG-as-texture is flaky (WebGL upload); PNG matches the
  eventual S3 image URLs. Config in `viewer/config.ts` (`PATTERN_PRESETS`).
- **Tile scale matters.** The tshirt UVs make one tile cover the whole garment at
  `repeat = 1` (splashy). `material.patternScale` (a live slider, range in
  `PATTERN_SCALE`) sets tiling density; patterns use `anisotropy = 16` to stay crisp.
- **Camera:** drei `OrbitControls` (drag to orbit) alongside the position/rotation
  sliders — they're complementary (controls move the camera, sliders the model).
- **UVMap.tsx** draws the unwrap to a 2D canvas (pattern `multiply` color) as a
  live preview. It subsamples the wireframe — the mesh has ~370k triangles.

## Testing / verification

`playwright` is a devDependency (Chromium installed) for visually verifying the
3D output — WebGL renders headlessly via SwiftShader
(`--use-gl=angle --use-angle=swiftshader`). Handy for screenshotting a change or
probing live material/texture state. Not wired into CI yet.

## Roadmap (near-term frontend)

- Material system: per-instance color + pattern on `Model` — **done** (color
  swatches + PNG pattern presets, `map × color`, UV preview).
- `features/wardrobe/` — **done** (color + pattern catalog, pickers, scale slider).
- Orbit controls + scene toggles (pan / auto-frame via drei `Bounds` / visible
  light sphere) — **done**. Pending: adjustable lighting, better ground/shadows.
- Next for wardrobe: pattern gallery + colors/patterns from the backend/S3;
  user uploads; saved looks.
- Then: patterns/colors sourced from backend/S3 URLs; user/admin cabinets; i18n.
```
