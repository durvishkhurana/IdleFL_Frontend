/**
 * Scores a device from 0 to 1 based on compute resources.
 * Score = 0.25*(1-cpu) + 0.25*freeRam + 0.25*reliability - 0.25*activeTasks (normalized)
 *
 * @param {object} device
 * @param {number} device.cpuUsage       0-1
 * @param {number} device.freeRamRatio   0-1 (free / total)
 * @param {number} device.reliability    0-1
 * @param {number} device.activeTasks    integer (0-4+)
 */
export function scoreDevice(device) {
  const { cpuUsage = 0, freeRamRatio = 0, reliability = 1, activeTasks = 0 } = device
  const cpuFactor       = 1 - Math.min(1, cpuUsage)
  const ramFactor       = Math.min(1, freeRamRatio)
  const reliabilityFactor = Math.min(1, reliability)
  const taskFactor      = Math.max(0, 1 - activeTasks / 4)

  const score = 0.25 * cpuFactor + 0.25 * ramFactor + 0.25 * reliabilityFactor - 0.25 * (1 - taskFactor)
  return Math.max(0, Math.min(1, score))
}

/**
 * Returns the compute label for a device.
 * Prefers backend `computeType` (CUDA | MPS | CPU); falls back to legacy hasGpu/gpuType.
 * @param {object} device
 * @returns {'CUDA'|'MPS'|'CPU'}
 */
export function getComputeLabel(device) {
  const ct = device.computeType
  if (ct === 'CUDA' || ct === 'cuda') return 'CUDA'
  if (ct === 'MPS' || ct === 'mps') return 'MPS'
  if (ct === 'CPU' || ct === 'cpu') return 'CPU'
  if (device.hasGpu && device.gpuType === 'cuda') return 'CUDA'
  if (device.hasGpu && device.gpuType === 'mps') return 'MPS'
  return 'CPU'
}

/**
 * @param {number} score 0-1
 * @returns {'green'|'amber'|'red'}
 */
export function getScoreColor(score) {
  if (score >= 0.7) return 'green'
  if (score >= 0.3) return 'amber'
  return 'red'
}
