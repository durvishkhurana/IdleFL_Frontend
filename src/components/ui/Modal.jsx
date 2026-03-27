import { useEffect } from 'react'
import clsx from 'clsx'
import Button from './Button'

export default function Modal({ isOpen, onClose, title, children, className = '' }) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={clsx(
          'relative bg-[#111118] border border-[rgba(0,255,136,0.2)] rounded-lg',
          'shadow-[0_0_40px_rgba(0,255,136,0.1)]',
          'w-full max-w-md mx-4 p-6',
          'animate-[fadeInScale_0.2s_ease_both]',
          className
        )}
        style={{ animation: 'fadeInScale 0.2s ease both' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          {title && (
            <h2 className="text-base font-bold text-white font-mono">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto text-[#666] hover:text-[#00ff88] transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
