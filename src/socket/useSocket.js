import { useEffect, useState } from 'react'
import socket from './socket'
import useAuthStore from '../store/authStore'
import { useSessionStore } from '../store/sessionStore'
import useJobStore from '../store/jobStore'

export function useSocket() {
  const [isConnected, setIsConnected] = useState(socket.connected)
  const token = useAuthStore((s) => s.token)
  const sessionId = useSessionStore((s) => s.sessionId)
  const { addDevice, updateDevice, removeDevice } = useSessionStore()
  const { updateRound, completeJob } = useJobStore()

  useEffect(() => {
    if (!token) return

    const sessionIdFromStore = useSessionStore.getState().sessionId
    socket.connect()
    if (sessionIdFromStore) {
      socket.emit('join:session', sessionIdFromStore)
    }

    function onConnect() { setIsConnected(true) }
    function onDisconnect() { setIsConnected(false) }

    function onDeviceJoined(data) {
      const device = data.device ?? data
      addDevice({
        deviceId: device.id,
        deviceName: device.deviceName,
        os: device.os,
        computeType: device.computeType,
        computeScore: device.computeScore,
        status: 'active',
      })
    }

    function onDeviceUpdated(data) {
      updateDevice(data.deviceId, data)
    }

    function onDeviceDropped(data) {
      const deviceId = data.deviceId ?? data.device?.id ?? data.id
      if (deviceId) removeDevice(deviceId)
    }

    function onRoundComplete(data) {
      // data: { round, loss, accuracy, deviceContributions, estimatedTimeRemaining }
      updateRound(data)
      useSessionStore.getState().updateTrainingProgress(data.round, data.totalRounds ?? useSessionStore.getState().totalRounds)
    }

    function onTrainingComplete(data) {
      completeJob(data?.finalAccuracy)
    }

    function onTrainingStarted(data) {
      useJobStore.setState(() => ({
        status: 'RUNNING',
        ...(data?.jobId != null && data.jobId !== '' && { jobId: data.jobId }),
        ...(data?.modelType && { modelType: data.modelType }),
        ...(data?.numRounds != null && Number.isFinite(Number(data.numRounds)) && { totalRounds: Number(data.numRounds) }),
      }))
    }

    function onTrainingPaused() {
      useJobStore.getState().setJobStatus('PAUSED')
    }

    function onTrainingAborted() {
      useJobStore.getState().setJobStatus('ABORTED')
    }

    function onTrainingTaskReassigned(data) {
      console.warn('[training:task_reassigned]', data)
    }

    function onHeartbeat(data) {
      // data: { deviceId, cpuUsage, freeRamRatio, gpuUsage, reliability, ... }
      if (data?.deviceId) {
        updateDevice(data.deviceId, data)
      }
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('device:joined', onDeviceJoined)
    socket.on('device:status_update', onDeviceUpdated)
    socket.on('device:disconnected', onDeviceDropped)
    socket.on('training:round_complete', onRoundComplete)
    socket.on('training:complete', onTrainingComplete)
    socket.on('training:started', onTrainingStarted)
    socket.on('training:paused', onTrainingPaused)
    socket.on('training:aborted', onTrainingAborted)
    socket.on('training:task_reassigned', onTrainingTaskReassigned)
    socket.on('heartbeat:received', onHeartbeat)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('device:joined', onDeviceJoined)
      socket.off('device:status_update', onDeviceUpdated)
      socket.off('device:disconnected', onDeviceDropped)
      socket.off('training:round_complete', onRoundComplete)
      socket.off('training:complete', onTrainingComplete)
      socket.off('training:started', onTrainingStarted)
      socket.off('training:paused', onTrainingPaused)
      socket.off('training:aborted', onTrainingAborted)
      socket.off('training:task_reassigned', onTrainingTaskReassigned)
      socket.off('heartbeat:received', onHeartbeat)
      socket.disconnect()
    }
  }, [token])

  useEffect(() => {
    if (!sessionId || !socket.connected) return
    socket.emit('join:session', sessionId)
  }, [sessionId])

  return { socket, isConnected }
}
