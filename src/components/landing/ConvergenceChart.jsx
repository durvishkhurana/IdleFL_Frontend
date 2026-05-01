import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const LOSS = [
  0.6412, 0.6412, 0.5974, 0.5974, 0.5611, 0.5611, 0.5191, 0.5191, 0.4917, 0.4917, 0.4676, 0.4676,
  0.4471, 0.4471, 0.4295, 0.4295, 0.4146, 0.4146, 0.4019, 0.4019,
]

const ACC = [
  0.88, 0.88, 0.869, 0.869, 0.869, 0.869, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.896, 0.896, 0.895, 0.895,
  0.899, 0.899, 0.899, 0.899,
]

const W = 492
const H = 240
const PAD_L = 44
const PAD_R = 88
const PAD_T = 28
const PAD_B = 36
const GW = W - PAD_L - PAD_R
const GH = H - PAD_T - PAD_B

const LOSS_MIN = 0.38
const LOSS_MAX = 0.66
const ACC_MIN = 0.865
const ACC_MAX = 0.905

function buildPoints(values, vmin, vmax, invertY = true) {
  const n = values.length
  return values.map((v, i) => {
    const x = PAD_L + (n === 1 ? 0 : (i / (n - 1)) * GW)
    const t = (v - vmin) / (vmax - vmin)
    const y = invertY ? PAD_T + (1 - t) * GH : PAD_T + t * GH
    return { x, y }
  })
}

function pathD(points) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
}

export default function ConvergenceChart({ className = '' }) {
  const rootRef = useRef(null)
  const lossPathRef = useRef(null)
  const accPathRef = useRef(null)
  const [drawn, setDrawn] = useState(false)
  const [showLabels, setShowLabels] = useState(false)
  const [lossLen, setLossLen] = useState(0)
  const [accLen, setAccLen] = useState(0)

  const lossPts = buildPoints(LOSS, LOSS_MIN, LOSS_MAX)
  const accPts = buildPoints(ACC, ACC_MIN, ACC_MAX)

  useLayoutEffect(() => {
    const lossEl = lossPathRef.current
    const accEl = accPathRef.current
    if (lossEl) setLossLen(lossEl.getTotalLength())
    if (accEl) setAccLen(accEl.getTotalLength())
  }, [])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setDrawn(true)
      },
      { threshold: 0.25 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const animateLines = drawn && lossLen > 0 && accLen > 0

  useEffect(() => {
    if (!animateLines) {
      setShowLabels(false)
      return
    }
    const t = window.setTimeout(() => setShowLabels(true), 2200)
    return () => clearTimeout(t)
  }, [animateLines])

  const lossPath = pathD(lossPts)
  const accPath = pathD(accPts)
  const lastLoss = lossPts[lossPts.length - 1]
  const lastAcc = accPts[accPts.length - 1]

  return (
    <div
      ref={rootRef}
      className={`rounded-lg w-full ${className}`}
      style={{
        background: '#080404',
        border: '1px solid rgba(255,107,107,0.15)',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.35)',
        overflow: 'visible',
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" aria-label="Loss and accuracy vs federated round">
        {/* Horizontal grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = PAD_T + t * GH
          return (
            <line
              key={t}
              x1={PAD_L}
              y1={y}
              x2={PAD_L + GW}
              y2={y}
              stroke="rgba(255,107,107,0.08)"
              strokeWidth={1}
            />
          )
        })}
        {/* Vertical grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const x = PAD_L + t * GW
          return (
            <line
              key={`v-${t}`}
              x1={x}
              y1={PAD_T}
              x2={x}
              y2={PAD_T + GH}
              stroke="rgba(255,107,107,0.06)"
              strokeWidth={1}
            />
          )
        })}

        <text x={PAD_L + GW / 2} y={16} textAnchor="middle" fill="#8a5555" fontSize="10" fontFamily="JetBrains Mono, monospace">
          Federated round →
        </text>
        <text x={PAD_L} y={H - 10} textAnchor="middle" fill="#8a5555" fontSize="8" fontFamily="JetBrains Mono, monospace">
          1
        </text>
        <text x={PAD_L + GW} y={H - 10} textAnchor="middle" fill="#8a5555" fontSize="8" fontFamily="JetBrains Mono, monospace">
          20
        </text>

        {/* Left axis — loss */}
        <text x={12} y={PAD_T + GH / 2} fill="#ff6b6b" fontSize="9" fontFamily="JetBrains Mono, monospace" transform={`rotate(-90 12 ${PAD_T + GH / 2})`}>
          Loss
        </text>
        <text x={PAD_L - 6} y={PAD_T + 4} textAnchor="end" fill="#8a5555" fontSize="8" fontFamily="JetBrains Mono, monospace">
          {LOSS_MAX.toFixed(2)}
        </text>
        <text x={PAD_L - 6} y={PAD_T + GH} textAnchor="end" fill="#8a5555" fontSize="8" fontFamily="JetBrains Mono, monospace">
          {LOSS_MIN.toFixed(2)}
        </text>

        {/* Right axis — accuracy */}
        <text x={W - 12} y={PAD_T + GH / 2} fill="#00ff88" fontSize="9" fontFamily="JetBrains Mono, monospace" transform={`rotate(90 ${W - 12} ${PAD_T + GH / 2})`}>
          Accuracy
        </text>
        <text x={W - 8} y={PAD_T + 4} textAnchor="end" fill="#8a5555" fontSize="8" fontFamily="JetBrains Mono, monospace">
          {(ACC_MAX * 100).toFixed(1)}%
        </text>
        <text x={W - 8} y={PAD_T + GH} textAnchor="end" fill="#8a5555" fontSize="8" fontFamily="JetBrains Mono, monospace">
          {(ACC_MIN * 100).toFixed(1)}%
        </text>

        <path
          ref={lossPathRef}
          d={lossPath}
          fill="none"
          stroke="#ff6b6b"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={lossLen > 0 ? lossLen : 1}
          strokeDashoffset={animateLines ? 0 : lossLen > 0 ? lossLen : 1}
          style={{
            transition: 'stroke-dashoffset 2.2s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
        <path
          ref={accPathRef}
          d={accPath}
          fill="none"
          stroke="#00ff88"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={accLen > 0 ? accLen : 1}
          strokeDashoffset={animateLines ? 0 : accLen > 0 ? accLen : 1}
          style={{
            transition: 'stroke-dashoffset 2.4s cubic-bezier(0.22, 1, 0.36, 1)',
            transitionDelay: '0.08s',
          }}
        />

        {showLabels && (
          <>
            <text x={W - 8} y={lastLoss.y + 4} textAnchor="end" fill="#ff6b6b" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="700">
              Loss: 0.40
            </text>
            <text x={W - 8} y={lastAcc.y - 6} textAnchor="end" fill="#00ff88" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="700">
              Acc: 89.9%
            </text>
          </>
        )}
      </svg>
    </div>
  )
}
