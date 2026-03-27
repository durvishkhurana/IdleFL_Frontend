import { useState } from 'react'
import useJobStore from '../store/jobStore'
import useSessionStore from '../store/sessionStore'
import { uploadDataset as uploadDatasetApi, startTraining as startTrainingApi } from '../api/training.api'

export function useTraining() {
  const job = useJobStore()
  const { sessionId } = useSessionStore()
  const { startJob, resetJob } = useJobStore()
  const [uploadLoading, setUploadLoading] = useState(false)
  const [startLoading, setStartLoading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)

  const isTraining = job.status === 'training'

  const uploadDataset = async (formData) => {
    setUploadLoading(true)
    setError(null)
    try {
      const res = await uploadDatasetApi(formData)
      setUploadedFile(res.data)
      return { success: true, data: res.data }
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed.'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setUploadLoading(false)
    }
  }

  const startTraining = async ({ modelType, config }) => {
    setStartLoading(true)
    setError(null)
    try {
      const res = await startTrainingApi({ sessionId, modelType, config })
      startJob(res.data.jobId, modelType, config.numRounds ?? 10)
      return { success: true, data: res.data }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to start training.'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setStartLoading(false)
    }
  }

  return {
    job,
    uploadedFile,
    isTraining,
    uploadLoading,
    startLoading,
    error,
    uploadDataset,
    startTraining,
    resetJob,
    clearError: () => setError(null),
  }
}
