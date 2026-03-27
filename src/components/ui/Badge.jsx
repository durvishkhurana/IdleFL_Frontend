import clsx from 'clsx'

const VARIANTS = {
  active:   'bg-[rgba(255,107,107,0.15)] text-[#ff6b6b] border-[rgba(255,107,107,0.3)]',
  idle:     'bg-[rgba(102,102,102,0.15)] text-[#999] border-[rgba(102,102,102,0.3)]',
  training: 'bg-[rgba(0,212,255,0.15)] text-[#00d4ff] border-[rgba(0,212,255,0.3)] badge-training-pulse',
  dropped:  'bg-[rgba(255,68,68,0.12)] text-[#ff4444] border-[rgba(255,68,68,0.3)]',
  success:  'bg-[rgba(0,255,136,0.15)] text-[#00ff88] border-[rgba(0,255,136,0.3)]',
  warning:  'bg-[rgba(255,170,0,0.15)] text-[#ffaa00] border-[rgba(255,170,0,0.3)]',
  error:    'bg-[rgba(255,68,68,0.12)] text-[#ff4444] border-[rgba(255,68,68,0.3)]',
  muted:    'bg-[rgba(102,102,102,0.15)] text-[#8a5555] border-[rgba(102,102,102,0.2)]',
}

export default function Badge({ variant = 'muted', children, pulse = false, className = '' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5',
        'text-xs font-mono font-medium rounded border',
        VARIANTS[variant] || VARIANTS.muted,
        className
      )}
    >
      {pulse && variant === 'training' && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] inline-block animate-pulse" />
      )}
      {children}
    </span>
  )
}
