import { useState } from 'react'
import clsx from 'clsx'

export default function Tooltip({ children, content, position = 'top', delay = 200, className = '' }) {
  const [visible, setVisible] = useState(false)
  const [timer, setTimer] = useState(null)

  const show = () => {
    const t = setTimeout(() => setVisible(true), delay)
    setTimer(t)
  }
  const hide = () => {
    clearTimeout(timer)
    setVisible(false)
  }

  const POS = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div className={clsx('relative inline-flex', className)} onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div
          className={clsx(
            'absolute z-50 px-2.5 py-1.5 rounded text-xs font-mono whitespace-nowrap pointer-events-none',
            'bg-[#16161e] text-[#e0e0e0] border border-[rgba(0,255,136,0.2)]',
            'shadow-[0_4px_12px_rgba(0,0,0,0.5)]',
            POS[position]
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}
