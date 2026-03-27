import clsx from 'clsx'

const OS_ICON = { windows: '🪟', mac: '🍎', linux: '🐧' }

const COMPUTE_COLORS = {
  CUDA: 'text-[#00ff88]',
  MPS:  'text-[#00d4ff]',
  CPU:  'text-[#666]',
}

export default function DeviceSelector({ devices = [], selected, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-xs text-[#555] font-mono uppercase tracking-widest whitespace-nowrap">
        Device
      </label>
      <select
        value={selected || ''}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
          'bg-[#0d0d14] text-[#e0e0e0] font-mono text-sm',
          'border border-[rgba(0,255,136,0.2)] rounded px-3 py-1.5',
          'focus:outline-none focus:border-[#00ff88] focus:shadow-[0_0_10px_rgba(0,255,136,0.15)]',
          'transition-all duration-200 cursor-pointer',
          'min-w-[220px]'
        )}
      >
        <option value="" disabled>Select device...</option>
        {devices.map((d) => {
          const dropped = d.status === 'dropped'
          return (
            <option
              key={d.deviceId}
              value={d.deviceId}
              disabled={dropped}
              style={{ color: dropped ? '#555' : '#e0e0e0' }}
            >
              {OS_ICON[d.os] || '💻'} {d.name || d.deviceId} [{d.computeLabel || 'CPU'}]
              {dropped ? ' – dropped' : ''}
            </option>
          )
        })}
      </select>
    </div>
  )
}
