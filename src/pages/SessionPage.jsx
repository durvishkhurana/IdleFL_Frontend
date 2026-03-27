import { useState, useEffect } from 'react'
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
import { DEMO_MODE, DEMO_DEVICES } from '../utils/demoMode'

export default function SessionPage() {
  const navigate = useNavigate()
  const { sessionId, setSession, addDevice } = useSessionStore()
  const { user } = useAuthStore()
  const { devices, hasMajorityCpuOnly, hasGpuDevice } = useDevices()
  useSocket()

  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [joinId, setJoinId] = useState('')
  const [error, setError] = useState(null)

  // Demo mode: inject mock devices
  useEffect(() => {
    if (DEMO_MODE && sessionId === 'FL-DEMO') {
      DEMO_DEVICES.forEach(d => addDevice(d))
    }
  }, [sessionId])

  // Simulate device stats random walk in demo mode
  useEffect(() => {
    if (!DEMO_MODE || !sessionId) return
    const { updateDevice } = useSessionStore.getState()
    const interval = setInterval(() => {
      DEMO_DEVICES.forEach(d => {
        updateDevice(d.deviceId, {
          cpuUsage:     Math.max(0.05, Math.min(0.95, (d.cpuUsage || 0.3) + (Math.random() - 0.5) * 0.08)),
          freeRamRatio: Math.max(0.1,  Math.min(0.9,  (d.freeRamRatio || 0.5) + (Math.random() - 0.5) * 0.04)),
          gpuUsage:     d.hasGpu ? Math.max(0.1, Math.min(0.95, (d.gpuUsage || 0.4) + (Math.random() - 0.5) * 0.06)) : null,
        })
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [sessionId])

  const handleCreate = async () => {
    setCreating(true)
    setError(null)
    try {
      const res = await createSession()
      setSession(res.data.sessionId || res.data.id)
    } catch {
      const mockId = DEMO_MODE ? 'FL-DEMO' : `FL-${Math.random().toString(36).slice(2,6).toUpperCase()}`
      setSession(mockId)
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = async () => {
    if (!joinId.trim()) return
    setJoining(true)
    setError(null)
    try {
      await joinSession(joinId.trim())
      setSession(joinId.trim())
    } catch {
      setSession(joinId.trim())
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
          <span style={{ color: '#ff6b6b' }}>{sessionId}</span>
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
          <ScriptDownload sessionId={sessionId} userId={user?.userId || user?.id} />
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
