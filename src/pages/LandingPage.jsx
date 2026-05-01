import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CoordinatorLog from '../components/landing/CoordinatorLog'
import ConvergenceChart from '../components/landing/ConvergenceChart'
import FederatedFlowDiagram from '../components/landing/FederatedFlowDiagram'

const FLOW_STEPS = [
  { n: '01', title: 'Partition & Assign', desc: 'Coordinator shards metadata and assigns work using device scoring — still without exposing raw samples.' },
  { n: '02', title: 'Train Locally', desc: 'Each node runs SGD on its shard; checkpoints and heartbeats stream over WebSockets for observability.' },
  { n: '03', title: 'FedAvg Merge', desc: 'Weighted averages combine updates each round; stragglers time out and shards fail over to healthy nodes.' },
]

const REAL_WORLD = [
  {
    accent: '#ff6b6b',
    icon: '⚕',
    title: 'Patient records stay local',
    body:
      'Hospitals train a shared diagnostic model without any patient data leaving their servers. FedAvg merges the learning, not the records.',
  },
  {
    accent: '#00d4ff',
    icon: '◈',
    title: 'Transaction data stays sovereign',
    body:
      'Banks improve fraud detection models collaboratively. Each institution\'s transaction history never touches a shared database.',
  },
  {
    accent: '#00ff88',
    icon: '⌁',
    title: 'Devices train where they live',
    body:
      'Phones, sensors, and lab machines contribute training cycles without uploading raw sensor or behavioral data.',
  },
]

const TECH_GROUPS = [
  {
    label: 'Real-time layer',
    tools: ['Socket.IO', 'Redis'],
    why: 'Devices connect, disconnect, and send weights live. Polling would kill round synchronization.',
  },
  {
    label: 'Compute layer',
    tools: ['PyTorch', 'NumPy'],
    why: 'Real gradient descent on real tensors. Agents detect CUDA / MPS / CPU automatically.',
  },
  {
    label: 'Application layer',
    tools: ['Node.js', 'React', 'PostgreSQL'],
    why: 'Event-driven coordinator handles hundreds of concurrent socket connections without blocking.',
  },
]

function Reveal({ children, className = '', delayMs = 0 }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setOn(true)
      },
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: on ? 1 : 0,
        transform: on ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.55s ease ${delayMs}ms, transform 0.55s ease ${delayMs}ms`,
      }}
    >
      {children}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen font-mono overflow-x-hidden" style={{ background: 'var(--bg)' }}>
      <header
        className="flex items-center justify-between px-8 py-4 relative z-10"
        style={{ borderBottom: '1px solid rgba(255,107,107,0.08)' }}
      >
        <div className="flex items-center gap-0.5">
          <span className="font-bold text-lg" style={{ color: '#ff6b6b' }}>IdleFL</span>
          <span className="font-bold text-lg blink" style={{ color: '#ff6b6b' }}>_</span>
        </div>
        <Link to="/auth" className="text-sm transition-colors no-underline" style={{ color: '#8a5555' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#8a5555' }}
        >
          Sign In →
        </Link>
      </header>

      {/* ── SECTION 1 · HERO ─────────────────────────────────────── */}
      <section className="scanlines min-h-screen flex items-center px-6 lg:px-16 py-14 lg:py-12 relative">
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 15% 50%, rgba(255,107,107,0.06) 0%, transparent 70%)',
          }}
        />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 lg:gap-14 w-full max-w-6xl mx-auto relative z-10">
          <div className="flex-1 w-full max-w-xl stagger">
            <div
              className="text-[10px] sm:text-xs px-3 py-1 rounded inline-block mb-3 font-mono tracking-wide"
              style={{
                color: '#ffaa00',
                border: '1px solid rgba(255,170,0,0.45)',
                background: 'rgba(255,170,0,0.08)',
              }}
            >
              IEEE IATMSI 2026 · Peer-reviewed
            </div>
            <div
              className="text-xs px-3 py-1 rounded inline-block mb-5 font-mono tracking-wide block w-fit"
              style={{
                color: '#ff6b6b',
                border: '1px solid rgba(255,107,107,0.3)',
                background: 'rgba(255,107,107,0.05)',
              }}
            >
              Federated coordination · peer worker mesh
            </div>

            <h1
              className="font-bold font-mono leading-[0.95] mb-5 tracking-tight"
              style={{
                fontSize: 'clamp(52px, 8vw, 84px)',
                color: '#ffe8e8',
                textShadow: '0 0 40px rgba(255,107,107,0.2)',
              }}
            >
              Train AI across machines.
              <br />
              Move <span style={{ color: '#ff6b6b' }}>weights</span>, not data.
            </h1>

            <p className="text-sm leading-relaxed mb-2 font-mono max-w-[540px]" style={{ color: '#ffe8e8' }}>
              IdleFL coordinates federated training across real devices — local data stays local, only compact model updates travel to the coordinator.
            </p>
            <p className="text-sm leading-relaxed mb-8 font-mono max-w-[540px]" style={{ color: '#8a5555' }}>
              The browser is your control plane. Your laptops are the compute. Raw training data never crosses the wire.
            </p>

            <div className="flex gap-3 flex-wrap">
              <Link
                to="/auth"
                className="btn-shimmer inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-bold no-underline transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #cc3333 100%)',
                  color: '#0f0808',
                  boxShadow: '0 0 0 rgba(255,107,107,0)',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(255,107,107,0.45)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 0 rgba(255,107,107,0)' }}
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
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#ff6b6b'
                  e.currentTarget.style.boxShadow = '0 0 14px rgba(255,107,107,0.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,107,107,0.3)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                See How It Works
              </a>
            </div>
          </div>

          <div
            className="flex flex-col flex-shrink-0 w-full max-w-[520px] mx-auto lg:mx-0 lg:ml-auto fade-in items-stretch"
            style={{ animationDelay: '0.25s' }}
          >
            <CoordinatorLog className="w-full max-w-[520px]" />
          </div>
        </div>
      </section>

      {/* ── SECTION 2 · THE CONTRAST ─────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-20 lg:py-28 px-6 lg:px-10"
        style={{ background: 'linear-gradient(180deg, var(--bg) 0%, var(--surface) 42%, var(--bg) 100%)' }}
      >
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.22em]" style={{ color: 'rgba(255,107,107,0.45)' }}>
              The problem · then the solution
            </p>
          </Reveal>
          <Reveal className="text-center mb-14" delayMs={60}>
            <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-tight" style={{ color: '#ffe8e8' }}>
              AI needs data. Data can&apos;t be shared. We solved that.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
            <Reveal>
              <div
                className="rounded-lg overflow-hidden h-full card-hover"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 0 0 1px rgba(255,107,107,0.04)',
                }}
              >
                <div
                  className="px-4 py-2.5 flex items-center gap-2 font-mono text-xs font-bold"
                  style={{
                    background: 'rgba(255,68,68,0.12)',
                    borderBottom: '1px solid rgba(255,107,107,0.15)',
                    color: '#ff6b6b',
                  }}
                >
                  <span aria-hidden>✗</span>
                  The Old Way
                </div>
                <div className="p-6 space-y-4 font-mono text-xs leading-relaxed" style={{ color: '#8a5555' }}>
                  <p style={{ color: '#ffe8e8' }}>Raw datasets uploaded to central server</p>
                  <p style={{ color: '#ffe8e8' }}>Privacy risk — one breach exposes everything</p>
                  <p style={{ color: '#ffe8e8' }}>Cloud GPU bills scale with data size</p>
                  <p style={{ color: '#ffe8e8' }}>Single point of failure</p>
                </div>
              </div>
            </Reveal>
            <Reveal delayMs={80}>
              <div
                className="rounded-lg overflow-hidden h-full card-hover"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 0 0 1px rgba(255,107,107,0.04)',
                }}
              >
                <div
                  className="px-4 py-2.5 flex items-center gap-2 font-mono text-xs font-bold"
                  style={{
                    background: 'rgba(0,255,136,0.08)',
                    borderBottom: '1px solid rgba(0,255,136,0.18)',
                    color: '#00ff88',
                  }}
                >
                  <span aria-hidden>✓</span>
                  The IdleFL Way
                </div>
                <div className="p-6 space-y-4 font-mono text-xs leading-relaxed" style={{ color: '#8a5555' }}>
                  <p style={{ color: '#ffe8e8' }}>Data never leaves your machine</p>
                  <p style={{ color: '#ffe8e8' }}>Only 2–8KB model updates cross the wire</p>
                  <p style={{ color: '#ffe8e8' }}>Idle CPUs and GPUs become your compute</p>
                  <p style={{ color: '#ffe8e8' }}>Heartbeat fault tolerance — 90s detection</p>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal className="mb-10 text-center">
            <h3 className="text-sm font-bold font-mono" style={{ color: '#ffe8e8' }}>
              Coordinator flow
            </h3>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FLOW_STEPS.map((step, i) => (
              <Reveal key={step.n} delayMs={i * 70}>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="text-xs mb-3 font-mono" style={{ color: 'rgba(255,107,107,0.4)' }}>
                    {step.n}
                  </div>
                  <div
                    className="w-full max-w-[260px] rounded-lg px-5 py-6 transition-all duration-200 mx-auto"
                    style={{
                      background: 'rgba(255,107,107,0.05)',
                      border: '1px solid rgba(255,107,107,0.18)',
                    }}
                  >
                    <h4 className="text-xs font-bold font-mono mb-2" style={{ color: '#ffe8e8' }}>{step.title}</h4>
                    <p className="text-[11px] leading-relaxed font-mono" style={{ color: '#8a5555' }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Federated round diagram ─────────────────────────────── */}
      <section className="px-6 lg:px-10 py-[80px]" style={{ background: '#080404' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] mb-3" style={{ color: '#ff6b6b' }}>
              How it works
            </p>
            <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-tight mb-3" style={{ color: '#ffe8e8' }}>
              One round of federated learning
            </h2>
            <p className="text-xs sm:text-sm font-mono max-w-xl mx-auto leading-relaxed" style={{ color: '#8a5555' }}>
              Watch data stay local while the model gets smarter — every round, across every device.
            </p>
          </div>
          <div className="max-w-[900px] mx-auto">
            <FederatedFlowDiagram />
          </div>
        </div>
      </section>

      {/* ── SECTION 3 · LIVE RESULTS ─────────────────────────────── */}
      <section className="py-20 lg:py-28 px-6 lg:px-10" style={{ background: '#0c0607' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal className="mb-12">
            <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-tight mb-2" style={{ color: '#ffe8e8' }}>
              Real session output
            </h2>
            <p className="text-xs font-mono" style={{ color: '#8a5555' }}>
              Logistic regression · 2 agents · 10 federated rounds
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <Reveal>
              <ConvergenceChart />
            </Reveal>
            <Reveal delayMs={100}>
              <div
                className="rounded-lg p-6 h-full font-mono text-[11px] leading-relaxed card-hover"
                style={{
                  background: '#080404',
                  border: '1px solid rgba(255,107,107,0.2)',
                  boxShadow: '0 0 32px rgba(255,107,107,0.05)',
                }}
              >
                {[
                  ['SESSION', 'FL-4829'],
                  ['MODEL', 'Logistic Regression'],
                  ['AGENTS', '2 connected'],
                  ['ROUNDS', '10 / 10 complete'],
                  ['LOSS', '0.6412 → 0.4019'],
                  ['ACC', '88.0% → 89.9%'],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3 justify-between border-b border-[rgba(255,107,107,0.08)] py-2 last:border-0">
                    <span style={{ color: '#8a5555' }}>{k}</span>
                    <span style={{ color: '#ffe8e8' }}>{v}</span>
                  </div>
                ))}
                <div className="flex gap-3 justify-between border-b border-[rgba(255,107,107,0.08)] py-2">
                  <span style={{ color: '#8a5555' }}>STATUS</span>
                  <span className="animate-pulse font-semibold" style={{ color: '#00ff88' }}>
                    ✓ Training complete
                  </span>
                </div>
                <div className="flex gap-3 justify-between py-2">
                  <span style={{ color: '#8a5555' }}>DATA</span>
                  <span style={{ color: '#ffe8e8' }}>
                    <span style={{ color: '#ff6b6b', fontWeight: 700 }}>0 bytes</span>
                    {' '}raw data sent
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── SECTION 4 · REAL WORLD ───────────────────────────────── */}
      <section className="py-24 lg:py-32 px-6 lg:px-10" style={{ background: '#160c0c' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal className="mb-6">
            <p className="text-[11px] font-mono uppercase tracking-[0.18em] mb-4" style={{ color: '#ffaa00' }}>
              Why this exists
            </p>
            <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-tight mb-4 max-w-2xl" style={{ color: '#ffe8e8' }}>
              Some data should never leave the building.
            </h2>
            <p className="text-sm font-mono leading-relaxed max-w-2xl mb-16" style={{ color: '#8a5555' }}>
              Hospitals, banks, and research labs can&apos;t pool their data. But they can still collaborate on a shared model.
              That&apos;s the problem IdleFL is built for.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REAL_WORLD.map((tile, i) => (
              <Reveal key={tile.title} delayMs={i * 90}>
                <div
                  className="group relative rounded-lg p-8 h-full card-hover overflow-hidden"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    style={{ background: tile.accent }}
                  />
                  <div className="text-2xl mb-5 opacity-90">{tile.icon}</div>
                  <h3 className="text-sm font-bold font-mono mb-3" style={{ color: '#ffe8e8' }}>{tile.title}</h3>
                  <p className="text-xs leading-relaxed font-mono" style={{ color: '#8a5555' }}>{tile.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5 · TECH STACK ───────────────────────────────── */}
      <section className="py-20 lg:py-24 px-6 lg:px-10" style={{ background: 'var(--bg)' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal className="mb-12 text-center lg:text-left">
            <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-tight mb-2" style={{ color: '#ffe8e8' }}>
              Built for this problem
            </h2>
            <p className="text-xs font-mono max-w-xl mx-auto lg:mx-0" style={{ color: '#8a5555' }}>
              Every choice in the stack exists because federated learning demanded it.
            </p>
          </Reveal>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-8">
            {TECH_GROUPS.map((g, i) => (
              <Reveal key={g.label} className="flex-1 min-w-0" delayMs={i * 70}>
                <div className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] mb-4" style={{ color: '#ff6b6b' }}>
                  {g.label}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {g.tools.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1.5 text-[11px] font-mono rounded border cursor-default transition-all duration-200"
                      style={{
                        background: 'var(--surface2)',
                        color: '#ffe8e8',
                        border: '1px solid rgba(255,107,107,0.12)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#ff6b6b'
                        e.currentTarget.style.color = '#ff6b6b'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,107,107,0.12)'
                        e.currentTarget.style.color = '#ffe8e8'
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] font-mono leading-relaxed italic" style={{ color: '#8a5555' }}>
                  {g.why}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6 · IEEE ─────────────────────────────────────── */}
      <section
        id="research"
        className="py-16 lg:py-20 px-6 lg:px-10"
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-center lg:items-start justify-between">
          <Reveal className="flex-1 max-w-xl">
            <p className="text-[11px] font-mono uppercase tracking-wider mb-3" style={{ color: '#ffaa00' }}>
              Peer-reviewed research
            </p>
            <h2 className="text-xl font-bold font-mono tracking-tight mb-4" style={{ color: '#ffe8e8' }}>
              The architecture behind IdleFL is published.
            </h2>
            <p className="text-xs font-mono leading-relaxed mb-8" style={{ color: '#8a5555' }}>
              Written alongside the implementation — covering distributed scheduling, FedAvg aggregation, OS-inspired fault tolerance,
              and a real 5-device heterogeneous mesh deployment.
            </p>
            <a
              href="https://doi.org/10.1109/IATMSI68868.2026.11466125"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-bold no-underline transition-all duration-200"
              style={{
                color: '#ff6b6b',
                border: '1px solid rgba(255,107,107,0.35)',
                background: 'transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#ff6b6b'
                e.currentTarget.style.boxShadow = '0 0 18px rgba(255,107,107,0.18)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,107,107,0.35)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Read the paper → IEEE Xplore
            </a>
          </Reveal>

          <Reveal delayMs={100} className="flex-shrink-0 w-full max-w-[320px] flex justify-center lg:justify-end">
            <div
              className="rounded-md p-6 font-mono text-[10px] leading-snug w-full"
              style={{
                transform: 'rotate(-1.5deg)',
                background: 'linear-gradient(145deg, #120909 0%, #0a0505 100%)',
                border: '1px solid rgba(255,170,0,0.35)',
                color: '#ffe8e8',
                boxShadow: '0 0 36px rgba(255,170,0,0.08), 0 24px 48px rgba(0,0,0,0.45)',
              }}
            >
              <p className="mb-4 font-semibold tracking-wide" style={{ color: '#ffaa00' }}>IEEE IATMSI 2026</p>
              <p className="mb-4 leading-relaxed">
                IdleFL: A Hybrid Peer-to-Peer
                <br />
                Distributed Computing Platform
                <br />
                for Privacy-Preserving Machine
                <br />
                Learning using Idle Resource
                <br />
                Harvesting
              </p>
              <p className="mb-1">Durvish Khurana</p>
              <p className="mb-4 opacity-90">
                Thapar Institute of Engineering
                <br />
                and Technology
              </p>
              <p style={{ color: '#8a5555' }}>DOI: 10.1109/IATMSI68868.2026.11466125</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SECTION 7 · CTA ──────────────────────────────────────── */}
      <section
        className="py-24 px-6 text-center"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
      >
        <Reveal>
          <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-tight mb-4" style={{ color: '#ffe8e8' }}>
            Start a federated session.
            <br />
            <span style={{ color: '#ff6b6b' }}>No cloud bill.</span>
            {' '}Just your machines.
          </h2>
          <Link
            to="/auth"
            className="btn-shimmer inline-flex items-center gap-2 px-8 py-4 rounded text-base font-bold no-underline transition-all duration-200 mb-6"
            style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #cc3333 100%)',
              color: '#0f0808',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 32px rgba(255,107,107,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
          >
            Get Started →
          </Link>
          <p className="text-xs font-mono max-w-md mx-auto" style={{ color: '#8a5555' }}>
            Download the agent script. Connect your devices. Training starts in under 60 seconds.
          </p>
        </Reveal>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer
        className="py-12 px-6 lg:px-10"
        style={{
          background: 'var(--bg)',
          borderTop: '1px solid rgba(255,107,107,0.06)',
        }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          <div>
            <div className="flex items-center gap-0.5 mb-2">
              <span className="font-bold text-base" style={{ color: '#8a5555' }}>IdleFL</span>
              <span className="font-bold text-base blink" style={{ color: '#ff6b6b' }}>_</span>
            </div>
            <p className="text-[11px] font-mono" style={{ color: '#4a2a2a' }}>
              Distributed Federated Learning Platform
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3 justify-center md:justify-start text-[11px] font-mono">
            <a href="#how-it-works" className="no-underline transition-colors" style={{ color: '#8a5555' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#8a5555' }}
            >
              How it works
            </a>
            <a href="#research" className="no-underline transition-colors" style={{ color: '#8a5555' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#8a5555' }}
            >
              Research
            </a>
            <Link to="/auth" className="no-underline transition-colors" style={{ color: '#8a5555' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#8a5555' }}
            >
              Get Started
            </Link>
          </nav>

          <div className="text-[11px] font-mono md:text-right space-y-2">
            <p style={{ color: '#8a5555' }}>Durvish Khurana</p>
            <p className="max-w-[220px] md:ml-auto" style={{ color: '#4a2a2a' }}>
              Thapar Institute of Engineering and Technology
            </p>
            <div className="flex flex-wrap items-center gap-3 justify-start md:justify-end pt-1">
              <a href="#" aria-label="GitHub" className="inline-flex opacity-70 hover:opacity-100 transition-opacity" style={{ color: '#8a5555' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <span
                className="text-[9px] px-2 py-0.5 rounded font-mono uppercase tracking-wider"
                style={{
                  color: '#ffaa00',
                  border: '1px solid rgba(255,170,0,0.35)',
                  background: 'rgba(255,170,0,0.06)',
                }}
              >
                IEEE IATMSI 2026
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
