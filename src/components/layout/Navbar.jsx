import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSocket } from '../../socket/useSocket'
import useAuthStore from '../../store/authStore'
import useSessionStore from '../../store/sessionStore'
import clsx from 'clsx'

const NAV_LINKS = [
  { to: '/session',  label: 'Session'  },
  { to: '/training', label: 'Training' },
  { to: '/terminal', label: 'Terminal' },
]

const HIDE_NAV_ON = ['/', '/auth']
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { isConnected } = useSocket()
  const { connectedDevices } = useSessionStore()

  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const hideNav = HIDE_NAV_ON.includes(location.pathname)

  // Device drop notification: any dropped device
  const hasDroppedDevice = connectedDevices.some(d => d.status === 'dropped')

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <>
      {DEMO_MODE && (
        <div className="demo-banner px-4 py-1.5 text-center text-xs font-mono text-[#ffaa00]">
          ⚠ DEMO MODE — Mock data only. Connect real devices for actual training.
        </div>
      )}
      <nav
        className="sticky top-0 z-40 flex items-center justify-between px-6 transition-all duration-300"
        style={{
          height: 56,
          background: scrolled
            ? `rgba(${15},${8},${8}, 0.88)`
            : 'rgba(15,8,8,0.95)',
          backdropFilter: scrolled ? 'blur(12px)' : 'blur(6px)',
          borderBottom: '1px solid rgba(255,107,107,0.18)',
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-0 no-underline" style={{ textDecoration: 'none' }}>
          <span className="font-mono font-bold text-lg" style={{ color: '#ff6b6b' }}>IdleFL</span>
          <span className="font-mono font-bold text-lg blink ml-0.5" style={{ color: '#ff6b6b' }}>_</span>
        </Link>

        {/* Center nav */}
        {!hideNav && user && (
          <div className="flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => {
              const isActive = location.pathname === to
              const showDot = label === 'Session' && hasDroppedDevice
              return (
                <Link
                  key={to}
                  to={to}
                  className="relative px-3 py-1.5 text-xs font-mono rounded transition-all duration-150 no-underline"
                  style={{
                    background: isActive ? 'rgba(255,107,107,0.1)' : 'transparent',
                    color: isActive ? '#ff6b6b' : '#8a5555',
                    border: isActive ? '1px solid rgba(255,107,107,0.25)' : '1px solid transparent',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.background = 'rgba(255,107,107,0.05)' }}}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#8a5555'; e.currentTarget.style.background = 'transparent' }}}
                >
                  {label}
                  {showDot && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#ff4444] rounded-full border border-[#0f0808]" />
                  )}
                </Link>
              )
            })}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Socket dot */}
          <div className="flex items-center gap-1.5">
            <div
              className={clsx('w-2 h-2 rounded-full transition-all duration-500')}
              style={{
                background: isConnected ? '#ff6b6b' : '#555',
                boxShadow: isConnected ? '0 0 6px rgba(255,107,107,0.8)' : 'none',
                animation: isConnected ? 'pulse-dot 2s ease-in-out infinite' : 'none',
              }}
            />
            <span className="text-xs hidden sm:inline" style={{ color: isConnected ? '#8a5555' : '#444' }}>
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>

          {user && (
            <>
              <span className="text-xs hidden md:inline truncate max-w-[140px]" style={{ color: '#8a5555' }}>
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-mono transition-colors"
                style={{ color: '#8a5555' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ff4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#8a5555'}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  )
}
