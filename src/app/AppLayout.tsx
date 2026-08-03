import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth'
import './AppLayout.css'

// Shell for the app: brand + nav + current user / logout, then the routed
// page below. /create is reachable while anonymous, so the nav and account
// controls adapt to whether a session is present.
export function AppLayout() {
  const { status, user, logout } = useAuth()
  const authed = status === 'authenticated'
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="app-brand">
          Vogue Station
        </Link>
        <nav className="app-nav">
          <NavLink to="/create">Create</NavLink>
          {authed && <NavLink to="/gallery">Gallery</NavLink>}
          {authed && <NavLink to="/cabinet">Cabinet</NavLink>}
          {user?.role === 'ADMIN' && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <div className="app-user">
          {authed ? (
            <>
              <span className="app-user__email">{user?.email}</span>
              <button type="button" className="app-user__logout" onClick={() => logout()}>
                Log out
              </button>
            </>
          ) : (
            <Link className="btn" to="/login">
              Log in
            </Link>
          )}
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
