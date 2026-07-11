// Barrel / facade for the wardrobe feature: the color/pattern catalog, its
// data hooks, and the pickers. Produces color/pattern/scale selections for the
// viewer to render.
export { Wardrobe } from './Wardrobe'
export type { WardrobeColor, WardrobePattern } from './Wardrobe'
export { useColors, usePatterns } from './api'
export { PATTERN_SCALE } from './config'
