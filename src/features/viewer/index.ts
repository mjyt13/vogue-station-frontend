// Barrel / facade for the viewer feature: consumers import from here, not from
// individual files inside the folder.
export { Viewer } from './Viewer'
export { Model } from './Model'
export { INITIAL_TRANSFORM } from './config'
export type { Axis, GarmentMaterial, Kind, Transform, Vec3 } from './types'
