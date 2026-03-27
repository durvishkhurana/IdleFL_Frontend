/**
 * Demo mode utilities — pre-populates stores with mock data.
 * Activated when VITE_DEMO_MODE=true in .env
 */

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

export const DEMO_DEVICES = [
  {
    deviceId: 'demo-dev-1',
    name: 'Laptop Alpha',
    os: 'windows',
    status: 'active',
    hasGpu: true,
    gpuType: 'cuda',
    cpuUsage: 0.32,
    freeRamRatio: 0.58,
    gpuUsage: 0.45,
    reliability: 0.95,
    activeTasks: 1,
    latencyMs: 28,
    gpuMemUsed: 4.2,
    gpuMemTotal: 8.0,
    shardSamples: 2400,
  },
  {
    deviceId: 'demo-dev-2',
    name: 'MacBook Pro',
    os: 'mac',
    status: 'active',
    hasGpu: true,
    gpuType: 'mps',
    cpuUsage: 0.18,
    freeRamRatio: 0.72,
    gpuUsage: 0.3,
    reliability: 0.99,
    activeTasks: 0,
    latencyMs: 12,
    gpuMemUsed: 2.1,
    gpuMemTotal: 8.0,
    shardSamples: 2400,
  },
  {
    deviceId: 'demo-dev-3',
    name: 'Ubuntu Workstation',
    os: 'linux',
    status: 'idle',
    hasGpu: false,
    gpuType: null,
    cpuUsage: 0.55,
    freeRamRatio: 0.38,
    gpuUsage: null,
    reliability: 0.88,
    activeTasks: 2,
    latencyMs: 95,
    gpuMemUsed: null,
    gpuMemTotal: null,
    shardSamples: 1600,
  },
]

// Pre-computed training curve for demo replay
export function generateDemoTrainingData(rounds = 10) {
  const result = []
  let loss = 1.0
  let accuracy = 0.48
  for (let i = 1; i <= rounds; i++) {
    loss = Math.max(0.05, loss - 0.085 - Math.random() * 0.02)
    accuracy = Math.min(0.98, accuracy + 0.042 + Math.random() * 0.01)
    result.push({
      round: i,
      loss: +loss.toFixed(4),
      accuracy: +accuracy.toFixed(4),
      deviceContributions: DEMO_DEVICES.map(d => ({
        deviceId: d.deviceId,
        name: d.name,
        samples: d.shardSamples,
      })),
      estimatedTimeRemaining: (rounds - i) * 3,
    })
  }
  return result
}
