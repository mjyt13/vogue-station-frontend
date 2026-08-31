import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './app/AppLayout'
import { AdminPage } from './features/admin'
import { LoginPage, PublicOnly, RegisterPage, RequireAdmin, RequireAuth } from './features/auth'
import { CabinetPage } from './features/cabinet'
// Imported from its own file, not the barrel: the barrel re-exports
// GalleryLookPage too, and any static import of it would pull that (and
// three.js with it) back into the main chunk despite the dynamic import below.
import { GalleryPage } from './features/gallery/GalleryPage'
import { LandingPage } from './features/landing'

// These two pull in three.js/@react-three/fiber (the bulk of the bundle) —
// worth code-splitting since most routes never touch the 3D viewer.
const CreatePage = lazy(() =>
  import('./features/create').then((m) => ({ default: m.CreatePage })),
)
// Imported from its own file, not the barrel: the barrel is also imported
// statically (for GalleryPage) in this same file, which would defeat the
// dynamic import and pull three.js back into the main chunk.
const GalleryLookPage = lazy(() =>
  import('./features/gallery/GalleryLookPage').then((m) => ({
    default: m.GalleryLookPage,
  })),
)

// Route map: a public landing at "/", public-only auth pages, the editor open
// to everyone (saving there is what prompts registration), and the rest of
// the app shell behind RequireAuth.
function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route
          path="/create"
          element={
            <Suspense fallback={<div className="auth-loading">Loading…</div>}>
              <CreatePage />
            </Suspense>
          }
        />
        <Route element={<RequireAuth />}>
          <Route path="/cabinet" element={<CabinetPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route
            path="/gallery/:lookId"
            element={
              <Suspense fallback={<div className="auth-loading">Loading…</div>}>
                <GalleryLookPage />
              </Suspense>
            }
          />
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
