import { useState } from 'react'
import useAuthStore from '../store/authStore'
import { loginUser, registerUser } from '../api/auth.api'

export function useAuth() {
  const { user, token, isAuthenticated, login, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const doLogin = async ({ email, password }) => {
    setLoading(true)
    setError(null)
    try {
      const res = await loginUser({ email, password })
      login(res.data.user, res.data.token)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  const doRegister = async ({ email, password }) => {
    setLoading(true)
    setError(null)
    try {
      const res = await registerUser({ email, password })
      login(res.data.user, res.data.token)
      return { success: true, data: res.data }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  return { user, token, isAuthenticated, login: doLogin, register: doRegister, logout, loading, error, clearError: () => setError(null) }
}
