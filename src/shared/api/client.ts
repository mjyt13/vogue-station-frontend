import createClient from 'openapi-fetch'
import type { paths } from './schema'
import { clearAccessToken, getAccessToken, setAccessToken } from './auth-token'

export const API_BASE_URL = import.meta.env.VITE_API_URL

const isAuthPath = (url: string) => new URL(url).pathname.startsWith('/auth/')

// --- "session ended" signal ------------------------------------------------
// When a refresh fails, the session is gone; the app (AuthProvider) subscribes
// here to drop the user back to the login screen.
const sessionEndedListeners = new Set<() => void>()
export const onSessionEnded = (cb: () => void) => {
  sessionEndedListeners.add(cb)
  return () => {
    sessionEndedListeners.delete(cb)
  }
}
const emitSessionEnded = () => sessionEndedListeners.forEach((cb) => cb())

// --- token refresh ---------------------------------------------------------
// A plain fetch (not the wrapped client) so it never recurses through the 401
// handler. Deduped so concurrent 401s trigger a single refresh.
let refreshInFlight: Promise<string | null> | null = null
function refreshAccessToken(): Promise<string | null> {
  refreshInFlight ??= fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then(async (res) => {
      if (!res.ok) return null
      const data = (await res.json()) as { accessToken?: string }
      const token = data.accessToken ?? null
      setAccessToken(token)
      return token
    })
    .catch(() => null)
    .finally(() => {
      refreshInFlight = null
    })
  return refreshInFlight
}

// Attaches the bearer token, and on a 401 (for non-/auth calls) refreshes once
// and retries. /auth/* calls rely on the httpOnly refresh cookie instead.
const authFetch: typeof fetch = async (input, init) => {
  const request = new Request(input, init)
  const isAuth = isAuthPath(request.url)

  const send = (token: string | null) => {
    const req = request.clone()
    if (token && !isAuth) req.headers.set('Authorization', `Bearer ${token}`)
    return fetch(req)
  }

  const res = await send(getAccessToken())
  if (res.status !== 401 || isAuth) return res

  const fresh = await refreshAccessToken()
  if (!fresh) {
    clearAccessToken()
    emitSessionEnded()
    return res
  }
  return send(fresh)
}

// The API singleton. Typed against the generated OpenAPI schema.
// credentials:'include' so /auth/* can set/send the refresh cookie.
export const api = createClient<paths>({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  fetch: authFetch,
})
