import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth'
import './AppLayout.css'

// Shell for authenticated pages: brand + nav + current user / logout, then the
// routed page below.
export function AppLayout() {
  const { user, logout } = useAuth()
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="app-brand">
          Vogue Station
        </Link>
        <nav className="app-nav">
          <NavLink to="/create">Create</NavLink>
          <NavLink to="/gallery">Gallery</NavLink>
          <NavLink to="/cabinet">Cabinet</NavLink>
          {user?.role === 'ADMIN' && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <div className="app-user">
          {user && <span className="app-user__email">{user.email}</span>}
          <button type="button" className="app-user__logout" onClick={() => logout()}>
            Log out
          </button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
