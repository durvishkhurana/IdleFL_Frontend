import { useEffect, useRef } from 'react'
import {
  Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale,
  Legend, Tooltip, Filler
} from 'chart.js'
import { applyChartDefaults, GREEN_DATASET_STYLE, CYAN_DATASET_STYLE } from '../../utils/chartDefaults'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip, Filler)
applyChartDefaults()

export default function LossGraph({ lossHistory = [], accuracyHistory = [], modelType }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  const labels = lossHistory.map((_, i) => `R${i + 1}`)
  const metricLabel = modelType === 'LINEAR_REGRESSION' ? 'R² Score' : 'Accuracy'

  useEffect(() => {
    if (!canvasRef.current) return

    if (chartRef.current) {
      chartRef.current.data.labels = labels
      chartRef.current.data.datasets[0].data = lossHistory
      chartRef.current.data.datasets[1].data = accuracyHistory
      chartRef.current.data.datasets[1].label = metricLabel
      chartRef.current.update('active')
      return
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Loss',
            data: lossHistory,
            ...GREEN_DATASET_STYLE,
            fill: true,
          },
          {
            label: metricLabel,
            data: accuracyHistory,
            ...CYAN_DATASET_STYLE,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 500 },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#555', font: { family: '"JetBrains Mono"', size: 11 } },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#555', font: { family: '"JetBrains Mono"', size: 11 } },
          },
        },
        plugins: {
          legend: { position: 'top', align: 'end' },
          tooltip: {
            callbacks: {
              title: (items) => `Round ${items[0].dataIndex + 1}`,
            },
          },
        },
      },
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [])

  // Update chart reactively
  useEffect(() => {
    if (!chartRef.current) return
    chartRef.current.data.labels = lossHistory.map((_, i) => `R${i + 1}`)
    chartRef.current.data.datasets[0].data = lossHistory
    chartRef.current.data.datasets[1].data = accuracyHistory
    chartRef.current.data.datasets[1].label = metricLabel
    chartRef.current.update('active')
  }, [lossHistory, accuracyHistory, metricLabel])

  return (
    <div
      className="rounded-lg p-5 h-full"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <h3 className="text-sm font-bold font-mono mb-4" style={{ color: '#ff6b6b' }}>Training Metrics</h3>
      <div className="relative" style={{ height: 280 }}>
        <canvas ref={canvasRef} />
        {lossHistory.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs font-mono" style={{ color: '#4a2a2a' }}>Waiting for training data...</span>
          </div>
        )}
      </div>
    </div>
  )
}
