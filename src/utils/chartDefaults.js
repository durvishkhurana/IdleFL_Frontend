/**
 * Global Chart.js defaults for IdleFL — Coral Red theme.
 */
import { defaults } from 'chart.js'

export function applyChartDefaults() {
  defaults.color = '#666'
  defaults.borderColor = 'rgba(255,255,255,0.04)'
  defaults.font.family = '"JetBrains Mono", monospace'
  defaults.font.size = 11

  defaults.plugins.legend.labels.color = '#8a5555'
  defaults.plugins.legend.labels.usePointStyle = true
  defaults.plugins.legend.labels.pointStyleWidth = 8

  defaults.plugins.tooltip.backgroundColor = '#1f1010'
  defaults.plugins.tooltip.borderColor = 'rgba(255,107,107,0.3)'
  defaults.plugins.tooltip.borderWidth = 1
  defaults.plugins.tooltip.titleColor = '#ff6b6b'
  defaults.plugins.tooltip.bodyColor = '#ffe8e8'
  defaults.plugins.tooltip.padding = 10
  defaults.plugins.tooltip.cornerRadius = 4
  defaults.plugins.tooltip.titleFont = { family: '"JetBrains Mono"', size: 12 }
  defaults.plugins.tooltip.bodyFont = { family: '"JetBrains Mono"', size: 11 }
}

export const GREEN_DATASET_STYLE = {
  borderColor: '#ff6b6b',
  backgroundColor: 'rgba(255,107,107,0.08)',
  pointBackgroundColor: '#ff6b6b',
  pointBorderColor: '#ff6b6b',
  pointRadius: 3,
  tension: 0.4,
}

export const CYAN_DATASET_STYLE = {
  borderColor: '#00d4ff',
  backgroundColor: 'rgba(0,212,255,0.06)',
  pointBackgroundColor: '#00d4ff',
  pointBorderColor: '#00d4ff',
  pointRadius: 3,
  tension: 0.4,
}
