import { useState, useEffect, useRef } from 'react'
import { jsPDF } from 'jspdf'
import Papa from 'papaparse'
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
import useSessionStore from '../store/sessionStore'
import { accuracyLabelForModel, formatAccuracyForModel, formatDuration } from '../utils/formatters'
import { Link } from 'react-router-dom'

/* ─── Round flash callout ─────────────────────────────────── */
function RoundFlash({ round }) {
  if (!round || round <= 0) return null
  return (
    <div
      key={round}
      className="fixed top-20 right-6 z-50 rounded-lg px-4 py-2 text-sm font-mono font-bold"
      style={{
        background: 'rgba(255,107,107,0.1)',
        border: '1px solid rgba(255,107,107,0.4)',
        color: '#ff6b6b',
        boxShadow: '0 0 20px rgba(255,107,107,0.2)',
        animation: 'fadeInScale 0.2s ease both, fadeOut 0.4s ease 1.6s forwards',
      }}
    >
      ⚡ FedAvg Round {round} complete
    </div>
  )
}

/* ─── Infrastructure / deployment disclaimer ───────────────── */
function InfrastructureBrief({ className = '' }) {
  return (
    <div className={`infra-brief-callout ${className}`} role="note">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="badge-tech-info">Technical Info</span>
      </div>
      <p>
        <strong>Technical Note:</strong>{' '}
        This deployment utilizes free-tier cloud instances. While the Federated Learning architecture is fully functional,
        large model weight transfers (CNNs) may experience latency due to cloud bandwidth throttling. Tabular models are
        recommended for rapid demonstration.
      </p>
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
  useSocket()

  const { job, startTraining, resetJob, error: trainingError, setError: setTrainingError } = useTraining()
  const { devices, hasMajorityCpuOnly } = useDevices()
  const sessionId = useSessionStore((s) => s.sessionId)
  const [modelType, setModelType] = useState('LINEAR_REGRESSION')
  const [config, setConfig] = useState({ learningRate: 0.01, numRounds: 10, batchSize: 32 })
  const [datasetMeta, setDatasetMeta] = useState(null)
  const [datasetUploaded, setDatasetUploaded] = useState(false)
  const [startLoading, setStartLoading] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [modelDownloadLoading, setModelDownloadLoading] = useState(false)
  const [modelDownloadError, setModelDownloadError] = useState(null)

  useEffect(() => {
    setShowStickyBar(datasetUploaded)
  }, [datasetUploaded])

  useEffect(() => {
    setDatasetMeta(null)
    setDatasetUploaded(false)
  }, [modelType])

  const handleFileReady = async (file) => {
    setDatasetMeta(null)

    const meta = await new Promise((resolve, reject) => {
      let rowCount = 0
      let header = null
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        worker: true,
        step: (results) => {
          const row = results.data
          if (!header) {
            header = row
          } else {
            rowCount += 1
          }
        },
        complete: () => {
          if (!Array.isArray(header) || header.length < 2) {
            reject(new Error('Malformed CSV: expected header with at least 2 columns'))
            return
          }
          const columnNames = header.map((c) => String(c).trim())
          const numFeatures = Math.max(0, columnNames.length - 1)
          resolve({
            totalRows: rowCount,
            numFeatures,
            columnNames: JSON.stringify(columnNames),
          })
        },
        error: (err) => reject(err),
      })
    })

    console.log('[training] extracted CSV metadata:', meta)
    setDatasetMeta(meta)
    setDatasetUploaded(true)
  }

  const handleStart = async () => {
    setStartLoading(true)
    setTrainingError(null)
    const cnnMeta =
      modelType === 'CNN'
        ? {
            datasetPath: 'mnist.zip',
            totalRows: null,
            numFeatures: null,
            columnNames: null,
            datasetHash: null,
          }
        : null

    await startTraining({ modelType, config, datasetMeta: modelType === 'CNN' ? cnnMeta : datasetMeta })
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
    ;['Round', 'Loss', accuracyLabelForModel(job.modelType || modelType)].forEach((h, i) => {
      doc.text(h, colX[i] + 2, y + 4)
    })
    y += rowH

    doc.setFontSize(8)
    job.lossHistory.forEach((loss, idx) => {
      const acc = job.accuracyHistory[idx] ?? 0
      const cells = [`${idx + 1}`, loss.toFixed(4), formatAccuracyForModel(acc, job.modelType || modelType)]
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
        doc.text(`Final ${accuracyLabelForModel(job.modelType || modelType)} vs Rounds`, marginL, y)
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
              <InfrastructureBrief className="mt-4" />
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
            <Button variant="primary" size="lg" loading={startLoading} onClick={handleStart} className="min-w-[220px]">
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
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0 flex-1">
              <div className="flex items-center gap-4 text-xs font-mono shrink-0" style={{ color: '#8a5555' }}>
                <span style={{ color: '#ff6b6b' }}>✓ Dataset ready</span>
                <span>·</span>
                <span style={{ color: '#ffe8e8' }}>{modelType.replace(/_/g, ' ')}</span>
                <span>·</span>
                <span>{config.numRounds} rounds · lr={config.learningRate}</span>
              </div>
              <div className="hidden lg:block min-w-0 max-w-xl flex-1">
                <InfrastructureBrief className="!py-2 !px-3" />
              </div>
            </div>
            <Button variant="primary" size="md" loading={startLoading} onClick={handleStart}>
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
          participatingDevices={job.participatingDevices}
          assignedDevices={job.assignedDevices}
        />

        <div className="mt-2 text-xs font-mono text-[#555]">
          {job.mu != null && Number(job.mu) > 0
            ? `Regularization: FedProx (μ=${job.mu})`
            : 'Regularization: FedAvg'}
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mt-4">
          <div className="flex-1" style={{ minHeight: 340 }}>
            <LossGraph lossHistory={job.lossHistory} accuracyHistory={job.accuracyHistory} modelType={job.modelType} />
          </div>

          <div className="w-full lg:w-[300px] flex flex-col gap-3">
            <DeviceContribution deviceContributions={job.deviceContributions} devices={devices} />
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
          <LossGraph lossHistory={job.lossHistory} accuracyHistory={job.accuracyHistory} modelType={job.modelType} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: accuracyLabelForModel(job.modelType || modelType),
              value: formatAccuracyForModel(job.finalAccuracy, job.modelType || modelType),
              color: '#ff6b6b',
            },
            { label: 'Total Rounds',   value: `${job.roundsCompleted}`,       color: '#00d4ff' },
            { label: 'Total Time',     value: totalTime ? formatDuration(totalTime) : '—', color: '#a78bfa' },
            {
            label: 'Devices Used',
            value:
              job.deviceContributions?.length > 0
                ? `${job.deviceContributions.length}`
                : '—',
            color: '#00ff88',
          },
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
