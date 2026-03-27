import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import LossGraph from '../components/training/LossGraph'
import RoundProgress from '../components/training/RoundProgress'
import ModelSelector from '../components/training/ModelSelector'
import DatasetUpload from '../components/training/DatasetUpload'
import ConfigPanel from '../components/training/ConfigPanel'
import DeviceContribution from '../components/training/DeviceContribution'
import WarningBanner from '../components/session/WarningBanner'
import DeviceCard from '../components/session/DeviceCard'
import Button from '../components/ui/Button'
import { useTraining } from '../hooks/useTraining'
import { useDevices } from '../hooks/useDevices'
import { useSocket } from '../socket/useSocket'
import useJobStore from '../store/jobStore'
import useSessionStore from '../store/sessionStore'
import { formatDuration, formatScore } from '../utils/formatters'
import { DEMO_MODE, DEMO_DEVICES, generateDemoTrainingData } from '../utils/demoMode'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

/* ─── Dev mock training playback ──────────────────────────── */
function useMockTraining() {
  const { updateRound, completeJob } = useJobStore()
  const [mockRunning, setMockRunning] = useState(false)

  const startMock = (totalRounds = 10) => {
    const data = generateDemoTrainingData(totalRounds)
    setMockRunning(true)
    let i = 0
    const interval = setInterval(() => {
      updateRound(data[i])
      useSessionStore.getState().updateTrainingProgress(data[i].round, totalRounds)
      i++
      if (i >= data.length) {
        clearInterval(interval)
        setMockRunning(false)
        completeJob(data[data.length - 1].accuracy)
      }
    }, 900)
    return () => clearInterval(interval)
  }

  return { startMock, mockRunning }
}

/* ─── Round flash callout ─────────────────────────────────── */
function RoundFlash({ round }) {
  const [visible, setVisible] = useState(false)
  const prev = useRef(round)

  useEffect(() => {
    if (round > 0 && round !== prev.current) {
      prev.current = round
      setVisible(true)
      const t = setTimeout(() => setVisible(false), 2000)
      return () => clearTimeout(t)
    }
  }, [round])

  if (!visible) return null
  return (
    <div
      className="fixed top-20 right-6 z-50 rounded-lg px-4 py-2 text-sm font-mono font-bold fade-in"
      style={{
        background: 'rgba(255,107,107,0.1)',
        border: '1px solid rgba(255,107,107,0.4)',
        color: '#ff6b6b',
        boxShadow: '0 0 20px rgba(255,107,107,0.2)',
        animation: 'fadeInScale 0.2s ease both',
      }}
    >
      ⚡ FedAvg Round {round} complete
    </div>
  )
}

/* ─── Empty devices panel ─────────────────────────────────── */
function EmptyDevicesGuide({ sessionId }) {
  return (
    <div
      className="dashed-animated rounded-lg p-5 flex flex-col gap-3"
      style={{ background: 'rgba(255,107,107,0.02)' }}
    >
      <div className="text-xs font-bold text-white font-mono">No Devices</div>
      <div className="text-xs font-mono leading-relaxed" style={{ color: '#8a5555' }}>
        Connect devices to start training:
      </div>
      <ol className="text-xs font-mono leading-relaxed space-y-1" style={{ color: '#8a5555' }}>
        <li>1. Go to the Session page</li>
        <li>
          2. Share session ID:{' '}
          <span style={{ color: '#ff6b6b' }}>{sessionId || 'FL-XXXX'}</span>
        </li>
        <li>3. Run the agent script on each laptop</li>
      </ol>
      <Link
        to="/session"
        className="text-xs font-mono no-underline mt-1 transition-colors"
        style={{ color: '#ff6b6b' }}
      >
        → Go to Session
      </Link>
    </div>
  )
}

export default function TrainingPage() {
  const navigate = useNavigate()
  useSocket()

  const { job, uploadDataset, startTraining, resetJob, error: trainingError } = useTraining()
  const { devices, hasMajorityCpuOnly } = useDevices()
  const { sessionId } = useSessionStore()
  const { startMock, mockRunning } = useMockTraining()

  const [modelType, setModelType] = useState('LINEAR_REGRESSION')
  const [config, setConfig] = useState({ learningRate: 0.01, numRounds: 10, batchSize: 32 })
  const [datasetUploaded, setDatasetUploaded] = useState(false)
  const [startLoading, setStartLoading] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)

  // Show sticky bar when dataset uploaded
  useEffect(() => {
    setShowStickyBar(datasetUploaded)
  }, [datasetUploaded])

  const handleUpload = async (formData) => {
    const res = await uploadDataset(formData)
    setDatasetUploaded(true)
  }

  const handleStart = async () => {
    setStartLoading(true)
    const res = await startTraining({ modelType, config })
    if (!res.success) {
      const { startJob } = useJobStore.getState()
      startJob(`JOB-${Date.now()}`, modelType, config.numRounds)
      startMock(config.numRounds)
    }
    setStartLoading(false)
  }

  const totalTime = job.completedAt && job.startedAt
    ? Math.floor((job.completedAt - job.startedAt) / 1000)
    : null

  /* ── SETUP PHASE ──────────────────────────────────────── */
  if (job.status === 'idle') {
    return (
      <PageWrapper title="Training">
        {hasMajorityCpuOnly && <WarningBanner variant="majority-cpu" />}

        <div className="flex flex-col lg:flex-row gap-6 pb-24">
          {/* Left: config */}
          <div className="flex-1 flex flex-col gap-5">
            <div
              className="rounded-lg p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <h3 className="text-xs font-bold text-white font-mono mb-4">1. Upload Dataset</h3>
              <DatasetUpload onUpload={handleUpload} modelType={modelType} />
            </div>

            <div
              className="rounded-lg p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <h3 className="text-xs font-bold text-white font-mono mb-4">2. Select Model</h3>
              <ModelSelector
                selected={modelType}
                onChange={setModelType}
                hasCpuDevices={hasMajorityCpuOnly}
              />
            </div>

            <div
              className="rounded-lg p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <ConfigPanel onChange={setConfig} />
            </div>
          </div>

          {/* Right: devices */}
          <div className="w-full lg:w-[280px] flex flex-col gap-3">
            <div
              className="rounded-lg p-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="text-[10px] font-bold font-mono uppercase tracking-widest mb-3" style={{ color: '#8a5555' }}>
                Devices ({devices.filter(d => d.status !== 'dropped').length})
              </div>
              {devices.length === 0 ? (
                <EmptyDevicesGuide sessionId={sessionId} />
              ) : (
                <div className="flex flex-col gap-3">
                  {devices.map(d => <DeviceCard key={d.deviceId} device={d} />)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fallback start button */}
        {!showStickyBar && (
          <div className="mt-4 flex flex-col items-center gap-2">
            {trainingError && <p className="text-xs font-mono" style={{ color: '#ff4444' }}>{trainingError}</p>}
            <Button variant="primary" size="lg" loading={startLoading || mockRunning} onClick={handleStart} className="min-w-[220px]">
              ▶ Start Training
            </Button>
            <p className="text-xs font-mono" style={{ color: '#4a2a2a' }}>Upload a dataset to enable training</p>
          </div>
        )}

        {/* ── STICKY START BAR ─────────────────────────────── */}
        {showStickyBar && (
          <div
            className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
            style={{
              background: 'rgba(15,8,8,0.95)',
              backdropFilter: 'blur(10px)',
              borderTop: '1px solid rgba(255,107,107,0.2)',
              boxShadow: '0 -4px 20px rgba(255,107,107,0.1)',
            }}
          >
            <div className="flex items-center gap-4 text-xs font-mono" style={{ color: '#8a5555' }}>
              <span style={{ color: '#ff6b6b' }}>✓ Dataset ready</span>
              <span>·</span>
              <span style={{ color: '#ffe8e8' }}>{modelType.replace(/_/g, ' ')}</span>
              <span>·</span>
              <span>{config.numRounds} rounds · lr={config.learningRate}</span>
            </div>
            <Button variant="primary" size="md" loading={startLoading || mockRunning} onClick={handleStart}>
              ▶ Start Training
            </Button>
          </div>
        )}
      </PageWrapper>
    )
  }

  /* ── TRAINING PHASE ───────────────────────────────────── */
  if (job.status === 'training') {
    return (
      <PageWrapper title="Training — In Progress">
        <RoundFlash round={job.roundsCompleted} />

        <div className="flex justify-end mb-3">
          <Button variant="danger" size="sm" onClick={resetJob}>✖ Abort</Button>
        </div>

        <RoundProgress
          currentRound={job.roundsCompleted}
          totalRounds={job.totalRounds}
          estimatedTimeRemaining={job.estimatedTimeRemaining}
        />

        <div className="flex flex-col lg:flex-row gap-4 mt-4">
          <div className="flex-1" style={{ minHeight: 340 }}>
            <LossGraph lossHistory={job.lossHistory} accuracyHistory={job.accuracyHistory} />
          </div>

          <div className="w-full lg:w-[300px] flex flex-col gap-3">
            <DeviceContribution deviceContributions={job.deviceContributions} />
            <div
              className="rounded-lg p-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="text-[10px] font-bold font-mono uppercase tracking-widest mb-3" style={{ color: '#8a5555' }}>Live Devices</div>
              <div className="flex flex-col gap-2">
                {devices.map(d => <DeviceCard key={d.deviceId} device={d} />)}
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    )
  }

  /* ── COMPLETE PHASE ───────────────────────────────────── */
  return (
    <PageWrapper title="Training — Complete">
      <div className="flex flex-col gap-5">
        <div style={{ minHeight: 340 }}>
          <LossGraph lossHistory={job.lossHistory} accuracyHistory={job.accuracyHistory} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Final Accuracy', value: formatScore(job.finalAccuracy), color: '#ff6b6b' },
            { label: 'Total Rounds',   value: `${job.roundsCompleted}`,       color: '#00d4ff' },
            { label: 'Total Time',     value: totalTime ? formatDuration(totalTime) : '—', color: '#a78bfa' },
            { label: 'Devices Used',   value: `${job.deviceContributions?.length || devices.length}`, color: '#00ff88' },
          ].map(s => (
            <div key={s.label} className="rounded-lg p-4 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-bold font-mono mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs" style={{ color: '#8a5555' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 justify-center mt-2">
          <Button variant="secondary" onClick={() => {}}>↓ Download Model (.pt)</Button>
          <Button variant="secondary" onClick={() => {}}>↓ Download Results PDF</Button>
          <Button variant="primary" onClick={resetJob}>+ Start New Training</Button>
        </div>
      </div>
    </PageWrapper>
  )
}
