import { useState } from 'react'
import clsx from 'clsx'

const VARIANTS = {
  'majority-cpu': {
    icon: '⚠️',
    text: 'Most connected devices are CPU-only. Training may be slower than your best single GPU device.',
    color: '#ffaa00',
    bg: 'rgba(255,170,0,0.08)',
    border: 'rgba(255,170,0,0.3)',
  },
  'cnn-cpu-warning': {
    icon: '⚠️',
    text: 'CNN training on CPU-only devices may take extremely long or run out of memory. A GPU device is strongly recommended.',
    color: '#ffaa00',
    bg: 'rgba(255,170,0,0.08)',
    border: 'rgba(255,170,0,0.3)',
  },
  error: {
    icon: '✖',
    text: '',
    color: '#ff4444',
    bg: 'rgba(255,68,68,0.08)',
    border: 'rgba(255,68,68,0.3)',
  },
}

export default function WarningBanner({ variant = 'majority-cpu', message, onDismiss }) {
  const [dismissed, setDismissed] = useState(false)
  const config = VARIANTS[variant] || VARIANTS['majority-cpu']

  const dismiss = () => {
    setDismissed(true)
    if (onDismiss) onDismiss()
  }

  if (dismissed) return null

  return (
    <div
      className="flex items-start gap-3 rounded-lg px-4 py-3 border mb-4 fade-in"
      style={{
        background: config.bg,
        borderColor: config.border,
        color: config.color,
      }}
    >
      <span className="text-base flex-shrink-0 mt-0.5">{config.icon}</span>
      <p className="flex-1 text-xs font-mono leading-relaxed" style={{ color: config.color }}>
        {message || config.text}
      </p>
      <button
        onClick={dismiss}
        className="flex-shrink-0 text-base leading-none hover:opacity-60 transition-opacity"
        style={{ color: config.color }}
      >
        ✕
      </button>
    </div>
  )
}
