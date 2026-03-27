import clsx from 'clsx'

const SIZE_CLASS = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]',
}

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <div
      className={clsx(
        'rounded-full animate-spin',
        'border-transparent border-t-[#00ff88]',
        SIZE_CLASS[size],
        className
      )}
      style={{ animation: 'spin 0.7s linear infinite' }}
    />
  )
}
