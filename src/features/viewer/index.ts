// Barrel / facade for the viewer feature: consumers import from here, not from
// individual files inside the folder.
export { Viewer } from './Viewer'
export { Model } from './Model'
export { DraggableLight } from './DraggableLight'
export { INITIAL_LIGHT_POS, INITIAL_TRANSFORM } from './config'
export type { CaptureFn } from './CapturePreview'
export type { Axis, GarmentMaterial, Kind, Transform, Vec3 } from './types'
