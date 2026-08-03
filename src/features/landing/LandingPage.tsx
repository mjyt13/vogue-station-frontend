import { Link } from 'react-router-dom'
import previewUrl from '../../assets/preview.png'
import { useAuth } from '../auth'
import './landing.css'

// Public entry point. Shows a preview of the editor and sends visitors
// straight into it — signing up only comes up when they try to save.
export function LandingPage() {
  const { status, logout } = useAuth()
  const authed = status === 'authenticated'

  return (
    <div className="landing">
      <header className="landing-header">
        <span className="landing-brand">Vogue Station</span>
        <nav className="landing-actions">
          {authed ? (
            <>
              <Link className="btn btn--primary" to="/create">
                Open editor
              </Link>
              <button type="button" className="btn" onClick={() => logout()}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="btn" to="/login">
                Log in
              </Link>
              <Link className="btn btn--primary" to="/create">
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <h1>Design your garment in 3D</h1>
          <p>
            Pick colors and patterns and preview them live on a 3D model. Save your looks and come
            back to refine them anytime.
          </p>
          <Link className="btn btn--primary btn--lg" to="/create">
            {authed ? 'Open editor' : 'Start creating'}
          </Link>
        </div>
        <img
          className="landing-preview"
          src={previewUrl}
          alt="The Vogue Station editor: a 3D t-shirt with color, pattern, and transform controls"
        />
      </section>
    </div>
  )
}
