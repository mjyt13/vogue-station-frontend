import type { Axis, Kind, Transform } from './types'

// Config drives which sliders exist and their ranges. Adding a new group of
// controls later is a data change here, not new functions.
export const AXES: Axis[] = ['x', 'y', 'z']

export const GROUPS: { kind: Kind; min: number; max: number; step: number }[] = [
  { kind: 'position', min: -5, max: 5, step: 0.1 },
  { kind: 'rotation', min: -Math.PI, max: Math.PI, step: 0.01 },
]

export const INITIAL_TRANSFORM: Transform = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
}

// Uploaded models have unknown units/origin, so we normalize each on load to
// this world-space size (see Model.tsx).
export const TARGET_SIZE = 2

// The garment surface catalog (colors, patterns, scale) lives in
// features/wardrobe — the viewer only renders whatever GarmentMaterial it's given.
