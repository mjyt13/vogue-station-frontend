import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { clearAccessToken, onSessionEnded } from '../../shared/api'
import type { User } from '../../shared/api'
import * as authApi from './api'
import { AuthContext } from './auth-context'
import type { AuthStatus } from './auth-context'

// Owns the session: bootstraps from the refresh cookie on mount, exposes
// login/register/logout, and drops to anonymous if a background refresh fails.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let active = true
    authApi.refreshSession().then((auth) => {
      if (!active) return
      if (auth) {
        setUser(auth.user)
        setStatus('authenticated')
      } else {
        setStatus('anonymous')
      }
    })
    return () => {
      active = false
    }
  }, [])

  // A failed refresh mid-session (from the API client) ends the session.
  useEffect(
    () =>
      onSessionEnded(() => {
        setUser(null)
        setStatus('anonymous')
      }),
    [],
  )

  const login = useCallback(async (email: string, password: string) => {
    const auth = await authApi.login(email, password)
    setUser(auth.user)
    setStatus('authenticated')
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const auth = await authApi.register(email, password)
    setUser(auth.user)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearAccessToken()
      setUser(null)
      setStatus('anonymous')
    }
  }, [])

  return (
    <AuthContext.Provider value={{ status, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
