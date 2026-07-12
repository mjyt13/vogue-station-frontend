import type { components } from './schema'

// Auth + /me response bodies aren't described in openapi.json, so hand-type them
// from the integration guide (docs/BACKEND_API.md).
export type Role = 'USER' | 'ADMIN'
export type User = {
  id: string
  email: string
  role: Role
  bio: unknown | null
  createdAt: string
}
export type AuthResponse = { user: User; accessToken: string }

// Convenience aliases for the schema-typed catalog responses.
export type ColorResponse = components['schemas']['ColorResponse']
export type PatternResponse = components['schemas']['PatternResponse']
export type ModelResponse = components['schemas']['ModelResponse']
export type ModelDetailResponse = components['schemas']['ModelDetailResponse']
export type LookResponse = components['schemas']['LookResponse']
export type CreateLookDto = components['schemas']['CreateLookDto']
export type GarmentMaterialDto = components['schemas']['GarmentMaterialDto']
