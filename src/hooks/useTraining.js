import { useState } from 'react'
import useJobStore from '../store/jobStore'
import useSessionStore from '../store/sessionStore'
import { startTraining as startTrainingApi } from '../api/training.api'

export function useTraining() {
  const job = useJobStore()
  const { sessionId } = useSessionStore()
  const { startJob, resetJob } = useJobStore()
  const [startLoading, setStartLoading] = useState(false)
  const [error, setError] = useState(null)

  const isTraining = job.status === 'training'

  const startTraining = async ({ modelType, config, datasetFile }) => {
    const demo = import.meta.env.VITE_DEMO_MODE === 'true'
    if (!demo && !datasetFile) {
      setError('Please select a dataset file first.')
      return { success: false, error: 'Please select a dataset file first.', validationFailed: true }
    }

    setStartLoading(true)
    setError(null)
    try {
      const res = await startTrainingApi({ sessionId, modelType, config, datasetFile })
      const jobId = res.data.job?.id ?? res.data.jobId
      startJob(jobId, modelType, config.numRounds ?? 10)
      return { success: true, data: res.data }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to start training.'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setStartLoading(false)
    }
  }

  return {
    job,
    isTraining,
    startLoading,
    error,
    setError,
    startTraining,
    resetJob,
    clearError: () => setError(null),
  }
}
