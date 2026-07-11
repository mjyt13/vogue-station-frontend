import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'

// Gate for authenticated routes: waits out the session bootstrap, then either
// renders the routes or redirects to login.
export function RequireAuth() {
  const { status } = useAuth()
  if (status === 'loading') return <div className="auth-loading">Loading…</div>
  if (status === 'anonymous') return <Navigate to="/login" replace />
  return <Outlet />
}

// Inverse gate: keep logged-in users off the login/register pages, sending them
// to the editor (the authenticated home). Redirecting here — rather than each
// form navigating — avoids racing this guard on the status change.
export function PublicOnly() {
  const { status } = useAuth()
  if (status === 'loading') return <div className="auth-loading">Loading…</div>
  if (status === 'authenticated') return <Navigate to="/create" replace />
  return <Outlet />
}
