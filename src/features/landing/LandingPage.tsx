import { Link } from 'react-router-dom'
import previewUrl from '../../assets/landing/viewport.png'
import { useAuth } from '../auth'
import './landing.css'
import { StudioNotes } from './StudioNotes'

// Public entry point. Shows a preview of the editor and sends visitors
// straight into it — signing up only comes up when they try to save.
export function LandingPage() {
  const { status, logout } = useAuth()
  const authed = status === 'authenticated'

  return (
    <div className="landing">
      <header className="landing-header">
        <Link to="/" className="landing-brand">
          Vogue Station
        </Link>
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

      <main>
        <section className="landing-hero">
          <div className="landing-copy">
            <h1>Design your garment in 3D</h1>
            <p>
              Pick colors and patterns and preview them live on a 3D model. Save your looks and
              come back to refine them anytime.
            </p>
            <Link className="btn btn--primary btn--lg" to="/create">
              {authed ? 'Open editor' : 'Start creating'}
            </Link>
          </div>
          <div className="landing-plate">
            <figure>
              <img
                className="landing-preview"
                src={previewUrl}
                alt="The Vogue Station editor: a 3D t-shirt with color, pattern, and transform controls"
              />
            </figure>
          </div>
        </section>

        <section className="landing-features">
          <div className="feature">
            <span className="feature__index">01</span>
            <h3>Design</h3>
            <p>
              Swap the model, color, and pattern and watch the 3D preview update in place — no
              reload, no waiting.
            </p>
          </div>
          <div className="feature">
            <span className="feature__index">02</span>
            <h3>Save to your cabinet</h3>
            <p>
              Every look you build is saved to your cabinet, ready to reopen and refine whenever
              you come back.
            </p>
          </div>
          <div className="feature">
            <span className="feature__index">03</span>
            <h3>Publish to the gallery</h3>
            <p>
              Submit a look for approval and, once it clears moderation, it's live for anyone to
              browse.
            </p>
          </div>
        </section>

        <StudioNotes />

        <section className="landing-closing">
          <h2>Your next look starts on a blank model.</h2>
          <Link className="btn btn--primary btn--lg" to="/create">
            Start creating
          </Link>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <span className="landing-brand">Vogue Station</span>
          <span>Design, save, publish.</span>
        </div>
      </footer>
    </div>
  )
}
