import { useEffect, useRef, useState } from 'react'
import { formatDuration } from '../../utils/formatters'

export default function RoundProgress({
  currentRound = 0,
  totalRounds = 10,
  statusText,
  participatingDevices,
  assignedDevices,
}) {
  const sessionStartRef = useRef(null)
  const roundStartRef = useRef(null)
  const [, setTick] = useState(0)

  useEffect(() => {
    if (sessionStartRef.current == null) {
      sessionStartRef.current = Date.now()
    }
  }, [])

  useEffect(() => {
    roundStartRef.current = Date.now()
  }, [currentRound])

  useEffect(() => {
    if (currentRound <= 0 || currentRound >= totalRounds) return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [currentRound, totalRounds])

  let etaSeconds = null
  if (currentRound > 0 && currentRound < totalRounds && sessionStartRef.current != null) {
    const timeSinceStartSec = (Date.now() - sessionStartRef.current) / 1000
    const avgRoundDuration = timeSinceStartSec / currentRound
    etaSeconds = avgRoundDuration * (totalRounds - currentRound)
  }

  const etaDisplay =
    etaSeconds != null && Number.isFinite(etaSeconds) && etaSeconds >= 0
      ? formatDuration(Math.max(0, etaSeconds))
      : '--:--'

  const pct = totalRounds > 0 ? (currentRound / totalRounds) * 100 : 0

  const hasParticipation =
    participatingDevices != null &&
    assignedDevices != null &&
    Number.isFinite(Number(participatingDevices)) &&
    Number.isFinite(Number(assignedDevices))

  return (
    <div className="bg-[#111118] border border-[rgba(0,255,136,0.15)] rounded-lg p-5">
      {/* Round number */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs text-[#555] uppercase tracking-widest">Progress</span>
          <div className="text-2xl font-bold font-mono text-white mt-0.5">
            <span className="text-[#00ff88]">{String(currentRound).padStart(2, '0')}</span>
            <span className="text-[#444]"> / {totalRounds}</span>
          </div>
          {hasParticipation && (
            <div className="mt-1 text-xs font-mono text-[#555]">
              {Number(participatingDevices)} / {Number(assignedDevices)} devices contributed
              <span className="ml-2">
                {Number(participatingDevices) === Number(assignedDevices) ? (
                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">Full round</span>
                ) : Number(participatingDevices) >= Number(assignedDevices) * 0.7 ? (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {Number(participatingDevices)}/{Number(assignedDevices)}
                  </span>
                ) : (
                  <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {Number(participatingDevices)}/{Number(assignedDevices)}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
        <div className="text-right">
          <span className="text-xs text-[#555] uppercase tracking-widest">ETA</span>
          <div className="text-sm font-bold font-mono text-[#00d4ff] mt-0.5">
            {etaDisplay}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
            boxShadow: '0 0 8px rgba(0,255,136,0.5)',
          }}
        />
      </div>

      {/* Status text */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#555]">
        {currentRound > 0 && currentRound < totalRounds && (
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
        )}
        {statusText || (currentRound === 0
          ? 'Waiting for devices...'
          : currentRound >= totalRounds
          ? 'Aggregating final weights...'
          : 'Aggregating weights...'
        )}
      </div>
    </div>
  )
}
