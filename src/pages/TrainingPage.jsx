import { useState, useEffect, useRef } from 'react'
import { jsPDF } from 'jspdf'
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
import { downloadModel } from '../api/training.api'
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

  const { job, startTraining, resetJob, error: trainingError, setError: setTrainingError } = useTraining()
  const { devices, hasMajorityCpuOnly } = useDevices()
  const sessionId = useSessionStore((s) => s.sessionId)
  const connectedDevices = useSessionStore((s) => s.connectedDevices)
  const { startMock, mockRunning } = useMockTraining()

  const [modelType, setModelType] = useState('LINEAR_REGRESSION')
  const [config, setConfig] = useState({ learningRate: 0.01, numRounds: 10, batchSize: 32 })
  const [datasetFile, setDatasetFile] = useState(null)
  const [datasetUploaded, setDatasetUploaded] = useState(false)
  const [startLoading, setStartLoading] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [modelDownloadLoading, setModelDownloadLoading] = useState(false)
  const [modelDownloadError, setModelDownloadError] = useState(null)

  // Show sticky bar when dataset selected (or demo mode)
  useEffect(() => {
    setShowStickyBar(datasetUploaded || DEMO_MODE)
  }, [datasetUploaded])

  useEffect(() => {
    if (DEMO_MODE) setDatasetUploaded(true)
  }, [])

  useEffect(() => {
    if (DEMO_MODE) return
    setDatasetFile(null)
    setDatasetUploaded(false)
  }, [modelType])

  const handleFileReady = (file) => {
    setDatasetFile(file)
    setDatasetUploaded(true)
  }

  const handleStart = async () => {
    setStartLoading(true)
    setTrainingError(null)
    const res = await startTraining({ modelType, config, datasetFile })
    if (!res.success && !res.validationFailed) {
      const { startJob } = useJobStore.getState()
      startJob(`JOB-${Date.now()}`, modelType, config.numRounds)
      startMock(config.numRounds)
    }
    setStartLoading(false)
  }

  const handleDownloadModel = async () => {
    if (!job.jobId) return
    console.log('[training] download model request jobId:', job.jobId)
    setModelDownloadLoading(true)
    setModelDownloadError(null)
    try {
      const res = await downloadModel(job.jobId)
      const blob = new Blob([res.data])
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `idlefl_model_${job.jobId}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      let msg = err.message || 'Download failed'
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text()
          const parsed = JSON.parse(text)
          msg = parsed.error || parsed.message || msg
        } catch {
          /* keep msg */
        }
      } else if (err.response?.data?.error) {
        msg = err.response.data.error
      } else if (err.response?.data?.message) {
        msg = err.response.data.message
      }
      setModelDownloadError(msg)
    } finally {
      setModelDownloadLoading(false)
    }
  }

  useEffect(() => {
    if (!modelDownloadError) return
    const t = setTimeout(() => setModelDownloadError(null), 5000)
    return () => clearTimeout(t)
  }, [modelDownloadError])

  const handleDownloadPdf = () => {
    const jobId = job.jobId || 'N/A'
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const marginL = 14

    // ── Header ──────────────────────────────────────────────
    doc.setFontSize(20)
    doc.setTextColor(255, 107, 107)
    doc.text('IdleFL Training Results', marginL, 20)

    doc.setFontSize(9)
    doc.setTextColor(120, 120, 120)
    doc.text(`Session ID: ${sessionId || 'N/A'}`, marginL, 30)
    doc.text(`Job ID: ${jobId}`, marginL, 35)

    // ── Model & hyperparameters ──────────────────────────────
    doc.setFontSize(13)
    doc.setTextColor(40, 40, 40)
    doc.text('Model & Hyperparameters', marginL, 47)

    doc.setFontSize(9)
    doc.setTextColor(60, 60, 60)
    const hyperRows = [
      ['Model Type', job.modelType || modelType || 'N/A'],
      ['Rounds',     String(config.numRounds)],
      ['Learning Rate', String(config.learningRate)],
      ['Batch Size', String(config.batchSize)],
    ]
    hyperRows.forEach(([label, value], i) => {
      doc.text(`${label}:`, marginL, 54 + i * 6)
      doc.text(value, marginL + 42, 54 + i * 6)
    })

    // ── Round-by-round results table ─────────────────────────
    let y = 82
    doc.setFontSize(13)
    doc.setTextColor(40, 40, 40)
    doc.text('Round Results', marginL, y)
    y += 7

    const colX = [marginL, marginL + 30, marginL + 85]
    const colW = [30, 55, 60]
    const rowH = 6

    // Table header
    doc.setFillColor(40, 40, 40)
    doc.rect(marginL, y, colW[0] + colW[1] + colW[2], rowH, 'F')
    doc.setFontSize(8)
    doc.setTextColor(255, 255, 255)
    ;['Round', 'Loss', 'Accuracy'].forEach((h, i) => {
      doc.text(h, colX[i] + 2, y + 4)
    })
    y += rowH

    doc.setFontSize(8)
    job.lossHistory.forEach((loss, idx) => {
      const acc = job.accuracyHistory[idx] ?? 0
      const cells = [`${idx + 1}`, loss.toFixed(4), `${(acc * 100).toFixed(2)}%`]
      doc.setFillColor(idx % 2 === 0 ? 245 : 255, idx % 2 === 0 ? 245 : 255, idx % 2 === 0 ? 245 : 255)
      doc.rect(marginL, y, colW[0] + colW[1] + colW[2], rowH, 'F')
      doc.setTextColor(40, 40, 40)
      cells.forEach((cell, i) => doc.text(cell, colX[i] + 2, y + 4))
      y += rowH
      if (y > 270) { doc.addPage(); y = 20 }
    })

    // ── Chart image ──────────────────────────────────────────
    const canvas = document.querySelector('canvas')
    if (canvas) {
      try {
        const imgData = canvas.toDataURL('image/png')
        y += 8
        if (y + 85 > 280) { doc.addPage(); y = 20 }
        doc.setFontSize(13)
        doc.setTextColor(40, 40, 40)
        doc.text('Final Accuracy vs Rounds', marginL, y)
        y += 6
        doc.addImage(imgData, 'PNG', marginL, y, pageW - marginL * 2, 80)
        y += 88
      } catch {
        // canvas unavailable — skip chart
      }
    }

    // ── Footer on every page ─────────────────────────────────
    const totalPages = doc.getNumberOfPages()
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p)
      doc.setFontSize(8)
      doc.setTextColor(160, 160, 160)
      doc.text('Generated by IdleFL · idlefl.dev', marginL, doc.internal.pageSize.getHeight() - 8)
    }

    doc.save(`idlefl_results_${jobId}.pdf`)
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
              <DatasetUpload key={modelType} onFileReady={handleFileReady} modelType={modelType} />
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
  if (['training', 'RUNNING', 'PAUSED'].includes(job.status)) {
    return (
      <PageWrapper title="Training — In Progress">
        <RoundFlash round={job.roundsCompleted} />

        <div className="flex justify-end mb-3">
          <Button variant="danger" size="sm" onClick={resetJob}>✖ Abort</Button>
        </div>

        <RoundProgress
          currentRound={job.roundsCompleted}
          totalRounds={job.totalRounds}
        />

        <div className="flex flex-col lg:flex-row gap-4 mt-4">
          <div className="flex-1" style={{ minHeight: 340 }}>
            <LossGraph lossHistory={job.lossHistory} accuracyHistory={job.accuracyHistory} />
          </div>

          <div className="w-full lg:w-[300px] flex flex-col gap-3">
            <DeviceContribution
              deviceContributions={job.deviceContributions}
              devices={devices}
              connectedDevices={connectedDevices}
            />
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

  /* ── ABORTED ───────────────────────────────────────────── */
  if (job.status === 'ABORTED') {
    return (
      <PageWrapper title="Training — Aborted">
        <p className="text-sm font-mono mb-4" style={{ color: '#8a5555' }}>
          Training was aborted.
        </p>
        <Button variant="primary" onClick={resetJob}>+ Start New Training</Button>
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
          <Button variant="secondary" loading={modelDownloadLoading} onClick={handleDownloadModel}>↓ Download Model (JSON)</Button>
          <Button variant="secondary" onClick={handleDownloadPdf}>↓ Download Results PDF</Button>
          <Button variant="primary" onClick={resetJob}>+ Start New Training</Button>
        </div>
        <p className="text-center text-xs font-mono mt-1" style={{ color: '#4a2a2a' }}>
          JSON format — importable via numpy/PyTorch
        </p>
        {modelDownloadError && (
          <div
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-2 text-xs font-mono shadow-lg fade-in"
            style={{
              background: 'rgba(40,10,10,0.95)',
              border: '1px solid rgba(255,68,68,0.45)',
              color: '#ff6666',
              maxWidth: 'min(90vw, 420px)',
            }}
            role="alert"
          >
            {modelDownloadError}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
