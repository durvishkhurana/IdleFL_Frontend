import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/layout/ProtectedRoute'
import LandingPage  from './pages/LandingPage'
import AuthPage     from './pages/AuthPage'
import SessionPage  from './pages/SessionPage'
import TrainingPage from './pages/TrainingPage'
import TerminalPage from './pages/TerminalPage'
import { useLocation } from 'react-router-dom'

const HIDE_NAVBAR = ['/', '/auth']

function AppLayout({ children }) {
  const location = useLocation()
  const hideNav = HIDE_NAVBAR.includes(location.pathname)
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      {!hideNav && <Navbar />}
      {children}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout><LandingPage /></AppLayout>} />
        <Route path="/auth" element={<AppLayout><AuthPage /></AppLayout>} />
        <Route
          path="/session"
          element={
            <AppLayout>
              <ProtectedRoute>
                <SessionPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/training"
          element={
            <AppLayout>
              <ProtectedRoute>
                <TrainingPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/terminal"
          element={
            <AppLayout>
              <ProtectedRoute requiresSession>
                <TerminalPage />
              </ProtectedRoute>
            </AppLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
