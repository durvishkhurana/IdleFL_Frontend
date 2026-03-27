import clsx from 'clsx'

export default function PageWrapper({ children, title, className = '' }) {
  return (
    <div
      className={clsx(
        'min-h-[calc(100vh-56px)] px-4 sm:px-6 lg:px-8 py-8 fade-in',
        className
      )}
    >
      {title && (
        <h1 className="text-xl font-bold text-white font-mono mb-6 tracking-tight">
          <span className="text-[#00ff88]">▶</span>{' '}{title}
        </h1>
      )}
      {children}
    </div>
  )
}
