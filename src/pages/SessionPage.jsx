import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import SessionInfo from '../components/session/SessionInfo'
import ScriptDownload from '../components/session/ScriptDownload'
import WarningBanner from '../components/session/WarningBanner'
import DeviceCard from '../components/session/DeviceCard'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useDevices } from '../hooks/useDevices'
import { useSocket } from '../socket/useSocket'
import useSessionStore from '../store/sessionStore'
import useAuthStore from '../store/authStore'
import { createSession, joinSession } from '../api/session.api'

export default function SessionPage() {
  const navigate = useNavigate()
  const { sessionId, sessionCode, setSession } = useSessionStore()
  const { user } = useAuthStore()
  const { devices, hasMajorityCpuOnly, hasGpuDevice } = useDevices()
  useSocket()

  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [joinId, setJoinId] = useState('')
  const [error, setError] = useState(null)
  const [createdSessionId, setCreatedSessionId] = useState(null)
  const [copied, setCopied] = useState(false)

  const copySessionId = (id) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleCreate = async () => {
    setCreating(true)
    setError(null)
    try {
      const res = await createSession()
      const newCode = res.data.session.sessionCode
      const dbSessionId = res.data.session.id
      setCreatedSessionId(newCode)
      // Auto-join: no need for the user to manually enter and submit
      try { await joinSession(newCode) } catch { /* best-effort */ }
      setSession(dbSessionId, newCode)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create session')
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = async () => {
    if (!joinId.trim()) return
    setJoining(true)
    setError(null)
    try {
      const res = await joinSession(joinId.trim())
      const realSessionId = res?.data?.session?.id ?? joinId.trim()
      const code = res?.data?.session?.sessionCode ?? joinId.trim()
      setSession(realSessionId, code)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to join session')
    } finally {
      setJoining(false)
    }
  }

  /* ── No session yet ───────────────────────────────────────── */
  if (!sessionId) {
    return (
      <PageWrapper title="Session">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-full max-w-md fade-in">
            <div
              className="rounded-lg p-8"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: '0 0 30px rgba(255,107,107,0.05)',
              }}
            >
              <h2 className="text-base font-bold text-white font-mono mb-6">
                Start a Federated Session
              </h2>

              <Button variant="primary" className="w-full mb-5" loading={creating} onClick={handleCreate}>
                + Create New Session
              </Button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <span className="text-xs font-mono" style={{ color: '#8a5555' }}>or</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>

              <div className="flex flex-col gap-3">
                <Input
                  label="Join Existing Session"
                  placeholder="FL-XXXX"
                  value={joinId}
                  onChange={e => setJoinId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                />
                <Button variant="secondary" className="w-full" loading={joining} onClick={handleJoin}>
                  Join Session →
                </Button>
              </div>

              {error && <p className="text-xs mt-3 font-mono" style={{ color: '#ff4444' }}>{error}</p>}
            </div>
          </div>
        </div>
      </PageWrapper>
    )
  }

  /* ── Session active ────────────────────────────────────────── */
  const activeDevices = devices.filter(d => d.status !== 'dropped')

  return (
    <PageWrapper title="Session">
      {hasMajorityCpuOnly && <WarningBanner variant="majority-cpu" />}

      {/* Session Created — persistent ID display for the creator */}
      {createdSessionId && (
        <div
          className="rounded-lg px-5 py-4 mb-4 fade-in"
          style={{
            background: 'rgba(255,107,107,0.08)',
            border: '1px solid rgba(255,107,107,0.35)',
            boxShadow: '0 0 24px rgba(255,107,107,0.08)',
          }}
        >
          <p className="text-xs font-mono mb-2" style={{ color: '#8a5555', letterSpacing: '0.08em' }}>
            SESSION CREATED — share this code with friends
          </p>
          <div className="flex items-center gap-3">
            <span
              className="font-mono font-bold tracking-widest select-all"
              style={{ fontSize: '1.75rem', color: '#ff6b6b', letterSpacing: '0.15em' }}
            >
              {createdSessionId}
            </span>
            <button
              onClick={() => copySessionId(createdSessionId)}
              className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-mono transition-all"
              style={{
                background: copied ? 'rgba(0,255,136,0.12)' : 'rgba(255,107,107,0.12)',
                border: `1px solid ${copied ? 'rgba(0,255,136,0.4)' : 'rgba(255,107,107,0.3)'}`,
                color: copied ? '#00ff88' : '#ff6b6b',
                cursor: 'pointer',
              }}
            >
              {copied ? '✓ Copied' : '⧉ Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Session Active Banner */}
      <div
        className="flex items-center gap-3 rounded-lg px-4 py-3 mb-5"
        style={{
          background: 'rgba(255,107,107,0.06)',
          border: '1px solid rgba(255,107,107,0.2)',
        }}
      >
        <span className="status-dot-active flex-shrink-0" />
        <span className="text-sm font-mono" style={{ color: '#ffe8e8' }}>
          <span style={{ color: '#ff6b6b' }}>{sessionCode || sessionId}</span>
          {' · '}
          <span>{activeDevices.length} device{activeDevices.length !== 1 ? 's' : ''}</span>
          {' · '}
          <span style={{ color: hasGpuDevice ? '#00ff88' : '#ffaa00' }}>
            {hasGpuDevice ? 'Ready to train' : 'No GPU detected'}
          </span>
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column */}
        <div className="w-full lg:w-[40%] flex flex-col gap-4">
          <SessionInfo />
          <ScriptDownload userId={user?.userId || user?.id} />
        </div>

        {/* Right column: device grid */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white font-mono">
              Connected Devices
              <span className="ml-2" style={{ color: '#ff6b6b' }}>({activeDevices.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger">
            {devices.map(d => <DeviceCard key={d.deviceId} device={d} />)}

            {/* Waiting placeholder */}
            <div
              className="dashed-animated rounded-lg flex flex-col items-center justify-center py-8 text-center"
              style={{ minHeight: 120 }}
            >
              <span className="text-2xl mb-2">+</span>
              <p className="text-xs font-mono" style={{ color: '#8a5555' }}>Waiting for next device...</p>
              <p className="text-[10px] font-mono mt-1" style={{ color: '#4a2a2a' }}>Run the script on any laptop</p>
            </div>
          </div>
        </div>
      </div>

      {/* Start Training CTA */}
      <div className="mt-8 flex justify-end">
        <div className="flex items-center gap-3">
          {!hasGpuDevice && activeDevices.length > 0 && (
            <span className="text-xs font-mono" style={{ color: '#ffaa00' }}>⚠ No GPU device</span>
          )}
          <Button
            variant="primary"
            size="lg"
            disabled={activeDevices.length === 0}
            onClick={() => navigate('/training')}
          >
            Start Training →
          </Button>
        </div>
      </div>
    </PageWrapper>
  )
}
