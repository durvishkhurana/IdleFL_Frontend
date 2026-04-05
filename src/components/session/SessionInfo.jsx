import { useState } from 'react'
import useSessionStore from '../../store/sessionStore'
import useAuthStore from '../../store/authStore'
import Badge from '../ui/Badge'

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-[#555] uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono font-bold text-[#e0e0e0] tracking-widest">{value}</span>
        <button
          onClick={copy}
          className="text-xs font-mono px-2 py-0.5 rounded border transition-all duration-200"
          style={{
            color: copied ? '#00ff88' : '#666',
            borderColor: copied ? 'rgba(0,255,136,0.4)' : 'rgba(102,102,102,0.3)',
            background: copied ? 'rgba(0,255,136,0.1)' : 'transparent',
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

export default function SessionInfo() {
  const sessionCode = useSessionStore((s) => s.sessionCode)
  const { sessionStatus, connectedDevices } = useSessionStore()
  const { user } = useAuthStore()

  const activeCount = connectedDevices.filter((d) => d.status !== 'dropped').length

  const statusVariant = {
    idle: 'idle', active: 'active', training: 'training', complete: 'success'
  }[sessionStatus] || 'idle'

  return (
    <div className="bg-[#111118] border border-[rgba(0,255,136,0.15)] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white font-mono">Session Info</h3>
        <Badge variant={statusVariant}>{sessionStatus}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <CopyField label="Session Code" value={sessionCode || '—'} />
        {user?.userId && <CopyField label="User ID" value={user.userId} />}
        {user?.email && <CopyField label="Email" value={user.email} />}

        <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.05)] pt-3">
          <span className="text-xs text-[#555]">Connected Devices</span>
          <span className="text-lg font-bold font-mono text-[#00ff88]">{activeCount}</span>
        </div>
      </div>
    </div>
  )
}
