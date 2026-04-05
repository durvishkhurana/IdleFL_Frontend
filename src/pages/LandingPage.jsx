import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

/* ─── Animated Terminal Window ──────────────────────────────────── */
const TERMINAL_LINES = [
  { delay: 0.0,  text: '[✓] Connected to FL-4829', color: '#00ff88' },
  { delay: 0.6,  text: '[✓] Hardware detected: RTX 3060 (CUDA)', color: '#00ff88' },
  { delay: 1.2,  text: '[✓] Registered as device_001', color: '#00ff88' },
  { delay: 1.8,  text: '' },
  { delay: 2.2,  text: 'Waiting for training job...', color: '#8a5555' },
  { delay: 3.0,  text: '' },
  { delay: 3.4,  text: '[●] Round 3/10 — Training CNN on 2,400 samples', color: '#ff6b6b' },
  { delay: 4.0,  text: '    Loss:     0.3421 → 0.2187  ↓', color: '#ffe8e8' },
  { delay: 4.3,  text: '    Accuracy: 71.2%  → 78.4%   ↑', color: '#ffe8e8' },
  { delay: 4.9,  text: '' },
  { delay: 5.2,  text: '[●] Sending weights (4.2 KB)...', color: '#ff6b6b' },
  { delay: 5.9,  text: '[✓] FedAvg aggregated. New model received.', color: '#00ff88' },
  { delay: 6.5,  text: '[●] Round 4/10 starting...', color: '#ff6b6b' },
]

function AnimatedTerminal() {
  const [visibleLines, setVisibleLines] = useState([])
  const [tick, setTick] = useState(0)

  useEffect(() => {
    setVisibleLines([])
    let timers = []
    TERMINAL_LINES.forEach((line, idx) => {
      const t = setTimeout(() => {
        setVisibleLines(prev => [...prev, idx])
      }, line.delay * 1000)
      timers.push(t)
    })
    // Loop
    const loop = setTimeout(() => setTick(t => t + 1), 9000)
    timers.push(loop)
    return () => timers.forEach(clearTimeout)
  }, [tick])

  return (
    <div
      className="rounded-lg overflow-hidden font-mono text-xs select-none"
      style={{
        background: '#080404',
        border: '1px solid rgba(255,107,107,0.2)',
        boxShadow: '0 0 40px rgba(255,107,107,0.08), 0 24px 48px rgba(0,0,0,0.5)',
        minWidth: 380,
        maxWidth: 460,
      }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center gap-1.5 px-3 py-2.5"
        style={{ background: 'rgba(255,107,107,0.05)', borderBottom: '1px solid rgba(255,107,107,0.1)' }}
      >
        <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
        <span className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
        <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
        <span className="ml-3 text-[10px]" style={{ color: '#8a5555' }}>IdleFL Agent v1.0</span>
      </div>

      {/* Terminal lines */}
      <div className="p-4 space-y-0.5 min-h-[260px]">
        <div className="text-[#444] mb-2">┌─ FL Session Active ─────────────────────┐</div>
        {TERMINAL_LINES.map((line, idx) => (
          <div
            key={idx}
            className="transition-all duration-300"
            style={{
              opacity: visibleLines.includes(idx) ? 1 : 0,
              transform: visibleLines.includes(idx) ? 'translateY(0)' : 'translateY(4px)',
              color: line.color || '#8a5555',
              minHeight: line.text ? undefined : '0.6rem',
            }}
          >
            {line.text}
          </div>
        ))}
        {/* Blinking cursor */}
        <div className="flex items-center gap-1 mt-2" style={{ color: '#ff6b6b' }}>
          <span>$</span>
          <span className="blink">_</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Stats ────────────────────────────────────────────────────── */
const STATS = [
  { icon: '⚡', value: '—', label: 'Training Speedup', pending: true },
  { icon: '🔒', value: '0 bytes', label: 'Raw Data Sent', pending: false },
  { icon: '🎯', value: '—', label: 'CNN Accuracy (MNIST)', pending: true },
  { icon: '🛡️', value: '90s', label: 'Max Fault Detection', pending: false },
]

function StatCounter({ value, label, icon, pending }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div
        className="text-2xl font-bold font-mono glow-text"
        style={{
          color: '#ff6b6b',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.6s ease',
        }}
      >
        {value}
      </div>
      <div className="text-xs mt-1" style={{ color: '#8a5555' }}>{label}</div>
      {pending && (
        <div className="text-[10px] mt-0.5 font-mono" style={{ color: 'rgba(255,107,107,0.4)' }}>
          benchmark pending
        </div>
      )}
    </div>
  )
}

/* ─── Steps ────────────────────────────────────────────────────── */
const STEPS = [
  { n: '01', icon: '📤', title: 'Upload Dataset', desc: 'Drop your CSV or ZIP onto the training dashboard from any browser.' },
  { n: '02', icon: '🔀', title: 'Distribute Shards', desc: 'Server evenly partitions data across connected device nodes.' },
  { n: '03', icon: '⚙️', title: 'Local Training', desc: 'Each laptop trains its shard locally — no raw data leaves the device.' },
  { n: '04', icon: '⚖️', title: 'FedAvg Aggregate', desc: 'Gradient weights are merged using FedAvg into the global model.' },
]

/* ─── Features ─────────────────────────────────────────────────── */
const FEATURES = [
  { icon: '⚖️', title: 'FedAvg Aggregation', desc: 'Production-grade federated averaging merges independently trained weights into a unified global model each round.' },
  { icon: '🛡️', title: 'Fault Tolerance', desc: 'Device drops are detected within 90s. Training continues without the straggler; rejoining is seamless.' },
  { icon: '📊', title: 'Real-time Dashboard', desc: 'Live loss curves, accuracy, round progress, and per-device GPU/CPU stats via WebSocket.' },
  { icon: '🔒', title: 'Privacy by Design', desc: 'Raw training data never leaves each device. Only gradient updates are transmitted.' },
  { icon: '🖥️', title: 'Remote Terminal', desc: 'SSH-like xterm.js terminal into any connected device directly from the browser.' },
  { icon: '🏆', title: 'Device Scoring', desc: 'Intelligent scoring balances CPU, RAM, reliability, and active tasks for optimal shard allocation.' },
]

/* ─── Tech Stack ─────────────────────────────────────────────────── */
const TECH_FRONTEND = ['React', 'Vite', 'Tailwind', 'Chart.js', 'xterm.js', 'Zustand', 'Socket.IO Client']
const TECH_BACKEND =  ['Node.js', 'PyTorch', 'PostgreSQL', 'Redis', 'Prisma', 'Socket.IO']

export default function LandingPage() {
  return (
    <div className="min-h-screen font-mono overflow-x-hidden" style={{ background: 'var(--bg)' }}>

      {/* Minimal top bar */}
      <header
        className="flex items-center justify-between px-8 py-4 relative z-10"
        style={{ borderBottom: '1px solid rgba(255,107,107,0.08)' }}
      >
        <div className="flex items-center gap-0.5">
          <span className="font-bold text-lg" style={{ color: '#ff6b6b' }}>IdleFL</span>
          <span className="font-bold text-lg blink" style={{ color: '#ff6b6b' }}>_</span>
        </div>
        <Link to="/auth" className="text-sm transition-colors no-underline" style={{ color: '#8a5555' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
          onMouseLeave={e => e.currentTarget.style.color = '#8a5555'}
        >
          Sign In →
        </Link>
      </header>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="scanlines min-h-[92vh] flex items-center px-8 lg:px-16 py-12 relative">
        {/* Background radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 15% 50%, rgba(255,107,107,0.06) 0%, transparent 70%)',
          }}
        />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 w-full max-w-6xl mx-auto relative z-10">
          {/* Left */}
          <div className="flex-1 stagger">
            <div
              className="text-xs px-3 py-1 rounded inline-block mb-5 font-mono"
              style={{
                color: '#ff6b6b',
                border: '1px solid rgba(255,107,107,0.3)',
                background: 'rgba(255,107,107,0.05)',
              }}
            >
              ◉ Distributed Federated Learning
            </div>

            <h1
              className="font-bold text-white leading-none mb-4"
              style={{
                fontSize: 'clamp(52px, 8vw, 84px)',
                textShadow: '0 0 40px rgba(255,107,107,0.2)',
              }}
            >
              <span style={{ color: '#ff6b6b' }}>Idle</span>FL
            </h1>

            <p className="text-sm leading-relaxed mb-2" style={{ color: '#ffe8e8', maxWidth: 480 }}>
              Distributed federated learning across the laptops you already own.
            </p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#8a5555', maxWidth: 480 }}>
              No cloud. No raw data sharing. Just coordinated distributed training.
            </p>

            <div className="flex gap-3 flex-wrap">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-bold no-underline transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #cc3333 100%)',
                  color: '#0f0808',
                  boxShadow: '0 0 0 rgba(255,107,107,0)',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 24px rgba(255,107,107,0.45)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 rgba(255,107,107,0)'}
              >
                Get Started →
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm no-underline transition-all duration-200"
                style={{
                  color: '#ff6b6b',
                  border: '1px solid rgba(255,107,107,0.3)',
                  background: 'transparent',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff6b6b'; e.currentTarget.style.boxShadow = '0 0 14px rgba(255,107,107,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,107,107,0.3)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                View Architecture
              </a>
            </div>
          </div>

          {/* Right: Animated terminal */}
          <div className="flex-shrink-0 w-full max-w-[460px] fade-in" style={{ animationDelay: '0.3s' }}>
            <AnimatedTerminal />
          </div>
        </div>
      </section>

      {/* ── DEMO VIDEO ────────────────────────────────────────────── */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-medium mb-3 text-white">See it in action</h2>
        <p className="text-sm mb-6" style={{ color: '#8a5555' }}>
          A real training run — two laptops, MNIST dataset, 10 rounds
        </p>
        <div
          className="relative w-full rounded-xl overflow-hidden"
          style={{
            aspectRatio: '16 / 9',
            border: '1px solid rgba(255,107,107,0.15)',
            background: '#080404',
            boxShadow: '0 0 40px rgba(255,107,107,0.06), 0 24px 48px rgba(0,0,0,0.5)',
          }}
        >
          <iframe
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
            className="w-full h-full"
            style={{ border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────── */}
      <section
        className="py-10 px-8"
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(s => <StatCounter key={s.label} {...s} />)}
          </div>
          <p className="text-center text-[10px] font-mono mt-6" style={{ color: 'rgba(255,107,107,0.35)' }}>
            Benchmarks coming soon
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-20 px-8"
        style={{ background: 'linear-gradient(180deg, var(--bg) 0%, var(--surface) 50%, var(--bg) 100%)' }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.n} className="flex flex-col items-center text-center">
                <div className="text-xs mb-3 font-mono" style={{ color: 'rgba(255,107,107,0.4)' }}>{step.n}</div>
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl mb-4 transition-all duration-200"
                  style={{
                    background: 'rgba(255,107,107,0.08)',
                    border: '1px solid rgba(255,107,107,0.2)',
                  }}
                >
                  {step.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#8a5555', maxWidth: 180 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────────── */}
      <section className="py-20 px-8" style={{ background: '#0c0607' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-12 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {FEATURES.map(f => (
              <div
                key={f.title}
                className="feature-card card-hover cursor-default rounded-lg p-5 transition-all duration-200"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-4"
                  style={{ background: 'var(--accent-glow)' }}
                >
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#8a5555' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ─────────────────────────────────────────────── */}
      <section className="py-16 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-bold text-white mb-8">Tech Stack</h2>

          <div className="text-xs mb-2 uppercase tracking-widest" style={{ color: '#8a5555' }}>Frontend</div>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {TECH_FRONTEND.map(t => (
              <span
                key={t}
                className="px-3 py-1.5 text-xs font-mono rounded border transition-all duration-200 cursor-default"
                style={{ background: 'var(--surface2)', color: '#ffe8e8', border: '1px solid rgba(255,107,107,0.12)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff6b6b'; e.currentTarget.style.boxShadow = '0 0 8px var(--accent-glow)'; e.currentTarget.style.color = '#ff6b6b' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,107,107,0.12)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.color = '#ffe8e8' }}
              >
                {t}
              </span>
            ))}
          </div>

          <div className="text-xs mb-2 uppercase tracking-widest" style={{ color: '#8a5555' }}>Backend</div>
          <div className="flex flex-wrap justify-center gap-2">
            {TECH_BACKEND.map(t => (
              <span
                key={t}
                className="px-3 py-1.5 text-xs font-mono rounded border transition-all duration-200 cursor-default"
                style={{ background: 'rgba(255,107,107,0.04)', color: '#ffe8e8', border: '1px solid rgba(255,107,107,0.08)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff6b6b'; e.currentTarget.style.boxShadow = '0 0 8px var(--accent-glow)'; e.currentTarget.style.color = '#ff6b6b' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,107,107,0.08)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.color = '#ffe8e8' }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section
        className="py-24 px-8 text-center"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
      >
        <h2 className="text-2xl font-bold text-white mb-3">
          Start a session in <span style={{ color: '#ff6b6b' }}>60 seconds.</span>
        </h2>
        <p className="text-sm mb-8" style={{ color: '#8a5555' }}>No infrastructure. No cloud bill. Just laptops.</p>
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 px-8 py-4 rounded text-base font-bold no-underline transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #ff6b6b 0%, #cc3333 100%)',
            color: '#0f0808',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 32px rgba(255,107,107,0.4)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        >
          Get Started →
        </Link>
      </section>

      <footer
        className="py-6 text-center text-xs"
        style={{ color: '#4a2a2a', borderTop: '1px solid rgba(255,107,107,0.06)' }}
      >
        IdleFL — Distributed Federated Learning · Built for Hackers
      </footer>
    </div>
  )
}
