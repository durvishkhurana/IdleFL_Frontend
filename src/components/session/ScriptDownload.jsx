import { useState } from 'react'
import useAuthStore from '../../store/authStore'
import useSessionStore from '../../store/sessionStore'

export default function ScriptDownload({ userId }) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(null)
  const [error, setError] = useState(null)

  const token = useAuthStore((s) => s.token)
  const sessionCode = useSessionStore((s) => s.sessionCode)

  const uid = userId || '{YOUR_USER_ID}'
  const sid = sessionCode || 'FL-XXXX'

  const codeText = `USER_ID    = "${uid}"\nSESSION_ID = "${sid}"`

  const copyAll = () => {
    navigator.clipboard.writeText(codeText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const handleDownload = async (os) => {
    setDownloading(os)
    setError(null)
    try {
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/agent/script?os=${os}`
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = os === 'windows' ? 'idlefl_agent.py' : 'idlefl_agent.sh'
      a.click()
    } catch (err) {
      console.error('Script download failed:', err)
      setError('Failed to download script. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '16px',
      }}
    >
      <h3 className="text-xs font-bold text-white font-mono mb-1">Connect a Device</h3>
      <p className="text-xs mb-4" style={{ color: '#8a5555' }}>
        Download and run the agent script on each laptop.
      </p>

      {/* Download buttons */}
      <div className="flex gap-2 mb-4">
        {['windows', 'mac'].map(os => (
          <button
            key={os}
            onClick={() => handleDownload(os)}
            disabled={!!downloading}
            className="flex-1 text-xs font-mono py-1.5 rounded border transition-all duration-200 disabled:opacity-50"
            style={{
              color: '#ff6b6b',
              borderColor: 'rgba(255,107,107,0.3)',
              background: 'transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff6b6b'; e.currentTarget.style.background = 'rgba(255,107,107,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,107,107,0.3)'; e.currentTarget.style.background = 'transparent' }}
          >
            {os === 'windows' ? '🪟 Windows (.py)' : '🍎 Mac (.sh)'}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-xs mb-3 font-mono" style={{ color: '#ff4444' }}>
          {error}
        </p>
      )}

      {/* Code editor preview */}
      <div className="rounded overflow-hidden" style={{ border: '1px solid rgba(255,107,107,0.1)' }}>
        {/* Editor header */}
        <div
          className="flex items-center justify-between px-3 py-1.5"
          style={{ background: '#0a0404', borderBottom: '1px solid rgba(255,107,107,0.08)' }}
        >
          <span className="text-[10px] font-mono" style={{ color: '#8a5555' }}>agent_config.py</span>
          <button
            onClick={copyAll}
            className="text-[10px] font-mono transition-colors"
            style={{ color: copied ? '#00ff88' : '#8a5555' }}
          >
            {copied ? '✓ Copied' : 'Copy All'}
          </button>
        </div>
        {/* Code lines */}
        <div className="flex" style={{ background: '#0a0404' }}>
          {/* Line numbers */}
          <div className="flex flex-col items-end px-2 py-3" style={{ color: '#4a2a2a', fontSize: 11, fontFamily: 'JetBrains Mono', userSelect: 'none', borderRight: '1px solid rgba(255,107,107,0.06)' }}>
            <span>01</span>
            <span>02</span>
          </div>
          {/* Code */}
          <div className="py-3 px-3 flex flex-col gap-0.5" style={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}>
            <div>
              <span style={{ color: '#ff6b6b' }}>USER_ID</span>
              <span style={{ color: '#8a5555' }}>    = </span>
              <span style={{ color: '#00d4ff' }}>"{uid}"</span>
            </div>
            <div>
              <span style={{ color: '#ff6b6b' }}>SESSION_ID</span>
              <span style={{ color: '#8a5555' }}> = </span>
              <span style={{ color: '#00ff88' }}>"{sid}"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
