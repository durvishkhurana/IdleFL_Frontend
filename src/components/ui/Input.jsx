import { useState } from 'react'
import clsx from 'clsx'

export default function Input({
  label,
  error,
  hint,
  id,
  className = '',
  type = 'text',
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {label && (
        <label htmlFor={inputId} className="text-xs text-[#999] font-mono uppercase tracking-widest">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={clsx(
          'w-full bg-[#0d0d14] font-mono text-sm text-[#e0e0e0]',
          'px-3 py-2.5 rounded border',
          'transition-all duration-200 outline-none',
          error
            ? 'border-[rgba(255,68,68,0.5)] focus:border-[#ff4444] focus:shadow-[0_0_10px_rgba(255,68,68,0.2)]'
            : 'border-[rgba(255,107,107,0.18)] focus:border-[#ff6b6b] focus:shadow-[0_0_12px_rgba(255,107,107,0.18)]',
          'placeholder:text-[#444]'
        )}
        {...props}
      />
      {hint && !error && <span className="text-xs text-[#555]">{hint}</span>}
      {error && <span className="text-xs text-[#ff4444]">{error}</span>}
    </div>
  )
}
