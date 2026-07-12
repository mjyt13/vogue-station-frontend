// Barrel / facade for the API singleton. Consumers import from here.
export { api, API_BASE_URL, onSessionEnded } from './client'
export { getAccessToken, setAccessToken, clearAccessToken } from './auth-token'
export { getApiErrorMessage } from './errors'
export type {
  AuthResponse,
  ColorResponse,
  CreateLookDto,
  GarmentMaterialDto,
  LookResponse,
  ModelDetailResponse,
  ModelResponse,
  PatternResponse,
  Role,
  User,
} from './types'
