import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

function CopyBox({ value }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div
      className="flex items-center gap-3 rounded border px-3 py-2"
      style={{ background: 'rgba(255,107,107,0.05)', borderColor: 'rgba(255,107,107,0.3)' }}
    >
      <span className="flex-1 text-sm font-mono tracking-widest break-all" style={{ color: '#ff6b6b' }}>{value}</span>
      <button
        onClick={copy}
        className="text-xs font-mono transition-colors"
        style={{ color: '#8a5555' }}
        onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
        onMouseLeave={e => e.currentTarget.style.color = '#8a5555'}
      >
        {copied ? '✓' : 'Copy'}
      </button>
    </div>
  )
}

export default function AuthPage() {
  const navigate = useNavigate()
  const { login, register, loading, error } = useAuth()

  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [userId, setUserId] = useState(null)
  const [localError, setLocalError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)

    if (mode === 'register' && password !== confirm) {
      setLocalError('Passwords do not match.')
      return
    }

    if (mode === 'login') {
      const res = await login({ email, password })
      if (res.success) navigate('/session')
    } else {
      const res = await register({ email, password })
      if (res.success) {
        const uid = res.data?.user?.userId || res.data?.user?.id
        if (uid) {
          setUserId(uid)
        } else {
          navigate('/session')
        }
      }
    }
  }

  const displayError = localError || error

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-md fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-1 no-underline">
            <span className="font-bold text-2xl font-mono" style={{ color: '#ff6b6b' }}>IdleFL</span>
            <span className="font-bold text-2xl font-mono blink" style={{ color: '#ff6b6b' }}>_</span>
          </Link>
          <p className="text-xs mt-2 font-mono" style={{ color: '#4a2a2a' }}>Distributed Federated Learning</p>
        </div>

        <div
          className="rounded-lg p-8"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 0 40px rgba(255,107,107,0.06)' }}
        >
          {/* Tab toggle */}
          <div className="flex mb-6 rounded border overflow-hidden" style={{ borderColor: 'rgba(255,107,107,0.2)' }}>
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setLocalError(null); setUserId(null) }}
                className="flex-1 py-2 text-xs font-mono capitalize transition-all duration-200"
                style={{
                  background: mode === m ? 'rgba(255,107,107,0.1)' : 'transparent',
                  color: mode === m ? '#ff6b6b' : '#8a5555',
                  borderRight: m === 'login' ? '1px solid rgba(255,107,107,0.15)' : 'none',
                }}
              >
                {m === 'login' ? '→ Login' : '+ Register'}
              </button>
            ))}
          </div>

          {/* User ID display after register */}
          {userId ? (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <div className="text-2xl mb-2">✅</div>
                <h2 className="text-sm font-bold text-white font-mono">Account Created!</h2>
                <p className="text-xs text-[#555] mt-1">Save your User ID — devices need it to identify you.</p>
              </div>
              <div>
                <label className="text-xs text-[#555] uppercase tracking-widest block mb-1">Your User ID</label>
                <CopyBox value={userId} />
              </div>
              <p className="text-xs text-[#ffaa00] font-mono text-center">
                ⚠ Save this — it's how devices identify you.
              </p>
              <Button variant="primary" onClick={() => navigate('/session')} className="w-full">
                Continue to Session →
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              {mode === 'register' && (
                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              )}

              {displayError && (
                <div className="text-xs text-[#ff4444] font-mono border border-[rgba(255,68,68,0.2)] bg-[rgba(255,68,68,0.05)] rounded px-3 py-2">
                  {displayError}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full mt-2"
              >
                {mode === 'login' ? 'Login →' : 'Create Account →'}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs mt-4 font-mono" style={{ color: '#4a2a2a' }}>
          <Link to="/" className="no-underline transition-colors" style={{ color: '#8a5555' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
            onMouseLeave={e => e.currentTarget.style.color = '#8a5555'}
          >← Back to home</Link>
        </p>
      </div>
    </div>
  )
}
