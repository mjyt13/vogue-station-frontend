export type Vec3 = { x: number; y: number; z: number }
export type Transform = { position: Vec3; rotation: Vec3 }
export type Kind = keyof Transform // 'position' | 'rotation'
export type Axis = keyof Vec3 // 'x' | 'y' | 'z'

// What the user chooses for the garment surface. `patternUrl` is null for a
// plain (color-only) garment; `patternScale` is how many times the tile repeats
// across a UV unit. Final surface color is pattern-image × color.
export type GarmentMaterial = {
  color: string
  patternUrl: string | null
  patternScale: number
}
