import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import useSessionStore from '../../store/sessionStore'

export default function ProtectedRoute({ children, requiresSession = false }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const sessionId = useSessionStore((s) => s.sessionId)

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  if (requiresSession && !sessionId) {
    return <Navigate to="/session" replace />
  }

  return children
}
