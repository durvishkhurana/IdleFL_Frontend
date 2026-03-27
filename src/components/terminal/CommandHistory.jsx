import { useState } from 'react'
import { formatTimestamp } from '../../utils/formatters'
import socket from '../../socket/socket'
import Button from '../ui/Button'

export default function CommandHistory({ deviceId, history = [], onHistoryUpdate }) {
  const [localHistory, setLocalHistory] = useState(history)

  const addCommand = (cmd) => {
    const entry = { cmd, ts: Date.now() }
    setLocalHistory((prev) => [...prev.slice(-19), entry])
    if (onHistoryUpdate) onHistoryUpdate(entry)
  }

  const resend = (cmd) => {
    if (!deviceId) return
    socket.emit('terminal:input', { deviceId, data: cmd + '\r' })
  }

  const clear = () => setLocalHistory([])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(0,255,136,0.1)]">
        <span className="text-xs font-mono text-[#555] uppercase tracking-widest">History</span>
        <button onClick={clear} className="text-xs text-[#444] hover:text-[#ff4444] font-mono transition-colors">
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {localHistory.length === 0 ? (
          <div className="p-3 text-xs text-[#333] font-mono italic">No commands yet</div>
        ) : (
          [...localHistory].reverse().map((entry, i) => (
            <button
              key={i}
              onClick={() => resend(entry.cmd)}
              className="w-full text-left px-3 py-2 border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(0,255,136,0.04)] transition-colors"
            >
              <div className="text-xs text-[#444] font-mono mb-0.5">{formatTimestamp(entry.ts)}</div>
              <div className="text-xs text-[#999] font-mono truncate">{entry.cmd}</div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
