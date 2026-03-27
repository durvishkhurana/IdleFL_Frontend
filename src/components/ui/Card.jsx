import clsx from 'clsx'

export default function Card({
  children,
  title,
  subtitle,
  action,
  className = '',
  glow = false,
  ...props
}) {
  return (
    <div
      className={clsx(
        'bg-[#111118] border rounded-lg p-5',
        'transition-all duration-250',
        glow
          ? 'border-[rgba(0,255,136,0.5)] shadow-[0_0_20px_rgba(0,255,136,0.15)]'
          : 'border-[rgba(0,255,136,0.15)] hover:shadow-[0_0_20px_rgba(0,255,136,0.1)] hover:border-[rgba(0,255,136,0.3)]',
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-sm font-bold text-white font-mono tracking-wide">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#666] mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
