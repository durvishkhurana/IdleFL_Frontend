import clsx from 'clsx'
import Badge from '../ui/Badge'
import { scoreDevice, getComputeLabel, getScoreColor } from '../../utils/deviceScoring'
import { formatScore } from '../../utils/formatters'

const OS_ICON = { windows: '🪟', mac: '🍎', linux: '🐧' }

function StatBar({ label, value = 0, color = '#ff6b6b' }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between" style={{ fontSize: 10, color: '#8a5555' }}>
        <span>{label}</span>
        <span style={{ color }}>{Math.round(value * 100)}%</span>
      </div>
      <div className="progress-bar" style={{ height: 4 }}>
        <div className="progress-bar-fill" style={{ width: `${value * 100}%`, background: color }} />
      </div>
    </div>
  )
}

/** SVG arc score indicator */
function ScoreArc({ score = 0, color = '#ff6b6b' }) {
  const r = 16
  const circ = 2 * Math.PI * r
  const dash = circ * Math.min(1, score)
  return (
    <svg width="40" height="40" viewBox="0 0 40 40">
      {/* Track */}
      <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
      {/* Progress */}
      <circle
        cx="20" cy="20" r={r}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 20 20)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="20" y="24" textAnchor="middle" fontSize="9" fill={color} fontFamily="JetBrains Mono">
        {Math.round(score * 100)}
      </text>
    </svg>
  )
}

function LatencyBadge({ ms }) {
  if (ms == null) return null
  const color = ms < 50 ? '#00ff88' : ms < 150 ? '#ffaa00' : '#ff4444'
  return (
    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ color, background: `${color}18`, border: `1px solid ${color}44` }}>
      {ms}ms
    </span>
  )
}

export default function DeviceCard({ device }) {
  const {
    deviceId, name, os = 'linux', status = 'idle',
    cpuUsage = 0, freeRamRatio = 0, gpuUsage, hasGpu = false,
    reliability = 1, latencyMs, gpuMemUsed, gpuMemTotal, shardSamples,
  } = device

  const score = scoreDevice(device)
  const scoreColorName = getScoreColor(score)
  const scoreColor = scoreColorName === 'green' ? '#00ff88' : scoreColorName === 'amber' ? '#ffaa00' : '#ff4444'
  const computeLabel = getComputeLabel(device)
  const isDropped  = status === 'dropped'
  const isTraining = status === 'training'
  const isActive   = status === 'active'
  const badgeVariant = { active: 'active', training: 'training', dropped: 'dropped', idle: 'idle' }[status] ?? 'idle'

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isTraining ? 'rgba(0,212,255,0.35)' : isActive ? 'rgba(255,107,107,0.25)' : isDropped ? 'rgba(255,68,68,0.2)' : 'var(--border)'}`,
        borderRadius: 8,
        padding: '14px',
        opacity: isDropped ? 0.6 : 1,
        boxShadow: isTraining ? '0 0 16px rgba(0,212,255,0.12)' : isActive ? '0 0 12px rgba(255,107,107,0.08)' : 'none',
        transition: 'all 0.3s ease',
        animation: isActive ? 'pulse-red 3s ease-in-out infinite' : 'none',
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base">{OS_ICON[os] || '💻'}</span>
          <span className="text-xs font-bold text-white font-mono truncate">{name || deviceId}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {latencyMs != null && <LatencyBadge ms={latencyMs} />}
          <Badge variant={badgeVariant} pulse={isTraining}>{status}</Badge>
        </div>
      </div>

      {/* Compute + Score arc */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={clsx(
            'inline-block px-2 py-0.5 text-[10px] font-bold font-mono uppercase rounded tracking-widest',
            computeLabel === 'CUDA' && 'compute-cuda',
            computeLabel === 'MPS'  && 'compute-mps',
            computeLabel === 'CPU'  && 'compute-cpu',
          )}
        >
          {computeLabel}
        </span>
        <ScoreArc score={score} color={scoreColor} />
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-1.5 mb-3">
        <StatBar label="CPU" value={cpuUsage} color="#ff6b6b" />
        <StatBar label="RAM" value={1 - freeRamRatio} color="#00d4ff" />
        {hasGpu && gpuUsage != null && <StatBar label="GPU" value={gpuUsage} color="#a78bfa" />}
      </div>

      {/* GPU memory if available */}
      {hasGpu && gpuMemTotal != null && (
        <div className="text-[10px] font-mono mb-2" style={{ color: '#8a5555' }}>
          VRAM: <span style={{ color: '#a78bfa' }}>{gpuMemUsed}GB</span> / {gpuMemTotal}GB
        </div>
      )}

      {/* Bottom: shard + reliability */}
      <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {shardSamples != null ? (
          <span className="text-[10px] font-mono" style={{ color: '#8a5555' }}>
            <span style={{ color: '#ff6b6b' }}>{shardSamples.toLocaleString()}</span> samples
          </span>
        ) : (
          <span />
        )}
        <span className="text-[10px] font-mono" style={{ color: '#8a5555' }}>
          rel: <span style={{ color: '#00ff88' }}>{Math.round(reliability * 100)}%</span>
        </span>
      </div>
    </div>
  )
}
