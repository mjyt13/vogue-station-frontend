// PNG (raster) tiles, rasterized from the .svg sources next to them. Raster
// uploads to WebGL reliably (SVG textures are flaky) and matches the eventual
// backend/S3 image URLs.
import checks from '../../assets/patterns/checks.png?url'
import dots from '../../assets/patterns/dots.png?url'
import grid from '../../assets/patterns/grid.png?url'
import stripes from '../../assets/patterns/stripes.png?url'
import type { GarmentMaterial } from '../viewer'

// Preset garment colors. A full RGB/HSV picker is postponed; these are the
// "usual" swatches shown in the dropdown. { name } is for the a11y label/title.
export const COLOR_PRESETS: { name: string; value: string }[] = [
  { name: 'White', value: '#f5f5f5' },
  { name: 'Black', value: '#1c1c1c' },
  { name: 'Gray', value: '#8a8f98' },
  { name: 'Red', value: '#d63a3a' },
  { name: 'Orange', value: '#e08a2b' },
  { name: 'Yellow', value: '#e6c72e' },
  { name: 'Green', value: '#3a9d54' },
  { name: 'Teal', value: '#2ba39b' },
  { name: 'Blue', value: '#3a6ed6' },
  { name: 'Navy', value: '#2a3a6b' },
  { name: 'Purple', value: '#8a3ad6' },
  { name: 'Pink', value: '#d63a9d' },
]

// Demo patterns. url = null is the plain "None" option. Real patterns will
// later come from the backend/S3 as image URLs — the shape stays the same.
export const PATTERN_PRESETS: { name: string; url: string | null }[] = [
  { name: 'None', url: null },
  { name: 'Stripes', url: stripes },
  { name: 'Dots', url: dots },
  { name: 'Checks', url: checks },
  { name: 'Grid', url: grid },
]

// How many times a pattern tile repeats across one UV unit (the pattern-scale
// slider's range). At 1 a single tile covers most of the garment (large
// "splashy" motifs); higher = a finer all-over print.
export const PATTERN_SCALE = { min: 1, max: 12, step: 1, default: 4 }

export const INITIAL_MATERIAL: GarmentMaterial = {
  color: COLOR_PRESETS[0].value,
  patternUrl: null,
  patternScale: PATTERN_SCALE.default,
}
