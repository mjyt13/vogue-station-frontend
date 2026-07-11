import { api, clearAccessToken, setAccessToken } from '../../shared/api'
import type { AuthResponse } from '../../shared/api'

// Auth endpoints aren't schematized (empty response bodies in openapi.json), so
// we cast the parsed JSON to the hand-typed AuthResponse. Each call that yields a
// session stores the access token in the API singleton's memory.

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data, error } = await api.POST('/auth/login', { body: { email, password } })
  if (error || !data) throw error ?? new Error('Login failed')
  const auth = data as unknown as AuthResponse
  setAccessToken(auth.accessToken)
  return auth
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  const { data, error } = await api.POST('/auth/register', { body: { email, password } })
  if (error || !data) throw error ?? new Error('Registration failed')
  const auth = data as unknown as AuthResponse
  setAccessToken(auth.accessToken)
  return auth
}

// Restore a session from the refresh cookie on app load. Null when there's no
// valid session (so the app shows the login screen).
//
// Deduped: the refresh token is single-use (rotated every call), and StrictMode
// double-invokes the bootstrap effect — without this, the second call would
// reuse the already-rotated cookie and fail, dropping a valid session.
let refreshInFlight: Promise<AuthResponse | null> | null = null
export function refreshSession(): Promise<AuthResponse | null> {
  refreshInFlight ??= doRefresh().finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

async function doRefresh(): Promise<AuthResponse | null> {
  const { data, error } = await api.POST('/auth/refresh', {})
  if (error || !data) return null
  const auth = data as unknown as AuthResponse
  setAccessToken(auth.accessToken)
  return auth
}

export async function logout(): Promise<void> {
  await api.POST('/auth/logout', {})
  clearAccessToken()
}
