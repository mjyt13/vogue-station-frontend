import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './app/AppLayout'
import { LoginPage, PublicOnly, RegisterPage, RequireAuth } from './features/auth'
import { CreatePage } from './features/create'
import { LandingPage } from './features/landing'

// Route map: a public landing at "/", public-only auth pages, and the editor
// behind RequireAuth inside the app shell.
function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/create" element={<CreatePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
