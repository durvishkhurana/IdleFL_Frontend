// Distinct green-family colors for each device shard
const SHARD_COLORS = [
  '#00ff88', '#00d4ff', '#a78bfa', '#ffaa00',
  '#00e5ff', '#69ff5e', '#ff6b6b', '#ffd36b',
]

export default function DeviceContribution({ deviceContributions = [], devices = [] }) {
  if (!deviceContributions || deviceContributions.length === 0) {
    return (
      <div className="bg-[#111118] border border-[rgba(0,255,136,0.15)] rounded-lg p-4">
        <h3 className="text-xs font-bold text-[#555] font-mono uppercase tracking-widest mb-2">Data Shards</h3>
        <div className="text-xs text-[#333] font-mono italic">No contribution data yet</div>
      </div>
    )
  }

  const total = deviceContributions.reduce((acc, d) => acc + (d.samples || 0), 0)

  return (
    <div className="bg-[#111118] border border-[rgba(0,255,136,0.15)] rounded-lg p-4">
      <h3 className="text-xs font-bold text-[#555] font-mono uppercase tracking-widest mb-3">Data Shards</h3>

      {/* Stacked bar */}
      <div className="h-5 rounded overflow-hidden flex mb-3">
        {deviceContributions.map((d, i) => {
          const pct = total > 0 ? ((d.samples || 0) / total) * 100 : 0
          return (
            <div
              key={d.deviceId || i}
              style={{ width: `${pct}%`, background: SHARD_COLORS[i % SHARD_COLORS.length] }}
              title={`${d.name || d.deviceId}: ${pct.toFixed(1)}%`}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1.5">
        {deviceContributions.map((d, i) => {
          const pct = total > 0 ? ((d.samples || 0) / total) * 100 : 0
          const color = SHARD_COLORS[i % SHARD_COLORS.length]
          return (
            <div key={d.deviceId || i} className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
                <span className="text-[#999] truncate max-w-[120px]">{d.name || d.deviceId}</span>
              </div>
              <span style={{ color }}>{pct.toFixed(1)}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
