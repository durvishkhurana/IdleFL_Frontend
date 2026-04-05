import useSessionStore from '../store/sessionStore'
import { getComputeLabel } from '../utils/deviceScoring'

export function useDevices() {
  const devices = useSessionStore((s) => s.connectedDevices)

  const activeDevices = devices.filter((d) => d.status !== 'dropped')
  const gpuDevices = activeDevices.filter(
    (d) => d.hasGpu || d.computeType === 'CUDA' || d.computeType === 'MPS'
  )
  const cpuOnlyDevices = activeDevices.filter((d) => getComputeLabel(d) === 'CPU')

  const cpuOnlyCount = cpuOnlyDevices.length
  const hasMajorityCpuOnly =
    activeDevices.length > 0 && cpuOnlyCount > activeDevices.length / 2
  const hasGpuDevice = gpuDevices.length > 0

  const devicesWithLabel = devices.map((d) => ({
    ...d,
    name: d.name ?? d.deviceName,
    hasGpu: d.hasGpu ?? (d.computeType === 'CUDA' || d.computeType === 'MPS'),
    computeLabel: getComputeLabel(d),
  }))

  return {
    devices: devicesWithLabel,
    activeDevices,
    gpuDevices,
    cpuOnlyDevices,
    hasMajorityCpuOnly,
    hasGpuDevice,
  }
}
