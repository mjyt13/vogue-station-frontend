export type Vec3 = { x: number; y: number; z: number }
export type Transform = { position: Vec3; rotation: Vec3 }
export type Kind = keyof Transform // 'position' | 'rotation'
export type Axis = keyof Vec3 // 'x' | 'y' | 'z'
