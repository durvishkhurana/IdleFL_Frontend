import clsx from 'clsx'
import Spinner from './Spinner'

const BASE = `
  inline-flex items-center justify-center gap-2
  font-mono font-medium
  border rounded
  cursor-pointer
  transition-all duration-200
  disabled:opacity-40 disabled:cursor-not-allowed
  btn-shimmer
`

const SIZE = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

const VARIANT = {
  primary: `
    text-[#0f0808] border-[#ff6b6b]
    active:scale-[0.98]
  `,
  secondary: `
    bg-transparent text-[#ff6b6b] border-[rgba(255,107,107,0.45)]
    hover:border-[#ff6b6b] hover:shadow-[0_0_12px_rgba(255,107,107,0.2)]
    active:scale-[0.98]
  `,
  danger: `
    bg-transparent text-[#ff4444] border-[rgba(255,68,68,0.5)]
    hover:bg-[rgba(255,68,68,0.1)] hover:border-[#ff4444]
    active:scale-[0.98]
  `,
  ghost: `
    bg-transparent text-[#ffe8e8] border-transparent
    hover:text-[#ff6b6b] hover:border-[rgba(255,107,107,0.2)]
    active:scale-[0.98]
  `,
}

const PRIMARY_BG = 'linear-gradient(135deg, #ff6b6b 0%, #cc3333 100%)'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  style = {},
  ...props
}) {
  const isPrimary = variant === 'primary'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(BASE, SIZE[size], VARIANT[variant], className)}
      style={{
        ...(isPrimary ? {
          background: PRIMARY_BG,
          boxShadow: '0 0 0 rgba(255,107,107,0)',
        } : {}),
        ...(isPrimary ? { '--hover-shadow': '0 0 20px rgba(255,107,107,0.4)' } : {}),
        ...style,
      }}
      onMouseEnter={(e) => {
        if (isPrimary && !disabled) e.currentTarget.style.boxShadow = '0 0 20px rgba(255,107,107,0.4)'
      }}
      onMouseLeave={(e) => {
        if (isPrimary) e.currentTarget.style.boxShadow = '0 0 0 rgba(255,107,107,0)'
      }}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
