import { useEffect, useRef, useState } from 'react'

const LOG_LINES = [
  { device: 'coordinator', text: 'session FL-4829 initialized' },
  { device: 'coordinator', text: 'waiting for devices...' },
  { device: 'agent_0', text: 'device:register — WINDOWS-01 · CUDA · GPU' },
  { device: 'coordinator', text: 'agent_0 registered · compute: CUDA · score: 0.91' },
  { device: 'agent_1', text: 'device:register — MACBOOK-02 · MPS · Apple Silicon' },
  { device: 'coordinator', text: 'agent_1 registered · compute: MPS · score: 0.84' },
  { device: 'agent_2', text: 'device:register — LINUX-03 · CPU · x86' },
  { device: 'coordinator', text: 'agent_2 registered · compute: CPU · score: 0.67' },
  { device: 'coordinator', text: 'scoring devices... WINDOWS-01 ranked #1' },
  { device: 'coordinator', text: 'partitioning dataset → 3 shards' },
  { device: 'coordinator', text: 'shard_0 → WINDOWS-01 (40%) · shard_1 → MACBOOK-02 (35%) · shard_2 → LINUX-03 (25%)' },
  { device: 'coordinator', text: 'round 1 started · broadcasting task to 3 devices' },
  { device: 'agent_0', text: 'received shard_0 · 400 rows · starting training' },
  { device: 'agent_1', text: 'received shard_1 · 350 rows · starting training' },
  { device: 'agent_2', text: 'received shard_2 · 250 rows · starting training' },
  { device: 'agent_0', text: 'epoch 1/5 · batch 32 · lr 0.01 · CUDA active' },
  { device: 'agent_1', text: 'epoch 1/5 · batch 32 · lr 0.01 · MPS active' },
  { device: 'agent_2', text: 'epoch 1/5 · batch 32 · lr 0.01 · CPU active' },
  { device: 'coordinator', text: 'heartbeat received · WINDOWS-01 ✓ · MACBOOK-02 ✓ · LINUX-03 ✓' },
  { device: 'agent_0', text: 'training complete · weights_ready · loss: 0.6201 · size: ~3KB' },
  { device: 'agent_1', text: 'training complete · weights_ready · loss: 0.6389 · size: ~3KB' },
  { device: 'agent_2', text: 'training complete · weights_ready · loss: 0.6598 · size: ~3KB' },
  { device: 'coordinator', text: 'all 3 updates received · running FedAvg aggregation' },
  { device: 'coordinator', text: 'W_global = (0.40)·W_0 + (0.35)·W_1 + (0.25)·W_2' },
  { device: 'coordinator', text: 'round 1 complete · global loss: 0.6305 · broadcasting global model' },
  { device: 'agent_0', text: 'global model received · ready for round 2' },
  { device: 'agent_1', text: 'global model received · ready for round 2' },
  { device: 'agent_2', text: 'global model received · ready for round 2' },
  { device: 'coordinator', text: 'round 2 started · broadcasting task to 3 devices' },
  { device: 'agent_0', text: 'training shard_0 · loss: 0.5974 · CUDA active' },
  { device: 'agent_1', text: 'training shard_1 · loss: 0.6102 · MPS active' },
  { device: 'agent_2', text: 'training shard_2 · loss: 0.6301 · CPU active' },
  { device: 'coordinator', text: 'heartbeat received · WINDOWS-01 ✓ · MACBOOK-02 ✓ · LINUX-03 ✓' },
  { device: 'agent_0', text: 'weights_ready · loss: 0.5974 · size: ~3KB' },
  { device: 'agent_1', text: 'weights_ready · loss: 0.6102 · size: ~3KB' },
  { device: 'agent_2', text: 'weights_ready · loss: 0.6301 · size: ~3KB' },
  { device: 'coordinator', text: 'FedAvg complete · global loss: 0.5887 · round 2 complete' },
  { device: 'coordinator', text: 'loss trending down · 0.6305 → 0.5887 · convergence nominal' },
]

const getLineColor = (device) => {
  if (device === 'coordinator') return '#ff6b6b'
  if (device === 'agent_0') return '#00ff88'
  if (device === 'agent_1') return '#00d4ff'
  if (device === 'agent_2') return '#ffaa00'
  return '#ffe8e8'
}

const getLinePrefix = (device) => {
  if (device === 'coordinator') return '[coordinator]'
  if (device === 'agent_0') return '[WINDOWS-01]'
  if (device === 'agent_1') return '[MACBOOK-02]'
  if (device === 'agent_2') return '[LINUX-03]'
  return '[unknown]'
}

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600) % 24
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const MAX_VISIBLE = 8
const START_SECONDS = 14 * 3600 + 32 * 60 + 8

export default function CoordinatorLog({ className = '' }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    let disposed = false
    let count = 0

    const nextDelay = () => Math.floor(Math.random() * 500) + 900

    const tick = () => {
      if (disposed) return
      timerRef.current = window.setTimeout(() => {
        if (disposed) return
        count += 1
        if (count <= LOG_LINES.length) {
          setVisibleCount(count)
          tick()
        }
        else {
          timerRef.current = window.setTimeout(() => {
            if (disposed) return
            count = 0
            setVisibleCount(0)
            timerRef.current = window.setTimeout(() => {
              if (disposed) return
              tick()
            }, nextDelay())
          }, nextDelay())
        }
      }, nextDelay())
    }

    tick()

    return () => {
      disposed = true
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const shown =
    visibleCount === 0 ? [] : LOG_LINES.slice(Math.max(0, visibleCount - MAX_VISIBLE), visibleCount)

  return (
    <div
      className={`rounded-lg overflow-hidden font-mono text-[11px] leading-snug select-none w-full ${className}`}
      style={{
        background: '#080404',
        border: '1px solid rgba(255,107,107,0.35)',
        boxShadow: '0 0 28px rgba(255,107,107,0.06)',
        maxWidth: 520,
      }}
    >
      <div
        className="px-3 py-2 border-b text-[10px] uppercase tracking-wider"
        style={{
          borderColor: 'rgba(255,107,107,0.18)',
          background: 'rgba(255,107,107,0.04)',
          color: 'rgba(255,107,107,0.55)',
        }}
      >
        Coordinator stream
      </div>
      <div className="px-3 py-3 min-h-[380px] flex flex-col justify-end gap-0.5">
        <div className="flex flex-col gap-0.5 overflow-hidden">
          {shown.map((entry, i) => {
            const globalIdx = visibleCount - shown.length + i
            const ts = formatTime(START_SECONDS + globalIdx)
            const prefix = getLinePrefix(entry.device)
            return (
              <div key={`${globalIdx}-${entry.text.slice(0, 40)}`} className="flex gap-2 font-mono">
                <span className="shrink-0 tabular-nums w-[52px]" style={{ color: '#8a5555' }}>
                  {ts}
                </span>
                <span className="min-w-0">
                  <span style={{ color: getLineColor(entry.device) }}>{prefix}</span>
                  <span style={{ color: '#ffe8e8' }}>{` ${entry.text}`}</span>
                </span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-1 mt-2 pt-1 border-t font-mono" style={{ borderColor: 'rgba(255,107,107,0.08)' }}>
          <span style={{ color: '#ff6b6b' }}>{'>'}</span>
          <span className="blink" style={{ color: '#ff6b6b' }}>
            _
          </span>
        </div>
      </div>
    </div>
  )
}
