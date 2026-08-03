import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './app/AppLayout'
import { AdminPage } from './features/admin'
import { LoginPage, PublicOnly, RegisterPage, RequireAdmin, RequireAuth } from './features/auth'
import { CabinetPage } from './features/cabinet'
import { CreatePage } from './features/create'
import { GalleryPage } from './features/gallery'
import { LandingPage } from './features/landing'

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
        <Route path="/create" element={<CreatePage />} />
        <Route element={<RequireAuth />}>
          <Route path="/cabinet" element={<CabinetPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
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
