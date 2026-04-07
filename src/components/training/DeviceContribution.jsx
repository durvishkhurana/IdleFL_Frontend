// Distinct green-family colors for each device shard
const SHARD_COLORS = [
  '#00ff88', '#00d4ff', '#a78bfa', '#ffaa00',
  '#00e5ff', '#69ff5e', '#ff6b6b', '#ffd36b',
]

function enrichContributions(deviceContributions, devices) {
  const byId = new Map((devices || []).map((d) => [d.deviceId, d]))
  return (deviceContributions || []).map((c) => {
    const dev = byId.get(c.deviceId)
    const samples = c.samples ?? c.shardSize ?? 0
    return {
      ...c,
      samples,
      name: c.name ?? dev?.deviceName ?? dev?.name,
      computeType: c.computeType ?? dev?.computeType,
      os: c.os ?? dev?.os,
    }
  })
}

/** Only show rows when the server has reported real shard sizes (training:round_complete). */
function buildShardRows(deviceContributions, devices) {
  const enriched = enrichContributions(deviceContributions, devices)
  const hasRealSamples = enriched.some((r) => (r.samples || 0) > 0)
  return hasRealSamples ? enriched : []
}

export default function DeviceContribution({ deviceContributions = [], devices = [] }) {
  const rows = buildShardRows(deviceContributions, devices)

  if (!rows.length) {
    return (
      <div className="bg-[#111118] border border-[rgba(0,255,136,0.15)] rounded-lg p-4">
        <h3 className="text-xs font-bold text-[#555] font-mono uppercase tracking-widest mb-2">Data Shards</h3>
        <div className="text-xs text-[#333] font-mono italic">
          Shard sizes appear after the first completed FedAvg round (from real device contributions).
        </div>
      </div>
    )
  }

  const total = rows.reduce((acc, d) => acc + (d.samples || 0), 0)

  return (
    <div className="bg-[#111118] border border-[rgba(0,255,136,0.15)] rounded-lg p-4">
      <h3 className="text-xs font-bold text-[#555] font-mono uppercase tracking-widest mb-3">Data Shards</h3>

      {/* Stacked bar */}
      <div className="h-5 rounded overflow-hidden flex mb-3">
        {rows.map((d, i) => {
          const pct = total > 0 ? ((d.samples || 0) / total) * 100 : 0
          const label = d.name || d.deviceId
          const ct = d.computeType ? ` · ${d.computeType}` : ''
          return (
            <div
              key={d.deviceId || i}
              style={{ width: `${pct}%`, background: SHARD_COLORS[i % SHARD_COLORS.length] }}
              title={`${label}${ct}: ${pct.toFixed(1)}%`}
            />
          )
        })}
      </div>

      {/* Legend — one row per connected / contributing device */}
      <div className="flex flex-col gap-1.5">
        {rows.map((d, i) => {
          const pct = total > 0 ? ((d.samples || 0) / total) * 100 : 0
          const color = SHARD_COLORS[i % SHARD_COLORS.length]
          return (
            <div key={d.deviceId || i} className="flex items-center justify-between text-xs font-mono gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
                <span className="text-[#999] truncate">{d.name || d.deviceId}</span>
                {d.computeType && (
                  <span className="text-[#666] flex-shrink-0 uppercase text-[10px] tracking-tight">{d.computeType}</span>
                )}
              </div>
              <span className="flex-shrink-0" style={{ color }}>
                {pct.toFixed(1)}% · {(d.samples || 0).toLocaleString()} samples
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
