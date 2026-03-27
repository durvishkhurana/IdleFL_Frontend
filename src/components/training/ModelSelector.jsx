import clsx from 'clsx'
import { MODEL_TYPES } from '../../utils/constants'

export default function ModelSelector({ selected, onChange, hasCpuDevices = false }) {
  return (
    <div className="flex flex-col gap-3">
      {Object.values(MODEL_TYPES).map((model) => {
        const isSelected = selected === model.id
        const showCpuWarning = model.id === 'CNN' && hasCpuDevices && isSelected

        return (
          <button
            key={model.id}
            onClick={() => onChange(model.id)}
            className={clsx(
              'w-full text-left rounded-lg border p-4 transition-all duration-200 cursor-pointer',
              isSelected
                ? 'border-[#ff6b6b] bg-[rgba(255,107,107,0.06)] shadow-[0_0_16px_rgba(255,107,107,0.15)]'
                : 'border-[rgba(255,107,107,0.15)] bg-transparent hover:border-[rgba(255,107,107,0.35)] hover:shadow-[0_0_10px_rgba(255,107,107,0.08)]'
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{model.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold font-mono text-white">{model.label}</span>
                  {isSelected && (
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' }}>
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#666] font-mono leading-relaxed mb-1">{model.description}</p>
                <p className="text-xs text-[#444] font-mono">{model.bestFor}</p>
              </div>
            </div>

            {showCpuWarning && (
              <div className="mt-3 flex items-center gap-2 text-xs font-mono text-[#ffaa00] bg-[rgba(255,170,0,0.08)] border border-[rgba(255,170,0,0.2)] rounded px-3 py-2">
                <span>⚠️</span>
                <span>CNN on CPU devices will be very slow. GPU recommended.</span>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
