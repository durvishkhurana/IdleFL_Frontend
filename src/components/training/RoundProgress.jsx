import { formatDuration, formatRound } from '../../utils/formatters'

export default function RoundProgress({ currentRound = 0, totalRounds = 10, estimatedTimeRemaining, statusText }) {
  const pct = totalRounds > 0 ? (currentRound / totalRounds) * 100 : 0

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
        </div>
        <div className="text-right">
          <span className="text-xs text-[#555] uppercase tracking-widest">ETA</span>
          <div className="text-sm font-bold font-mono text-[#00d4ff] mt-0.5">
            {estimatedTimeRemaining != null ? formatDuration(estimatedTimeRemaining) : '--:--'}
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
