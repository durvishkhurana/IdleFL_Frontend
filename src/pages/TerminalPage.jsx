import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import TerminalEmulator from '../components/terminal/TerminalEmulator'
import DeviceSelector from '../components/terminal/DeviceSelector'
import CommandHistory from '../components/terminal/CommandHistory'
import { useDevices } from '../hooks/useDevices'
import useSessionStore from '../store/sessionStore'
import socket from '../socket/socket'
import clsx from 'clsx'

export default function TerminalPage() {
  const { sessionId } = useSessionStore()
  const { devices } = useDevices()
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commandHistory, setCommandHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [latency, setLatency] = useState(null)
  const [wsConnected, setWsConnected] = useState(socket.connected)

  // Track WS state
  useEffect(() => {
    const onConnect = () => setWsConnected(true)
    const onDisconnect = () => setWsConnected(false)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    return () => { socket.off('connect', onConnect); socket.off('disconnect', onDisconnect) }
  }, [])

  const activeDevice = devices.find(d => d.deviceId === selectedDevice)

  const addToHistory = useCallback((cmd) => {
    setCommandHistory(prev => {
      const filtered = prev.filter(c => c !== cmd)
      return [...filtered.slice(-49), cmd]
    })
    setHistoryIndex(-1)
  }, [])

  if (!sessionId) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-center"
        style={{ background: 'var(--bg)' }}
      >
        <div>
          <div
            className="text-5xl font-mono font-bold mb-4"
            style={{ color: 'rgba(255,107,107,0.2)' }}
          >
            &gt;_
          </div>
          <h2 className="text-base font-bold text-white font-mono mb-2">No active session</h2>
          <p className="text-sm mb-6 font-mono" style={{ color: '#8a5555' }}>
            Start a session before accessing the terminal.
          </p>
          <Link
            to="/session"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-bold no-underline transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #cc3333 100%)',
              color: '#0f0808',
            }}
          >
            → Go to Session
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col"
      style={{ height: 'calc(100vh - 56px)', background: 'var(--bg)' }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-0 flex-shrink-0"
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid rgba(255,107,107,0.15)',
          height: 48,
          gap: 12,
        }}
      >
        {/* Terminal window chrome */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
        </div>

        <DeviceSelector devices={devices} selected={selectedDevice} onChange={setSelectedDevice} />

        <div className="flex items-center gap-2 ml-auto">
          {selectedDevice && (
            <button
              onClick={() => {
                // Ctrl+L equivalent: emit clear signal
                socket.emit('terminal:input', { deviceId: selectedDevice, data: '\x0c' })
              }}
              className="text-[10px] font-mono px-2 py-1 rounded border transition-colors"
              style={{ color: '#8a5555', borderColor: 'rgba(255,107,107,0.15)', background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#8a5555' }}
              title="Clear terminal (Ctrl+L)"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="text-[10px] font-mono px-2 py-1 rounded border transition-colors"
            style={{ color: '#8a5555', borderColor: 'rgba(255,107,107,0.15)', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#8a5555' }}
          >
            {sidebarOpen ? '→ History' : '← History'}
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Terminal */}
        <div className="flex-1 overflow-hidden p-2">
          {selectedDevice ? (
            <TerminalEmulator deviceId={selectedDevice} deviceName={activeDevice?.name} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div
                  className="text-6xl font-mono font-bold mb-4"
                  style={{ color: 'rgba(255,107,107,0.15)' }}
                >
                  &gt;_
                </div>
                <p className="text-xs font-mono" style={{ color: '#4a2a2a' }}>
                  Select a device to open terminal
                </p>
                <p className="text-[10px] mt-2 blink font-mono" style={{ color: 'rgba(255,107,107,0.3)' }}>█</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div
            className="w-60 flex-shrink-0"
            style={{
              borderLeft: '1px solid rgba(255,107,107,0.12)',
              background: 'var(--surface)',
            }}
          >
            <CommandHistory deviceId={selectedDevice} history={commandHistory} />
          </div>
        )}
      </div>

      {/* Status bar */}
      <div
        className="flex items-center justify-between px-4 py-1.5 flex-shrink-0 text-[10px] font-mono"
        style={{
          background: 'rgba(15,8,8,0.9)',
          borderTop: '1px solid rgba(255,107,107,0.08)',
        }}
      >
        <div className="flex items-center gap-3" style={{ color: '#8a5555' }}>
          <span>
            <span className={wsConnected ? 'text-[#ff6b6b]' : 'text-[#555]'}>
              {wsConnected ? '● WS Connected' : '○ WS Disconnected'}
            </span>
          </span>
          {activeDevice && (
            <>
              <span>·</span>
              <span style={{ color: '#ffe8e8' }}>{activeDevice.name || activeDevice.deviceId}</span>
              {activeDevice.latencyMs != null && (
                <>
                  <span>·</span>
                  <span style={{ color: activeDevice.latencyMs < 50 ? '#00ff88' : activeDevice.latencyMs < 150 ? '#ffaa00' : '#ff4444' }}>
                    {activeDevice.latencyMs}ms
                  </span>
                </>
              )}
            </>
          )}
        </div>
        <span style={{ color: '#4a2a2a' }}>
          Commands are whitelisted. No shell injection possible.
        </span>
      </div>
    </div>
  )
}
