import useSessionStore from '../store/sessionStore'
import { getComputeLabel } from '../utils/deviceScoring'

export function useDevices() {
  const devices = useSessionStore((s) => s.connectedDevices)

  const activeDevices = devices.filter((d) => d.status !== 'dropped')
  const gpuDevices = activeDevices.filter((d) => d.hasGpu)
  const cpuOnlyDevices = activeDevices.filter((d) => !d.hasGpu)

  const hasMajorityCpuOnly = cpuOnlyDevices.length > gpuDevices.length
  const hasGpuDevice = gpuDevices.length > 0

  const devicesWithLabel = devices.map((d) => ({
    ...d,
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
